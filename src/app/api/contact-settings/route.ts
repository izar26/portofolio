import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import type { RowDataPacket } from "mysql2";

export async function GET() {
    try {
        const [rows] = await pool.execute<RowDataPacket[]>(
            "SELECT * FROM contact_settings LIMIT 1"
        );

        if (rows.length === 0) {
            return NextResponse.json({ success: true, data: { email: "", phone: "", location: "" } }, { status: 200 });
        }

        return NextResponse.json({ success: true, data: rows[0] }, { status: 200 });
    } catch (error) {
        console.error("GET /api/contact-settings error:", error);
        return NextResponse.json({ success: false, message: "Kesalahan server saat mengambil pengaturan kontak." }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const token = request.cookies.get("auth_token")?.value;
        if (!token || !verifyToken(token)) {
            return NextResponse.json({ success: false, message: "Tidak terautentikasi." }, { status: 401 });
        }

        const { email, phone, location } = await request.json();

        if (!email || !phone || !location) {
            return NextResponse.json({ success: false, message: "Semua field kontak wajib diisi." }, { status: 400 });
        }

        // Check if row exists
        const [rows] = await pool.execute<RowDataPacket[]>("SELECT id FROM contact_settings LIMIT 1");

        if (rows.length > 0) {
            await pool.execute(
                "UPDATE contact_settings SET email = ?, phone = ?, location = ? WHERE id = ?",
                [email, phone, location, rows[0].id]
            );
        } else {
            await pool.execute(
                "INSERT INTO contact_settings (email, phone, location) VALUES (?, ?, ?)",
                [email, phone, location]
            );
        }

        return NextResponse.json({ success: true, message: "Pengaturan kontak berhasil diperbarui." }, { status: 200 });
    } catch (error) {
        console.error("PUT /api/contact-settings error:", error);
        return NextResponse.json({ success: false, message: "Gagal memperbarui pengaturan kontak." }, { status: 500 });
    }
}
