import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { decrypt } from "./lib/session";
import { error } from "console";

const protectedRoutes = ["/", "/transaksi", "/login", "/penerimaan", "/penjualan", "/summary", "/test", "/biaya"]
const publicRoutes = ["/login"]

export default async function middleware(req: NextRequest){
    const path = req.nextUrl.pathname;
    const isProtectedRoute = protectedRoutes.includes(path);
    const isPublicRoute = publicRoutes.includes(path);

    const cookieStore = await cookies();
    const cookie = cookieStore.get("session")?.value;
    const session = await decrypt(cookie);

    // If the user is not authenticated and tries to access a protected route, redirect to login
    if(isProtectedRoute && !session?.userId){
        return NextResponse.rewrite(new URL("/login", req.nextUrl));
    } else if (path.startsWith("/api") && !session?.userId){ //If user try to access any path that starts with /api, return error JSON
        return NextResponse.json(
            {error: "Unauthenticated user"},
            {status:401}
        );
    }

    return NextResponse.next();
}