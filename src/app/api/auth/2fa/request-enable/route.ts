import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { sendEnable2FAEmail } from "@/lib/mail";
import type { RowDataPacket } from "mysql2";

export async function POST(request: NextRequest) {
    try {
        const token = request.cookies.get("auth_token")?.value;
        if (!token) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

        const payload = verifyToken(token);
        if (!payload) return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 });

        const body = await request.json();
        const { password } = body;

        if (!password) {
            return NextResponse.json({ success: false, message: "Password wajib diisi" }, { status: 400 });
        }

        const [rows] = await pool.execute<RowDataPacket[]>(
            "SELECT email, password FROM admins WHERE id = ?",
            [payload.id]
        );

        if (!Array.isArray(rows) || rows.length === 0) {
            return NextResponse.json({ success: false, message: "Admin tidak ditemukan" }, { status: 404 });
        }

        const admin = rows[0];
        const isValid = await bcrypt.compare(password, admin.password);

        if (!isValid) {
            return NextResponse.json({ success: false, message: "Password salah" }, { status: 401 });
        }

        // Generate token
        const enableToken = crypto.randomBytes(32).toString("hex");

        await pool.execute(
            `INSERT INTO enable_2fa_tokens (email, token, expires_at) 
             VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 15 MINUTE)) 
             ON DUPLICATE KEY UPDATE token = ?, expires_at = DATE_ADD(NOW(), INTERVAL 15 MINUTE)`,
            [admin.email, enableToken, enableToken]
        );

        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;
        const confirmLink = `${baseUrl}/setup-2fa?token=${enableToken}&email=${encodeURIComponent(admin.email)}`;

        await sendEnable2FAEmail(admin.email, confirmLink);

        return NextResponse.json({
            success: true,
            message: "Email instruksi setup 2FA telah dikirim."
        });
    } catch (error) {
        console.error("Request enable 2FA error:", error);
        return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
    }
}
