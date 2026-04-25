import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";
import { sendPasswordResetEmail } from "@/lib/mail";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email } = body;

        if (!email) {
            return NextResponse.json(
                { success: false, message: "Email wajib diisi." },
                { status: 400 }
            );
        }

        // Check if admin exists
        const [rows] = await pool.execute<RowDataPacket[]>(
            "SELECT id FROM admins WHERE email = ?",
            [email]
        );

        // We still return success even if email not found to prevent email enumeration
        if (!Array.isArray(rows) || rows.length === 0) {
            return NextResponse.json({
                success: true,
                message: "Jika email terdaftar, tautan reset password akan dikirim.",
            });
        }

        // Generate token
        const token = crypto.randomBytes(32).toString("hex");

        // Upsert into password_resets
        await pool.execute(
            `INSERT INTO password_resets (email, token, expires_at) 
             VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 1 HOUR)) 
             ON DUPLICATE KEY UPDATE token = ?, expires_at = DATE_ADD(NOW(), INTERVAL 1 HOUR)`,
            [email, token, token]
        );

        // Generate absolute URL for the reset link
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;
        const resetLink = `${baseUrl}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

        // Send email
        await sendPasswordResetEmail(email, resetLink);

        return NextResponse.json({
            success: true,
            message: "Jika email terdaftar, tautan reset password akan dikirim.",
        });
    } catch (error) {
        console.error("Forgot password error:", error);
        return NextResponse.json(
            { success: false, message: "Terjadi kesalahan pada server." },
            { status: 500 }
        );
    }
}
