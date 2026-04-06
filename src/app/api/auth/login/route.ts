import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import pool from "@/lib/db";
import { signToken, verifyTOTP } from "@/lib/auth";
import type { Admin } from "@/types/types";
import type { RowDataPacket } from "mysql2";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, password, totpCode } = body;

        // Validate required fields
        if (!email || !password) {
            return NextResponse.json(
                { success: false, message: "Email dan password wajib diisi." },
                { status: 400 }
            );
        }

        // Find admin by email
        const [rows] = await pool.execute<RowDataPacket[]>(
            "SELECT * FROM admins WHERE email = ? LIMIT 1",
            [email]
        );

        if (!rows || rows.length === 0) {
            return NextResponse.json(
                { success: false, message: "Email atau password salah." },
                { status: 401 }
            );
        }

        const admin = rows[0] as Admin;

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, admin.password);
        if (!isPasswordValid) {
            return NextResponse.json(
                { success: false, message: "Email atau password salah." },
                { status: 401 }
            );
        }

        // Step 1: If no TOTP code provided, request it
        if (!totpCode) {
            return NextResponse.json(
                {
                    success: false,
                    requireTOTP: true,
                    message: "Masukkan kode Google Authenticator.",
                },
                { status: 200 }
            );
        }

        // Step 2: Verify TOTP code
        const isTOTPValid = verifyTOTP(admin.totp_secret, totpCode);
        if (!isTOTPValid) {
            return NextResponse.json(
                { success: false, message: "Kode autentikasi tidak valid atau sudah kadaluarsa." },
                { status: 401 }
            );
        }

        // Generate JWT token
        const token = signToken({ id: admin.id, email: admin.email });

        // Set HttpOnly cookie
        const response = NextResponse.json(
            { success: true, message: "Login berhasil." },
            { status: 200 }
        );

        response.cookies.set("auth_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24, // 24 hours
            path: "/",
        });

        return response;
    } catch (error) {
        console.error("Login error:", error);
        return NextResponse.json(
            { success: false, message: "Terjadi kesalahan server." },
            { status: 500 }
        );
    }
}
