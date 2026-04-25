import { NextRequest, NextResponse } from "next/server";
import * as OTPAuth from "otpauth";
import QRCode from "qrcode";
import { verifyToken } from "@/lib/auth";
import pool from "@/lib/db";
import type { RowDataPacket } from "mysql2";

export async function GET(request: NextRequest) {
    try {
        const token = request.cookies.get("auth_token")?.value;
        if (!token) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

        const payload = verifyToken(token);
        if (!payload) return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 });

        const setupToken = request.nextUrl.searchParams.get("token");
        if (!setupToken) return NextResponse.json({ success: false, message: "Token aktivasi tidak ditemukan" }, { status: 400 });

        const [adminRows] = await pool.execute<RowDataPacket[]>(
            "SELECT email, totp_secret FROM admins WHERE id = ?",
            [payload.id]
        );

        if (!Array.isArray(adminRows) || adminRows.length === 0) {
            return NextResponse.json({ success: false, message: "Admin tidak ditemukan" }, { status: 404 });
        }

        const admin = adminRows[0];
        
        if (admin.totp_secret) {
            return NextResponse.json({ success: false, message: "Google Authenticator sudah aktif. Tidak perlu melakukan setup lagi." }, { status: 400 });
        }

        const [tokenRows] = await pool.execute<RowDataPacket[]>(
            "SELECT * FROM enable_2fa_tokens WHERE email = ? AND token = ?",
            [admin.email, setupToken]
        );

        if (!Array.isArray(tokenRows) || tokenRows.length === 0) {
            return NextResponse.json({ success: false, message: "Token aktivasi tidak valid atau sudah digunakan." }, { status: 400 });
        }

        const secret = new OTPAuth.Secret({ size: 20 });
        const base32Secret = secret.base32;

        const totp = new OTPAuth.TOTP({
            issuer: "Portofolio Admin",
            label: admin.email,
            algorithm: "SHA1",
            digits: 6,
            period: 30,
            secret: secret,
        });

        const otpauthUri = totp.toString();
        const qrCodeDataUrl = await QRCode.toDataURL(otpauthUri);

        return NextResponse.json({
            success: true,
            secret: base32Secret,
            qrCodeUrl: qrCodeDataUrl
        });
    } catch (error) {
        console.error("Generate 2FA error:", error);
        return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
    }
}
