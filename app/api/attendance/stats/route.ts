import { NextResponse } from "next/server";
import { getAttendanceStats, getTopLateMembers, getTopNotAccessMembers, getAttendanceTrend } from "@/lib/database";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

export async function GET(req: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("auth_token")?.value;
        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const decoded = await verifyToken(token);
        if (!decoded) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const filters = {
            startDate: searchParams.get("startDate"),
            endDate: searchParams.get("endDate"),
            project: searchParams.get("project"),
        };

        const [stats, topLate, topNotAccess, trend] = await Promise.all([
            getAttendanceStats(filters),
            getTopLateMembers(10, filters),
            getTopNotAccessMembers(10, filters),
            getAttendanceTrend(30) // Last 30 days for trend
        ]);

        return NextResponse.json({
            stats,
            topLate,
            topNotAccess,
            trend
        });
    } catch (e: any) {
        console.error("[GET /api/attendance/stats] error:", e);
        return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
    }
}
