import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { forceUnlockDocument } from "@/lib/database";

export async function POST(req: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("auth_token")?.value;
        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const decoded: any = await verifyToken(token);
        if (!decoded) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

        // Enforce Super Admin role
        if (decoded.role !== "SuperAdmin") {
            return NextResponse.json({ error: "Forbidden: Super Admin access required" }, { status: 403 });
        }

        const adminUser = {
            id: decoded.id || decoded.email,
            name: decoded.name || decoded.email.split("@")[0],
        };

        const body = await req.json();
        const { document_id, reason } = body;

        if (!document_id) {
            return NextResponse.json({ error: "document_id is required" }, { status: 400 });
        }

        if (!reason || reason.trim().length === 0) {
            return NextResponse.json({ error: "Reason for force unlock is required" }, { status: 400 });
        }

        await forceUnlockDocument(document_id, adminUser, reason.trim());

        return NextResponse.json({ success: true, message: "Lock forcibly released by Super Admin" });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
    }
}
