import { NextResponse } from "next/server";
import { getTrackingTasks, createTrackingTask, updateTrackingTask, deleteTrackingTask, logAudit } from "@/lib/database";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

export async function GET() {
    try {
        const tasks = await getTrackingTasks();
        return NextResponse.json({ tasks });
    } catch (e: any) {
        return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("auth_token")?.value;
        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const decoded = await verifyToken(token);
        if (!decoded) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

        const body = await req.json();
        const now = new Date().toISOString();

        const newTask = {
            id: body.id || `T${Date.now()}`,
            title: body.title || "Untitled Task",
            description: body.description || "",
            status: body.status || "Backlog",
            priority: body.priority || "Medium",
            assignee: body.assignee || "",
            project_id: body.project_id || null,
            labels: body.labels || [],
            due_date: body.due_date || null,
            effort: body.effort ? Number(body.effort) : null,
            created_at: now,
            updated_at: now,
            order_index: body.order_index ?? 0,
        };

        await createTrackingTask(newTask as any);

        await logAudit(
            decoded.email as string,
            "CREATE",
            "TrackingTask",
            newTask.id,
            `Created task: ${newTask.title}`
        );

        return NextResponse.json({ success: true, task: newTask });
    } catch (e: any) {
        console.error("[POST /api/tracking] error:", e);
        return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("auth_token")?.value;
        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const decoded = await verifyToken(token);
        if (!decoded) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

        const body = await req.json();
        const { id, ...updates } = body;

        if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

        console.log(`[PUT /api/tracking] Updating task ${id}:`, updates);

        updates.updated_at = new Date().toISOString();
        if (updates.effort !== undefined) updates.effort = Number(updates.effort);

        await updateTrackingTask(id, updates);

        await logAudit(
            decoded.email as string,
            "UPDATE",
            "TrackingTask",
            id,
            `Updated task ${id}: ${Object.keys(updates).join(", ")}`
        );

        return NextResponse.json({ success: true, id, updates });
    } catch (e: any) {
        console.error("[PUT /api/tracking] error:", e);
        return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("auth_token")?.value;
        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const decoded = await verifyToken(token);
        if (!decoded) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

        await deleteTrackingTask(id);

        await logAudit(
            decoded.email as string,
            "DELETE",
            "TrackingTask",
            id,
            `Deleted task: ${id}`
        );

        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
    }
}
