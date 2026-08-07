import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { heartbeatDocumentLock } from "@/lib/database";

export async function POST(req: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("auth_token")?.value;
        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const decoded: any = await verifyToken(token);
        if (!decoded) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

        const body = await req.json();
        const { document_id, lock_token } = body;

        if (!document_id || !lock_token) {
            return NextResponse.json({ error: "document_id and lock_token are required" }, { status: 400 });
        }

        const valid = await heartbeatDocumentLock(document_id, lock_token);
        if (!valid) {
            return NextResponse.json({ success: false, message: "Lock lost or expired" }, { status: 409 });
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
    }
}
