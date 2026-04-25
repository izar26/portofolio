import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import type { RowDataPacket } from "mysql2";

export async function GET() {
    try {
        const [rows] = await pool.execute<RowDataPacket[]>(
            "SELECT * FROM about_section WHERE id = 1 LIMIT 1"
        );

        if (!rows || rows.length === 0) {
            return NextResponse.json({ success: false, message: "Data tidak ditemukan." }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: rows[0] }, { status: 200 });
    } catch (error) {
        console.error("GET /api/about error:", error);
        return NextResponse.json({ success: false, message: "Kesalahan server." }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        // Only authenticated admins can update
        const token = request.cookies.get("auth_token")?.value;
        if (!token) {
            return NextResponse.json({ success: false, message: "Tidak terautentikasi." }, { status: 401 });
        }

        if (!verifyToken(token)) {
            return NextResponse.json({ success: false, message: "Token tidak valid." }, { status: 401 });
        }

        const data = await request.json();

        // Pastikan ID selalu 1
        const {
            description_1,
            image_url,
            cv_url,
            location_badge,
            full_name,
            role,
            email,
            location_detail,
            stats_1_value,
            stats_1_label,
            stats_2_value,
            stats_2_label,
            stats_3_value,
            stats_3_label,
        } = data;

        await pool.execute(
            `UPDATE about_section SET 
        description_1 = ?, image_url = ?, cv_url = ?, location_badge = ?, 
        full_name = ?, role = ?, email = ?, location_detail = ?, 
        stats_1_value = ?, stats_1_label = ?, stats_2_value = ?, stats_2_label = ?, 
        stats_3_value = ?, stats_3_label = ? 
      WHERE id = 1`,
            [
                description_1, image_url, cv_url, location_badge,
                full_name, role, email, location_detail,
                stats_1_value, stats_1_label, stats_2_value, stats_2_label,
                stats_3_value, stats_3_label
            ]
        );

        return NextResponse.json({ success: true, message: "Data berhasil diperbarui." }, { status: 200 });
    } catch (error) {
        console.error("PUT /api/about error:", error);
        return NextResponse.json({ success: false, message: "Kesalahan server." }, { status: 500 });
    }
}
