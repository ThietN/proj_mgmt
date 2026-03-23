import { NextResponse } from "next/server";
import { getAuditLogs } from "@/lib/database";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const logs = await getAuditLogs();
        return NextResponse.json(logs);
    } catch {
        return NextResponse.json({ error: "Failed to fetch logs" }, { status: 500 });
    }
}
