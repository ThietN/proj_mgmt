import { NextResponse } from "next/server";
import { getSurveys, createSurvey, updateSurvey, deleteSurvey, logAudit } from "@/lib/database";
import { verifyToken } from "@/lib/auth";

async function getAuth(req: Request) {
    const token = req.headers.get("cookie")?.split("; ").find(c => c.startsWith("auth_token="))?.split("=")[1];
    if (!token) return null;
    return await verifyToken(token);
}

export async function GET() {
    try {
        const surveys = await getSurveys();
        return NextResponse.json({ surveys });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const decoded = await getAuth(req);
        if (!decoded) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        const body = await req.json();
        const survey = await createSurvey({ ...body, created_by: decoded.email });
        await logAudit(decoded.email as string, "CREATE", "Survey", survey.id, `Created survey: ${survey.title}`);
        return NextResponse.json({ survey });
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
        await updateSurvey(id, updates);
        await logAudit(decoded.email as string, "UPDATE", "Survey", id, `Updated survey: ${updates.title || id}`);
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
        await deleteSurvey(id);
        await logAudit(decoded.email as string, "DELETE", "Survey", id, `Deleted survey`);
        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
