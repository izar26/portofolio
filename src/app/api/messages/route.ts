import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import type { RowDataPacket, ResultSetHeader } from "mysql2";

// Get All Messages (Protected)
export async function GET(request: NextRequest) {
    try {
        const token = request.cookies.get("auth_token")?.value;
        if (!token || !verifyToken(token)) {
            return NextResponse.json({ success: false, message: "Tidak terautentikasi." }, { status: 401 });
        }

        const [rows] = await pool.execute<RowDataPacket[]>(
            "SELECT * FROM messages ORDER BY created_at DESC"
        );

        return NextResponse.json({ success: true, data: rows }, { status: 200 });
    } catch (error) {
        console.error("GET /api/messages error:", error);
        return NextResponse.json({ success: false, message: "Kesalahan server saat mengambil pesan." }, { status: 500 });
    }
}

// Send Message (Public)
export async function POST(request: NextRequest) {
    try {
        const { name, email, subject, message } = await request.json();

        if (!name || !email || !subject || !message) {
            return NextResponse.json({ success: false, message: "Semua field wajib diisi." }, { status: 400 });
        }

        await pool.execute<ResultSetHeader>(
            "INSERT INTO messages (name, email, subject, message) VALUES (?, ?, ?, ?)",
            [name, email, subject, message]
        );

        // Fetch admin email from database
        const [adminRows] = await pool.execute<RowDataPacket[]>("SELECT email FROM admins LIMIT 1");
        const adminEmail = adminRows.length > 0 ? adminRows[0].email : process.env.SMTP_USER;

        // Send email notification to admin asynchronously (don't await to avoid blocking the response)
        const { sendContactNotificationEmail } = await import("@/lib/mail");
        if (adminEmail) {
            sendContactNotificationEmail(adminEmail, name, email, subject, message).catch(err => {
                console.error("Failed to send contact notification email:", err);
            });
        }

        return NextResponse.json({ success: true, message: "Pesan berhasil dikirim." }, { status: 201 });
    } catch (error) {
        console.error("POST /api/messages error:", error);
        return NextResponse.json({ success: false, message: "Gagal mengirim pesan." }, { status: 500 });
    }
}

// Mark Message as Read/Unread (Protected)
export async function PUT(request: NextRequest) {
    try {
        const token = request.cookies.get("auth_token")?.value;
        if (!token || !verifyToken(token)) {
            return NextResponse.json({ success: false, message: "Tidak terautentikasi." }, { status: 401 });
        }

        const { id, is_read } = await request.json();

        if (!id || typeof is_read !== "boolean") {
            return NextResponse.json({ success: false, message: "ID parameter dan is_read diperlukan." }, { status: 400 });
        }

        await pool.execute(
            "UPDATE messages SET is_read = ? WHERE id = ?",
            [is_read, id]
        );

        return NextResponse.json({ success: true, message: "Status pesan diperbarui." }, { status: 200 });
    } catch (error) {
        console.error("PUT /api/messages error:", error);
        return NextResponse.json({ success: false, message: "Gagal memperbarui pesan." }, { status: 500 });
    }
}

// Delete Message (Protected)
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

        await pool.execute("DELETE FROM messages WHERE id = ?", [id]);

        return NextResponse.json({ success: true, message: "Pesan dihapus." }, { status: 200 });
    } catch (error) {
        console.error("DELETE /api/messages error:", error);
        return NextResponse.json({ success: false, message: "Gagal menghapus pesan." }, { status: 500 });
    }
}
