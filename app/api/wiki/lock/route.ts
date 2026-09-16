import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { lockWikiPage, unlockWikiPage, getWikiPage } from "@/lib/database";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST /api/wiki/lock — Lock or unlock the wiki page (SuperAdmin only)
export async function POST(req: Request) {
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

        // Only SuperAdmin can lock/unlock
        if (decoded.role !== "SuperAdmin") {
            return NextResponse.json({ error: "Forbidden: SuperAdmin only" }, { status: 403 });
        }

        const user = {
            id: decoded.id || decoded.email,
            name: decoded.name || decoded.email?.split("@")[0],
        };

        const body = await req.json();
        const { action, wiki_id } = body;

        if (!wiki_id) {
            return NextResponse.json({ error: "wiki_id is required" }, { status: 400 });
        }

        if (action === "lock") {
            // Check if already locked by someone else
            const page = await getWikiPage();
            if (page.is_locked && page.locked_by_user_id !== user.id) {
                return NextResponse.json(
                    { error: `Page is already locked by ${page.locked_by_user_name}` },
                    { status: 409 }
                );
            }

            await lockWikiPage(wiki_id, user);
            return NextResponse.json({ success: true, message: "Wiki page locked" });
        }

        if (action === "unlock") {
            await unlockWikiPage(wiki_id, user);
            return NextResponse.json({ success: true, message: "Wiki page unlocked" });
        }

        return NextResponse.json({ error: "Invalid action. Use 'lock' or 'unlock'." }, { status: 400 });
    } catch (e: any) {
        console.error("[POST /api/wiki/lock] error:", e);
        return NextResponse.json({ error: e.message || "Internal server error" }, { status: 500 });
    }
}
