import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { verifyToken, verifyTOTP } from "@/lib/auth";
import type { RowDataPacket } from "mysql2";

export async function POST(request: NextRequest) {
    try {
        const tokenStr = request.cookies.get("auth_token")?.value;
        if (!tokenStr) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

        const payload = verifyToken(tokenStr);
        if (!payload) return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 });

        const body = await request.json();
        const { secret, totpCode, token } = body;

        if (!secret || !totpCode || !token) {
            return NextResponse.json({ success: false, message: "Secret, kode, dan token wajib diisi" }, { status: 400 });
        }

        // Get latest email from admins table to avoid stale JWT payload
        const [adminRows] = await pool.execute<RowDataPacket[]>(
            "SELECT email FROM admins WHERE id = ?",
            [payload.id]
        );

        if (!Array.isArray(adminRows) || adminRows.length === 0) {
            return NextResponse.json({ success: false, message: "Admin tidak ditemukan" }, { status: 404 });
        }

        const adminEmail = adminRows[0].email;

        // Verify token in DB
        const [rows] = await pool.execute<RowDataPacket[]>(
            "SELECT * FROM enable_2fa_tokens WHERE email = ? AND token = ?",
            [adminEmail, token]
        );

        if (!Array.isArray(rows) || rows.length === 0) {
            return NextResponse.json({ success: false, message: "Token aktivasi tidak valid." }, { status: 400 });
        }

        const resetRecord = rows[0];
        if (new Date(resetRecord.expires_at) < new Date()) {
            await pool.execute("DELETE FROM enable_2fa_tokens WHERE email = ?", [adminEmail]);
            return NextResponse.json({ success: false, message: "Token aktivasi sudah kedaluwarsa." }, { status: 400 });
        }

        const isValid = verifyTOTP(secret, totpCode);

        if (!isValid) {
            return NextResponse.json({ success: false, message: "Kode 6-digit tidak valid" }, { status: 400 });
        }

        await pool.execute(
            "UPDATE admins SET totp_secret = ? WHERE id = ?",
            [secret, payload.id]
        );

        // Delete token after success
        await pool.execute("DELETE FROM enable_2fa_tokens WHERE email = ?", [adminEmail]);

        return NextResponse.json({
            success: true,
            message: "Google Authenticator berhasil diaktifkan"
        });
    } catch (error) {
        console.error("Enable 2FA error:", error);
        return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
    }
}
