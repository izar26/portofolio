import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import type { RowDataPacket, ResultSetHeader } from "mysql2";

export async function GET() {
    try {
        const [rows] = await pool.execute<RowDataPacket[]>(
            "SELECT * FROM skill_categories ORDER BY sort_order ASC, id ASC"
        );

        // MySQL returns JSON items as parsed objects/arrays if json type is supported, 
        // or as string depending on config. Let's ensure it's an array.
        const formattedData = rows.map((row) => ({
            ...row,
            items: typeof row.items === "string" ? JSON.parse(row.items) : row.items,
        }));

        return NextResponse.json({ success: true, data: formattedData }, { status: 200 });
    } catch (error) {
        console.error("GET /api/skills error:", error);
        return NextResponse.json({ success: false, message: "Kesalahan server saat mengambil data keahlian." }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const token = request.cookies.get("auth_token")?.value;
        if (!token || !verifyToken(token)) {
            return NextResponse.json({ success: false, message: "Tidak terautentikasi." }, { status: 401 });
        }

        const { category_name, items, sort_order = 0 } = await request.json();

        if (!category_name || !Array.isArray(items)) {
            return NextResponse.json({ success: false, message: "Format data tidak valid." }, { status: 400 });
        }

        const [result] = await pool.execute<ResultSetHeader>(
            "INSERT INTO skill_categories (category_name, items, sort_order) VALUES (?, ?, ?)",
            [category_name, JSON.stringify(items), sort_order]
        );

        return NextResponse.json({
            success: true,
            message: "Kategori keahlian berhasil ditambahkan.",
            id: result.insertId
        }, { status: 201 });
    } catch (error) {
        console.error("POST /api/skills error:", error);
        return NextResponse.json({ success: false, message: "Gagal menambah data keahlian." }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const token = request.cookies.get("auth_token")?.value;
        if (!token || !verifyToken(token)) {
            return NextResponse.json({ success: false, message: "Tidak terautentikasi." }, { status: 401 });
        }

        const { id, category_name, items, sort_order } = await request.json();

        if (!id || !category_name || !Array.isArray(items)) {
            return NextResponse.json({ success: false, message: "Format data tidak valid atau ID hilang." }, { status: 400 });
        }

        await pool.execute(
            "UPDATE skill_categories SET category_name = ?, items = ?, sort_order = ? WHERE id = ?",
            [category_name, JSON.stringify(items), sort_order ?? 0, id]
        );

        return NextResponse.json({ success: true, message: "Kategori keahlian berhasil diperbarui." }, { status: 200 });
    } catch (error) {
        console.error("PUT /api/skills error:", error);
        return NextResponse.json({ success: false, message: "Gagal memperbarui data keahlian." }, { status: 500 });
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

        await pool.execute("DELETE FROM skill_categories WHERE id = ?", [id]);

        return NextResponse.json({ success: true, message: "Kategori keahlian berhasil dihapus." }, { status: 200 });
    } catch (error) {
        console.error("DELETE /api/skills error:", error);
        return NextResponse.json({ success: false, message: "Gagal menghapus data keahlian." }, { status: 500 });
    }
}
