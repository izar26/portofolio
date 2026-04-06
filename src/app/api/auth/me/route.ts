import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

export async function GET(request: NextRequest) {
    try {
        const token = request.cookies.get("auth_token")?.value;

        if (!token) {
            return NextResponse.json(
                { authenticated: false, message: "Tidak terautentikasi." },
                { status: 401 }
            );
        }

        const payload = verifyToken(token);

        if (!payload) {
            return NextResponse.json(
                { authenticated: false, message: "Token tidak valid." },
                { status: 401 }
            );
        }

        return NextResponse.json(
            {
                authenticated: true,
                user: { id: payload.id, email: payload.email },
            },
            { status: 200 }
        );
    } catch {
        return NextResponse.json(
            { authenticated: false, message: "Terjadi kesalahan server." },
            { status: 500 }
        );
    }
}
