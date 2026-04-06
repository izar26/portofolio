import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || "fallback-secret-key"
);

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Protected routes
    const isProtectedRoute = pathname.startsWith("/dashboard");
    const isLoginRoute = pathname === "/login";

    const token = request.cookies.get("auth_token")?.value;

    // Check if token is valid
    let isAuthenticated = false;
    if (token) {
        try {
            await jwtVerify(token, JWT_SECRET);
            isAuthenticated = true;
        } catch {
            isAuthenticated = false;
        }
    }

    // Redirect from protected routes to login if not authenticated
    if (isProtectedRoute && !isAuthenticated) {
        const loginUrl = new URL("/login", request.url);
        return NextResponse.redirect(loginUrl);
    }

    // Redirect from login to dashboard if already authenticated
    if (isLoginRoute && isAuthenticated) {
        const dashboardUrl = new URL("/dashboard", request.url);
        return NextResponse.redirect(dashboardUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/dashboard/:path*", "/login"],
};
