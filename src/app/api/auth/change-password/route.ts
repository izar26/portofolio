import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import bcrypt from "bcryptjs";
import type { RowDataPacket } from "mysql2";

export async function POST(request: NextRequest) {
    try {
        const token = request.cookies.get("auth_token")?.value;
        if (!token) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

        const payload = verifyToken(token);
        if (!payload) return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 });

        const body = await request.json();
        const { currentPassword, newPassword } = body;

        if (!currentPassword || !newPassword) {
            return NextResponse.json({ success: false, message: "Semua field wajib diisi." }, { status: 400 });
        }

        if (newPassword.length < 6) {
            return NextResponse.json({ success: false, message: "Password minimal 6 karakter." }, { status: 400 });
        }

        const [rows] = await pool.execute<RowDataPacket[]>(
            "SELECT password FROM admins WHERE id = ?",
            [payload.id]
        );

        if (!Array.isArray(rows) || rows.length === 0) {
            return NextResponse.json({ success: false, message: "Admin tidak ditemukan" }, { status: 404 });
        }

        const admin = rows[0];
        const isValid = await bcrypt.compare(currentPassword, admin.password);

        if (!isValid) {
            return NextResponse.json({ success: false, message: "Password saat ini salah." }, { status: 401 });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 12);

        await pool.execute(
            "UPDATE admins SET password = ? WHERE id = ?",
            [hashedPassword, payload.id]
        );

        return NextResponse.json({
            success: true,
            message: "Password berhasil diubah."
        });
    } catch (error) {
        console.error("Change password error:", error);
        return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
    }
}
