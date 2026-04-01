import { NextResponse } from "next/server";
import { getPolls, createPoll, updatePoll, deletePoll, votePoll, logAudit } from "@/lib/database";
import { verifyToken } from "@/lib/auth";

async function getAuth(req: Request) {
    const token = req.headers.get("cookie")?.split("; ").find(c => c.startsWith("auth_token="))?.split("=")[1];
    if (!token) return null;
    return await verifyToken(token);
}

export async function GET() {
    try {
        const polls = await getPolls();
        return NextResponse.json({ polls });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const decoded = await getAuth(req);
        if (!decoded) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        const body = await req.json();
        const poll = await createPoll({ ...body, created_by: decoded.email });
        await logAudit(decoded.email as string, "CREATE", "Poll", poll.id, `Created poll: ${poll.title}`);
        return NextResponse.json({ poll });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const decoded = await getAuth(req);
        if (!decoded) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        const body = await req.json();
        const { id, vote_option_id, ...updates } = body;
        if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

        if (vote_option_id) {
            // Vote action
            await votePoll(id, vote_option_id);
            await logAudit(decoded.email as string, "VOTE", "Poll", id, `Voted on poll`);
        } else {
            await updatePoll(id, updates);
            await logAudit(decoded.email as string, "UPDATE", "Poll", id, `Updated poll: ${updates.title || id}`);
        }
        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const decoded = await getAuth(req);
        if (!decoded) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");
        if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
        await deletePoll(id);
        await logAudit(decoded.email as string, "DELETE", "Poll", id, `Deleted poll`);
        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
