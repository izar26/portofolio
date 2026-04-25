import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import type { RowDataPacket, ResultSetHeader } from "mysql2";

export async function GET() {
    try {
        const [rows] = await pool.execute<RowDataPacket[]>(
            "SELECT * FROM projects ORDER BY sort_order ASC, id DESC"
        );

        const [mediaRows] = await pool.execute<RowDataPacket[]>(
            "SELECT * FROM project_media ORDER BY created_at ASC"
        );

        const formattedData = rows.map((row) => {
            const projectMedia = mediaRows.filter(m => m.project_id === row.id).map(m => ({
                id: m.id,
                media_type: m.media_type,
                media_url: m.media_url
            }));

            return {
                ...row,
                tags: typeof row.tags === "string" ? JSON.parse(row.tags) : row.tags,
                media: projectMedia
            };
        });

        return NextResponse.json({ success: true, data: formattedData }, { status: 200 });
    } catch (error) {
        console.error("GET /api/projects error:", error);
        return NextResponse.json({ success: false, message: "Kesalahan server saat mengambil data proyek." }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const token = request.cookies.get("auth_token")?.value;
        if (!token || !verifyToken(token)) {
            return NextResponse.json({ success: false, message: "Tidak terautentikasi." }, { status: 401 });
        }

        const { title, description, image_url, tags, live_url, github_url, sort_order = 0, media = [] } = await request.json();

        if (!title || !description || !image_url || !Array.isArray(tags)) {
            return NextResponse.json({ success: false, message: "Format data tidak valid." }, { status: 400 });
        }

        const [result] = await pool.execute<ResultSetHeader>(
            "INSERT INTO projects (title, description, image_url, tags, live_url, github_url, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [title, description, image_url, JSON.stringify(tags), live_url || null, github_url || null, sort_order]
        );

        const projectId = result.insertId;

        // Insert media if provided
        if (Array.isArray(media) && media.length > 0) {
            for (const item of media) {
                if (item.media_type && item.media_url) {
                    await pool.execute(
                        "INSERT INTO project_media (project_id, media_type, media_url) VALUES (?, ?, ?)",
                        [projectId, item.media_type, item.media_url]
                    );
                }
            }
        }

        return NextResponse.json({
            success: true,
            message: "Proyek berhasil ditambahkan.",
            id: projectId
        }, { status: 201 });
    } catch (error) {
        console.error("POST /api/projects error:", error);
        return NextResponse.json({ success: false, message: "Gagal menambah data proyek." }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const token = request.cookies.get("auth_token")?.value;
        if (!token || !verifyToken(token)) {
            return NextResponse.json({ success: false, message: "Tidak terautentikasi." }, { status: 401 });
        }

        const { id, title, description, image_url, tags, live_url, github_url, sort_order, media = [] } = await request.json();

        if (!id || !title || !description || !image_url || !Array.isArray(tags)) {
            return NextResponse.json({ success: false, message: "Format data tidak valid atau ID hilang." }, { status: 400 });
        }

        await pool.execute(
            `UPDATE projects SET 
       title = ?, description = ?, image_url = ?, tags = ?, live_url = ?, github_url = ?, sort_order = ? 
       WHERE id = ?`,
            [title, description, image_url, JSON.stringify(tags), live_url || null, github_url || null, sort_order ?? 0, id]
        );

        // Update media by clearing existing and inserting new
        await pool.execute("DELETE FROM project_media WHERE project_id = ?", [id]);

        if (Array.isArray(media) && media.length > 0) {
            for (const item of media) {
                if (item.media_type && item.media_url) {
                    await pool.execute(
                        "INSERT INTO project_media (project_id, media_type, media_url) VALUES (?, ?, ?)",
                        [id, item.media_type, item.media_url]
                    );
                }
            }
        }

        return NextResponse.json({ success: true, message: "Proyek berhasil diperbarui." }, { status: 200 });
    } catch (error) {
        console.error("PUT /api/projects error:", error);
        return NextResponse.json({ success: false, message: "Gagal memperbarui data proyek." }, { status: 500 });
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

        await pool.execute("DELETE FROM projects WHERE id = ?", [id]);

        return NextResponse.json({ success: true, message: "Proyek berhasil dihapus." }, { status: 200 });
    } catch (error) {
        console.error("DELETE /api/projects error:", error);
        return NextResponse.json({ success: false, message: "Gagal menghapus data proyek." }, { status: 500 });
    }
}
