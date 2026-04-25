import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import type { RowDataPacket } from "mysql2";

export async function GET(request: NextRequest) {
    try {
        const token = request.cookies.get("auth_token")?.value;
        if (!token) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

        const payload = verifyToken(token);
        if (!payload) return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 });

        const [rows] = await pool.execute<RowDataPacket[]>(
            "SELECT totp_secret FROM admins WHERE id = ?",
            [payload.id]
        );

        if (!Array.isArray(rows) || rows.length === 0) {
            return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
        }

        const is2FAEnabled = rows[0].totp_secret !== null && rows[0].totp_secret !== "";

        return NextResponse.json({
            success: true,
            is2FAEnabled
        });
    } catch (error) {
        console.error("Status 2FA error:", error);
        return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
    }
}
