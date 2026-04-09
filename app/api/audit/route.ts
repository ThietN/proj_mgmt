import { NextResponse } from "next/server";
import { getAuditLogs, logAudit } from "@/lib/database";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("auth_token")?.value;
        
        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const decoded = await verifyToken(token);
        if (!decoded) {
            return NextResponse.json({ error: "Invalid token" }, { status: 401 });
        }

        const userEmail = decoded.email as string;
        const userRole = (decoded.role as string) || "User";

        if (userRole !== "SuperAdmin") {
            await logAudit(userEmail, "ACCESS_DENIED", "AuditLog", "system", `Denied access to Audit Log (Role: ${userRole})`);
            return NextResponse.json({ error: "Forbidden: SuperAdmin only" }, { status: 403 });
        }

        await logAudit(userEmail, "ACCESS_ALLOWED", "AuditLog", "system", `Allowed access to Audit Log`);
        const logs = await getAuditLogs();
        return NextResponse.json(logs);
    } catch (e: any) {
        console.error("[GET /api/audit] error:", e);
        return NextResponse.json({ error: "Failed to fetch logs" }, { status: 500 });
    }
}
