import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

export async function GET(req: Request) {
    const token = req.headers.get("cookie")?.split("; ").find(c => c.startsWith("auth_token="))?.split("=")[1];

    if (!token) {
        return NextResponse.json({ error: "No token" }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload) {
        return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    return NextResponse.json({ user: payload });
}
