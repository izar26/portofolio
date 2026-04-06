export interface Admin {
    id: number;
    email: string;
    password: string;
    totp_secret: string;
    created_at: Date;
}

export interface JWTPayload {
    id: number;
    email: string;
    iat?: number;
    exp?: number;
}

export interface LoginResponse {
    success: boolean;
    requireTOTP?: boolean;
    message: string;
}
