import { NextResponse } from "next/server";
import { getProjects, createProject, updateProject, deleteProject, logAudit } from "@/lib/database";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

export async function POST(req: Request) {
    try {
        const token = cookies().get("auth_token")?.value;
        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const decoded = await verifyToken(token);
        if (!decoded) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

        const body = await req.json();
        const projects = await getProjects();

        const newProject = {
            project_id: body.project_id || `P${1010 + projects.length}`,
            project_name: body.project_name || "New Project",
            customer: body.customer || "Internal",
            headcount: body.headcount || 0,
            effort: body.effort || 0,
            billable: body.billable || 0,
            nbr: (body.effort || 0) - (body.billable || 0),
            delivery_status: body.delivery_status || "On Track",
            risk_level: body.risk_level || "Low",
            milestone_progress: body.milestone_progress || 0,
            start_date: body.start_date || new Date().toISOString().split("T")[0],
            end_date: body.end_date || new Date().toISOString().split("T")[0],
            tech_stack: Array.isArray(body.tech_stack) ? body.tech_stack : (body.tech_stack ? body.tech_stack.split(",").map((s: string) => s.trim()) : []),
            // Normalize parent_id: empty string -> null to avoid UUID constraint errors in DB
            parent_id: body.parent_id && body.parent_id.trim() ? body.parent_id.trim() : null
        };

        // Try inserting and catch error
        try {
            await createProject(newProject as any);
        } catch (err: any) {
            console.error("Supabase insert error:", err);
            return NextResponse.json({ error: err.message || "Supabase error" }, { status: 500 });
        }

        await logAudit(
            decoded.email as string,
            "CREATE",
            "Project",
            newProject.project_id,
            `Created project: ${newProject.project_name}`
        );

        return NextResponse.json({ success: true, project: newProject });
    } catch (e: any) {
        console.error("API error:", e);
        return NextResponse.json({ error: e.message || "Server error" }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const token = cookies().get("auth_token")?.value;
        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const decoded = await verifyToken(token);
        if (!decoded) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

        const body = await req.json();
        const { project_id, ...updates } = body;

        if (!project_id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

        // Normalize tech_stack: always store as array
        if (updates.tech_stack && typeof updates.tech_stack === 'string') {
            updates.tech_stack = updates.tech_stack.split(",").map((s: string) => s.trim()).filter(Boolean);
        }

        // Normalize parent_id: empty string -> null to avoid UUID/FK constraint errors in DB
        if ('parent_id' in updates) {
            updates.parent_id = (updates.parent_id && String(updates.parent_id).trim())
                ? String(updates.parent_id).trim()
                : null;
        }

        // Recalculate nbr when both effort and billable are provided
        if (updates.effort !== undefined && updates.billable !== undefined) {
            updates.nbr = (Number(updates.effort) || 0) - (Number(updates.billable) || 0);
        }

        //nmthiet: debug - log full payload before Supabase update
        console.log("[PUT /api/projects] project_id:", project_id);
        console.log("[PUT /api/projects] parent_id after normalize:", updates.parent_id);
        console.log("[PUT /api/projects] updates payload:", JSON.stringify(updates, null, 2));

        const updatedRows = await updateProject(project_id, updates);

        // Confirm upsert result (updated=1 row expected)
        console.log(`[PUT /api/projects] Upserted project "${project_id}": ${updatedRows?.length} row(s). parent_id = ${updatedRows?.[0]?.parent_id}`);

        await logAudit(
            decoded.email as string,
            "UPDATE",
            "Project",
            project_id,
            `Updated project: ${project_id}`
        );

        return NextResponse.json({ success: true });
    } catch (e: any) {
        console.error("PUT /api/projects error:", e);
        return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const token = cookies().get("auth_token")?.value;
        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const decoded = await verifyToken(token);
        if (!decoded) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

        await deleteProject(id);

        await logAudit(
            decoded.email as string,
            "DELETE",
            "Project",
            id,
            `Deleted project: ${id}`
        );

        return NextResponse.json({ success: true });
    } catch (e) {
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
