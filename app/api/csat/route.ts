import { NextResponse } from "next/server";
import { getCSAT, createCSAT, updateCSAT, deleteCSAT, logAudit } from "@/lib/database";
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
            id: body.id || `C${Date.now()}`,
            customer: body.customer || "Client name",
            project_id: body.project_id || "P001",
            survey_date: body.survey_date || new Date().toISOString().split("T")[0],
            survey_score: body.survey_score || 0,
            feedback: body.feedback || "",
            action_plan: body.action_plan || ""
        };

        await createCSAT(newRecord as any);

        await logAudit(
            decoded.email as string,
            "CREATE",
            "CSAT",
            newRecord.id,
            `Logged CSAT from ${newRecord.customer} (Score: ${newRecord.survey_score})`
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

        await updateCSAT(id, updates);

        await logAudit(
            decoded.email as string,
            "UPDATE",
            "CSAT",
            id,
            `Updated CSAT for ${id}`
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

        await deleteCSAT(id);

        await logAudit(
            decoded.email as string,
            "DELETE",
            "CSAT",
            id,
            `Removed CSAT: ${id}`
        );

        return NextResponse.json({ success: true });
    } catch (e) {
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
