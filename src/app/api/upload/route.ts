import { NextRequest, NextResponse } from "next/server";
import { join } from "path";
import { writeFile, mkdir } from "fs/promises";
import { v4 as uuidv4 } from "uuid";
import { verifyToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
    try {
        // 1. Verifikasi Autentikasi Admin
        const token = request.cookies.get("auth_token")?.value;
        if (!token || !verifyToken(token)) {
            return NextResponse.json({ success: false, message: "Tidak terautentikasi." }, { status: 401 });
        }

        // 2. Ambil data form
        const formData = await request.formData();
        const file = formData.get("file") as File | null;

        if (!file) {
            return NextResponse.json({ success: false, message: "File gambar tidak ditemukan." }, { status: 400 });
        }

        // 3. Validasi tipe file (Hanya izinkan gambar)
        if (!file.type.startsWith("image/")) {
            return NextResponse.json({ success: false, message: "File harus berupa gambar." }, { status: 400 });
        }

        // 4. Siapkan path penyimpanan di public/uploads
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Buat ekstensi file yang aman
        const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
        const filename = `${uuidv4()}.${extension}`;

        // Pastikan folder uploads ada
        const uploadDir = join(process.cwd(), "public", "uploads");
        try {
            await mkdir(uploadDir, { recursive: true });
        } catch (e) {
            // Abaikan error jika folder sudah ada
        }

        const filepath = join(uploadDir, filename);

        // 5. Simpan file
        await writeFile(filepath, buffer);

        // 6. Kembalikan URL publik
        const publicUrl = `/uploads/${filename}`;

        return NextResponse.json({
            success: true,
            url: publicUrl,
            message: "Gambar berhasil diunggah."
        }, { status: 200 });

    } catch (error) {
        console.error("POST /api/upload error:", error);
        return NextResponse.json({ success: false, message: "Gagal mengunggah gambar." }, { status: 500 });
    }
}
