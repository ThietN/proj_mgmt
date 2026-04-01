import { NextResponse } from "next/server";
import { getFeedback, createFeedback, updateFeedback, deleteFeedback, logAudit } from "@/lib/database";
import { verifyToken } from "@/lib/auth";

async function getAuth(req: Request) {
    const token = req.headers.get("cookie")?.split("; ").find(c => c.startsWith("auth_token="))?.split("=")[1];
    if (!token) return null;
    return await verifyToken(token);
}

export async function GET() {
    try {
        const feedback = await getFeedback();
        return NextResponse.json({ feedback });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const decoded = await getAuth(req);
        if (!decoded) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        const body = await req.json();
        const item = await createFeedback({ ...body, submitted_by: body.is_anonymous ? "Anonymous" : decoded.email });
        await logAudit(decoded.email as string, "CREATE", "Feedback", item.id, `Submitted feedback: ${item.title}`);
        return NextResponse.json({ feedback: item });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const decoded = await getAuth(req);
        if (!decoded) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        const body = await req.json();
        const { id, ...updates } = body;
        if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
        await updateFeedback(id, updates);
        await logAudit(decoded.email as string, "UPDATE", "Feedback", id, `Updated feedback: ${updates.title || id}`);
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
        await deleteFeedback(id);
        await logAudit(decoded.email as string, "DELETE", "Feedback", id, `Deleted feedback`);
        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
