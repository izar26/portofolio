import jwt from "jsonwebtoken";
import * as OTPAuth from "otpauth";
import type { JWTPayload } from "@/types/types";

if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables");
}
const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Sign a JWT token with 24-hour expiry
 */
export function signToken(payload: { id: number; email: string }): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: "24h" });
}

/**
 * Verify and decode a JWT token
 */
export function verifyToken(token: string): JWTPayload | null {
    try {
        return jwt.verify(token, JWT_SECRET) as JWTPayload;
    } catch {
        return null;
    }
}

/**
 * Verify a 6-digit TOTP code against the stored secret
 */
export function verifyTOTP(secret: string, code: string): boolean {
    const totp = new OTPAuth.TOTP({
        issuer: "Portofolio Admin",
        label: "admin",
        algorithm: "SHA1",
        digits: 6,
        period: 30,
        secret: OTPAuth.Secret.fromBase32(secret),
    });

    const delta = totp.validate({ token: code, window: 1 });
    return delta !== null;
}
