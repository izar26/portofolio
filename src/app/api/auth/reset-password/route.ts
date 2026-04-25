import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, token, password } = body;

        if (!email || !token || !password) {
            return NextResponse.json(
                { success: false, message: "Semua field wajib diisi." },
                { status: 400 }
            );
        }

        // Validate token
        const [rows] = await pool.execute<RowDataPacket[]>(
            "SELECT * FROM password_resets WHERE email = ? AND token = ?",
            [email, token]
        );

        if (!Array.isArray(rows) || rows.length === 0) {
            return NextResponse.json(
                { success: false, message: "Token tidak valid atau sudah kedaluwarsa." },
                { status: 400 }
            );
        }

        const resetRecord = rows[0];
        if (new Date(resetRecord.expires_at) < new Date()) {
            await pool.execute("DELETE FROM password_resets WHERE email = ?", [email]);
            return NextResponse.json(
                { success: false, message: "Token sudah kedaluwarsa." },
                { status: 400 }
            );
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Update password in admins table
        await pool.execute(
            "UPDATE admins SET password = ? WHERE email = ?",
            [hashedPassword, email]
        );

        // Delete token
        await pool.execute("DELETE FROM password_resets WHERE email = ?", [email]);

        return NextResponse.json({
            success: true,
            message: "Password berhasil diubah. Silakan login.",
        });
    } catch (error) {
        console.error("Reset password error:", error);
        return NextResponse.json(
            { success: false, message: "Terjadi kesalahan pada server." },
            { status: 500 }
        );
    }
}
