import { NextResponse } from "next/server";
import { getResources, createResource, updateResource, deleteResource, logAudit } from "@/lib/database";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

export async function POST(req: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("auth_token")?.value;
        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const decoded = await verifyToken(token);
        if (!decoded) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

        const body = await req.json();
        const resources = await getResources();

        const newResource = {
            employee_id: body.employee_id || `E${1010 + resources.length}`,
            name: body.name || "Test Engineer",
            role: body.role || "Developer",
            team: body.team || "Testing Team",
            grade: body.grade || "Senior",
            skills: Array.isArray(body.skills) ? body.skills : (body.skills ? body.skills.split(",").map((s: string) => s.trim()) : ["JavaScript", "Python"]),
            english_level: body.english_level || "Intermediate",
            status: body.status || "Billable",
            allocation_percentage: body.allocation_percentage !== undefined ? body.allocation_percentage : 100,
            join_date: body.join_date || new Date().toISOString().split("T")[0],
            location: body.location || "lab3",
            notes: body.notes || "",
            project_id: body.project_id || "",
            is_ramp_up: body.is_ramp_up || false
        };

        await createResource(newResource as any);

        await logAudit(
            decoded.email as string,
            "CREATE",
            "Resource",
            newResource.employee_id,
            `Added new engineer: ${newResource.name}`
        );

        return NextResponse.json({ success: true, resource: newResource });
    } catch (e) {
        return NextResponse.json({ error: "Server error" }, { status: 500 });
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
        const { employee_id, ...updates } = body;

        if (!employee_id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

        if (updates.skills && typeof updates.skills === 'string') {
            updates.skills = updates.skills.split(",").map((s: string) => s.trim());
        }

        await updateResource(employee_id, updates);

        await logAudit(
            decoded.email as string,
            "UPDATE",
            "Resource",
            employee_id,
            `Updated engineer: ${employee_id}`
        );

        return NextResponse.json({ success: true });
    } catch (e) {
        return NextResponse.json({ error: "Server error" }, { status: 500 });
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

        await deleteResource(id);

        await logAudit(
            decoded.email as string,
            "DELETE",
            "Resource",
            id,
            `Removed engineer: ${id}`
        );

        return NextResponse.json({ success: true });
    } catch (e) {
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
