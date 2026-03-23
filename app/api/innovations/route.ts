import { NextResponse } from "next/server";
import { getInnovations, createInnovation, updateInnovation, deleteInnovation, logAudit } from "@/lib/database";
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
        const innovations = await getInnovations();

        const newInitiative = {
            initiative_id: body.initiative_id || `I${1010 + innovations.length}`,
            initiative_name: body.initiative_name || "New Initiative",
            owner: body.owner || "Team Lead",
            type: body.type || "AI",
            status: body.status || "Planning",
            impact_score: Number(body.impact_score) || 5,
            description: body.description || "Project description goes here.",
            start_date: body.start_date || new Date().toISOString().split("T")[0]
        };

        await createInnovation(newInitiative as any);

        await logAudit(
            decoded.email as string,
            "CREATE",
            "Innovation",
            newInitiative.initiative_id,
            `Launched innovation: ${newInitiative.initiative_name}`
        );

        return NextResponse.json({ success: true, innovation: newInitiative });
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
        const { initiative_id, ...updates } = body;

        if (!initiative_id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

        await updateInnovation(initiative_id, updates);

        await logAudit(
            decoded.email as string,
            "UPDATE",
            "Innovation",
            initiative_id,
            `Updated innovation: ${initiative_id}`
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

        await deleteInnovation(id);

        await logAudit(
            decoded.email as string,
            "DELETE",
            "Innovation",
            id,
            `Archived innovation: ${id}`
        );

        return NextResponse.json({ success: true });
    } catch (e) {
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
