import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const secretKey = process.env.SECRET_KEY;
const encodedKey = new TextEncoder().encode(secretKey);

export async function createSession(userId: string) {
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7); // 7 days from now
    const session = await encrypt({userId, expiresAt})

    const cookieStore = await cookies();

    cookieStore.set("session", session,{
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        expires: expiresAt,
    });
}

export async function deleteSession() {
    const cookieStore = await cookies();
    cookieStore.delete("session");
}

type SessionPayload = {
    userId: string;
    expiresAt: Date;
}

export async function encrypt(payload: SessionPayload) {
    return new SignJWT(payload)
        .setProtectedHeader({alg: "HS256"})
        .setIssuedAt()
        .setExpirationTime("7d")
        .sign(encodedKey);
}

export async function decrypt(session: string | undefined = ""){
    try{
        const {payload} = await jwtVerify(session, encodedKey, {
            algorithms: ["HS256"]
        });
        return payload
    } catch (error) {
        console.log("Failed to verify session")
    }
}