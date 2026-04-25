import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const id = params.id;
        if (!id) {
            return NextResponse.json({ success: false, message: "ID tidak valid" }, { status: 400 });
        }

        const [rows] = await pool.execute<RowDataPacket[]>(
            "SELECT * FROM projects WHERE id = ?",
            [id]
        );

        if (rows.length === 0) {
            return NextResponse.json({ success: false, message: "Proyek tidak ditemukan" }, { status: 404 });
        }

        const project = rows[0];

        const [mediaRows] = await pool.execute<RowDataPacket[]>(
            "SELECT * FROM project_media WHERE project_id = ? ORDER BY created_at ASC",
            [id]
        );

        const projectMedia = mediaRows.map(m => ({
            id: m.id,
            media_type: m.media_type,
            media_url: m.media_url
        }));

        const formattedData = {
            ...project,
            tags: typeof project.tags === "string" ? JSON.parse(project.tags) : project.tags,
            media: projectMedia
        };

        return NextResponse.json({ success: true, data: formattedData }, { status: 200 });
    } catch (error) {
        console.error("GET /api/projects/[id] error:", error);
        return NextResponse.json({ success: false, message: "Kesalahan server internal" }, { status: 500 });
    }
}
