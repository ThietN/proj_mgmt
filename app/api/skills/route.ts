import { NextResponse } from "next/server";
import { getSkills, createSkillEntry, updateSkillEntry, deleteSkillEntry, logAudit } from "@/lib/database";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

export async function POST(req: Request) {
    try {
        const token = cookies().get("auth_token")?.value;
        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const decoded = await verifyToken(token);
        if (!decoded) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

        const body = await req.json();

        const newEntry = {
            id: body.id || `S${Date.now()}`,
            employee_id: body.employee_id,
            skill_name: body.skill_name || "New Skill",
            skill_level: body.skill_level || "Beginner"
        };

        if (!newEntry.employee_id) return NextResponse.json({ error: "Missing Employee ID" }, { status: 400 });

        await createSkillEntry(newEntry as any);

        await logAudit(
            decoded.email as string,
            "CREATE",
            "Skill",
            newEntry.id,
            `Added skill ${newEntry.skill_name} for employee ${newEntry.employee_id}`
        );

        return NextResponse.json({ success: true, entry: newEntry });
    } catch (e) {
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const token = cookies().get("auth_token")?.value;
        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const decoded = await verifyToken(token);
        if (!decoded) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

        const body = await req.json();
        const { id, ...updates } = body;

        if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

        await updateSkillEntry(id, updates);

        await logAudit(
            decoded.email as string,
            "UPDATE",
            "Skill",
            id,
            `Updated skill ${id}`
        );

        return NextResponse.json({ success: true });
    } catch (e) {
        return NextResponse.json({ error: "Server error" }, { status: 500 });
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

        await deleteSkillEntry(id);

        await logAudit(
            decoded.email as string,
            "DELETE",
            "Skill",
            id,
            `Removed skill entry: ${id}`
        );

        return NextResponse.json({ success: true });
    } catch (e) {
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
