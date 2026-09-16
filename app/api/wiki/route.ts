import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { getWikiPage, updateWikiPage, logAudit } from "@/lib/database";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/wiki — Fetch the wiki page (auto-creates if none exists)
export async function GET() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("auth_token")?.value;

        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const decoded = await verifyToken(token);
        if (!decoded) {
            return NextResponse.json({ error: "Invalid token" }, { status: 401 });
        }

        const page = await getWikiPage();
        return NextResponse.json(page);
    } catch (e: any) {
        console.error("[GET /api/wiki] error:", e);
        return NextResponse.json({ error: "Failed to fetch wiki page" }, { status: 500 });
    }
}

// PUT /api/wiki — Update wiki title/content (auto-save endpoint)
export async function PUT(req: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("auth_token")?.value;

        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const decoded: any = await verifyToken(token);
        if (!decoded) {
            return NextResponse.json({ error: "Invalid token" }, { status: 401 });
        }

        // Only SuperAdmin can edit
        if (decoded.role !== "SuperAdmin") {
            return NextResponse.json({ error: "Forbidden: SuperAdmin only" }, { status: 403 });
        }

        const body = await req.json();
        const { id, title, content } = body;

        if (!id) {
            return NextResponse.json({ error: "Wiki page id is required" }, { status: 400 });
        }

        const user = {
            id: decoded.id || decoded.email,
            name: decoded.name || decoded.email?.split("@")[0],
        };

        // Check if page is locked by another user
        const currentPage = await getWikiPage();
        if (currentPage.is_locked && currentPage.locked_by_user_id !== user.id) {
            return NextResponse.json(
                { error: `Page is locked by ${currentPage.locked_by_user_name}` },
                { status: 409 }
            );
        }

        const updates: any = { updated_at: new Date().toISOString() };
        if (title !== undefined) updates.title = title;
        if (content !== undefined) updates.content = content;

        await updateWikiPage(id, updates, user);

        return NextResponse.json({ success: true });
    } catch (e: any) {
        console.error("[PUT /api/wiki] error:", e);
        return NextResponse.json({ error: "Failed to update wiki page" }, { status: 500 });
    }
}
