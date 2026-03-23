import { NextResponse } from "next/server";
import { getESAT, createESAT, updateESAT, deleteESAT, logAudit } from "@/lib/database";
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

        const newRecord = {
            id: body.id || `E${Date.now()}`,
            team: body.team || "Team A",
            quarter: body.quarter || "2024-Q1",
            score: Number(body.score) || 0,
            respondents: Number(body.respondents) || 0,
            top_positive: body.top_positive || "",
            top_improvement: body.top_improvement || "",
            comment: body.comment || ""
        };

        await createESAT(newRecord as any);

        await logAudit(
            decoded.email as string,
            "CREATE",
            "ESAT",
            newRecord.id,
            `Logged ESAT for ${newRecord.team} - ${newRecord.quarter}`
        );

        return NextResponse.json({ success: true, record: newRecord });
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
        const { id, ...updates } = body;

        if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

        await updateESAT(id, updates);

        await logAudit(
            decoded.email as string,
            "UPDATE",
            "ESAT",
            id,
            `Updated ESAT for ${id}`
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

        await deleteESAT(id);

        await logAudit(
            decoded.email as string,
            "DELETE",
            "ESAT",
            id,
            `Deleted ESAT record: ${id}`
        );

        return NextResponse.json({ success: true });
    } catch (e) {
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
