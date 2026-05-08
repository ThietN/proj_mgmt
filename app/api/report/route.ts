import { NextResponse } from "next/server";
import { upsertWeeklyReport } from "@/lib/database";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

export async function PUT(req: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("auth_token")?.value;
        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        const decoded = await verifyToken(token);
        if (!decoded) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

        const body = await req.json();
        const report = {
            id: body.id || `WR_${body.year}_${body.week_number}`,
            week_number: body.week_number,
            year: body.year,
            resource_notes: body.resource_notes || "",
            program_notes: body.program_notes || "",
            innovation_notes: body.innovation_notes || "",
            activities_notes: body.activities_notes || "",
            hiring_notes: body.hiring_notes || "",
            other_notes: body.other_notes || "",
            effort_override: body.effort_override ? Number(body.effort_override) : null,
            updated_at: new Date().toISOString(),
        };
        await upsertWeeklyReport(report as any);
        return NextResponse.json({ success: true, report });
    } catch (e: any) {
        return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
    }
}
