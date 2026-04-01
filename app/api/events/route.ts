import { NextResponse } from "next/server";
import { getEvents, createEvent, updateEvent, deleteEvent, logAudit } from "@/lib/database";
import { verifyToken } from "@/lib/auth";

async function getAuth(req: Request) {
    const token = req.headers.get("cookie")?.split("; ").find(c => c.startsWith("auth_token="))?.split("=")[1];
    if (!token) return null;
    return await verifyToken(token);
}

export async function GET() {
    try {
        const events = await getEvents();
        return NextResponse.json({ events });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const decoded = await getAuth(req);
        if (!decoded) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        const body = await req.json();
        const event = await createEvent({ ...body, organizer: body.organizer || decoded.email });
        await logAudit(decoded.email as string, "CREATE", "Event", event.id, `Created event: ${event.title}`);
        return NextResponse.json({ event });
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
        await updateEvent(id, updates);
        await logAudit(decoded.email as string, "UPDATE", "Event", id, `Updated event: ${updates.title || id}`);
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
        await deleteEvent(id);
        await logAudit(decoded.email as string, "DELETE", "Event", id, `Deleted event`);
        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
