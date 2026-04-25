import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import type { RowDataPacket } from "mysql2";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, token } = body;

        if (!email || !token) {
            return NextResponse.json({ success: false, message: "Semua field wajib diisi." }, { status: 400 });
        }

        const [rows] = await pool.execute<RowDataPacket[]>(
            "SELECT * FROM disable_2fa_tokens WHERE email = ? AND token = ?",
            [email, token]
        );

        if (!Array.isArray(rows) || rows.length === 0) {
            return NextResponse.json({ success: false, message: "Token tidak valid atau sudah kedaluwarsa." }, { status: 400 });
        }

        const resetRecord = rows[0];
        if (new Date(resetRecord.expires_at) < new Date()) {
            await pool.execute("DELETE FROM disable_2fa_tokens WHERE email = ?", [email]);
            return NextResponse.json({ success: false, message: "Token sudah kedaluwarsa." }, { status: 400 });
        }

        // Disable 2FA
        await pool.execute(
            "UPDATE admins SET totp_secret = NULL WHERE email = ?",
            [email]
        );

        // Delete token
        await pool.execute("DELETE FROM disable_2fa_tokens WHERE email = ?", [email]);

        return NextResponse.json({
            success: true,
            message: "Google Authenticator berhasil dinonaktifkan.",
        });
    } catch (error) {
        console.error("Confirm disable 2FA error:", error);
        return NextResponse.json({ success: false, message: "Terjadi kesalahan pada server." }, { status: 500 });
    }
}
