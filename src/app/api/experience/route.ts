import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import type { RowDataPacket, ResultSetHeader } from "mysql2";

export async function GET() {
    try {
        const [rows] = await pool.execute<RowDataPacket[]>(
            "SELECT * FROM experiences ORDER BY sort_order ASC, id DESC"
        );

        return NextResponse.json({ success: true, data: rows }, { status: 200 });
    } catch (error) {
        console.error("GET /api/experience error:", error);
        return NextResponse.json({ success: false, message: "Kesalahan server saat mengambil data pengalaman." }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const token = request.cookies.get("auth_token")?.value;
        if (!token || !verifyToken(token)) {
            return NextResponse.json({ success: false, message: "Tidak terautentikasi." }, { status: 401 });
        }

        const { role, company, period, description, sort_order = 0 } = await request.json();

        if (!role || !company || !period || !description) {
            return NextResponse.json({ success: false, message: "Semua field teks disyaratkan wajib." }, { status: 400 });
        }

        const [result] = await pool.execute<ResultSetHeader>(
            "INSERT INTO experiences (role, company, period, description, sort_order) VALUES (?, ?, ?, ?, ?)",
            [role, company, period, description, sort_order]
        );

        return NextResponse.json({
            success: true,
            message: "Pengalaman berhasil ditambahkan.",
            id: result.insertId
        }, { status: 201 });
    } catch (error) {
        console.error("POST /api/experience error:", error);
        return NextResponse.json({ success: false, message: "Gagal menambah data pengalaman." }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const token = request.cookies.get("auth_token")?.value;
        if (!token || !verifyToken(token)) {
            return NextResponse.json({ success: false, message: "Tidak terautentikasi." }, { status: 401 });
        }

        const { id, role, company, period, description, sort_order } = await request.json();

        if (!id || !role || !company || !period || !description) {
            return NextResponse.json({ success: false, message: "Format data tidak valid atau ID hilang." }, { status: 400 });
        }

        await pool.execute(
            `UPDATE experiences SET role = ?, company = ?, period = ?, description = ?, sort_order = ? WHERE id = ?`,
            [role, company, period, description, sort_order ?? 0, id]
        );

        return NextResponse.json({ success: true, message: "Pengalaman berhasil diperbarui." }, { status: 200 });
    } catch (error) {
        console.error("PUT /api/experience error:", error);
        return NextResponse.json({ success: false, message: "Gagal memperbarui data pengalaman." }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const token = request.cookies.get("auth_token")?.value;
        if (!token || !verifyToken(token)) {
            return NextResponse.json({ success: false, message: "Tidak terautentikasi." }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ success: false, message: "ID parameter diperlukan." }, { status: 400 });
        }

        await pool.execute("DELETE FROM experiences WHERE id = ?", [id]);

        return NextResponse.json({ success: true, message: "Pengalaman berhasil dihapus." }, { status: 200 });
    } catch (error) {
        console.error("DELETE /api/experience error:", error);
        return NextResponse.json({ success: false, message: "Gagal menghapus data pengalaman." }, { status: 500 });
    }
}
