import { NextResponse } from "next/server";
import { upsertWorkspaceNote } from "@/lib/database";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

export async function PUT(req: Request) {
    try {
        const token = cookies().get("auth_token")?.value;
        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const decoded = await verifyToken(token);
        if (!decoded) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

        const body = await req.json();
        const { id, project_id, content } = body;

        if (!id || !project_id) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

        await upsertWorkspaceNote({
            id,
            project_id,
            content: content || "",
            updated_at: new Date().toISOString(),
        });

        return NextResponse.json({ success: true });
    } catch (e: any) {
        console.error("[PUT /api/tracking/notes] error:", e);
        return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
    }
}
