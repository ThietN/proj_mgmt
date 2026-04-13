import { NextResponse } from "next/server";
import { batchInsertAttendance, logAttendanceUpload, clearAttendanceRecords } from "@/lib/database";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

const LATE_THRESHOLD = "09:00";

function classifyStatus(checkInTime: string): "ON_TIME" | "LATE" | "NOT_ACCESS" | "INVALID" {
    const time = checkInTime?.trim();
    
    if (!time) return "INVALID";
    if (time === "Not Access") return "NOT_ACCESS";

    // Expected format HH:mm
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/;
    if (!timeRegex.test(time)) return "INVALID";

    return time > LATE_THRESHOLD ? "LATE" : "ON_TIME";
}

export async function POST(req: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("auth_token")?.value;
        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const decoded = await verifyToken(token);
        if (!decoded) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

        const { fileName, records } = await req.json();

        if (!records || !Array.isArray(records)) {
            return NextResponse.json({ error: "Invalid data format" }, { status: 400 });
        }

        const startTime = Date.now();
        let lateCount = 0;
        let notAccessCount = 0;
        let invalidCount = 0;

        const normalizedRecords = records.map(row => {
            const status = classifyStatus(row.check_in_time);
            if (status === "LATE") lateCount++;
            else if (status === "NOT_ACCESS") notAccessCount++;
            else if (status === "INVALID") invalidCount++;

            return {
                employee_name: row.employee_name,
                username: row.username,
                badge_id: row.badge_id,
                project: row.project,
                program: row.program,
                dc_name: row.dc_name,
                bu_name: row.bu_name,
                tracking_date: row.tracking_date,
                check_in_time: row.check_in_time,
                status
            };
        });

        // 1. Clear existing dataset in memory / state store (db)
        await clearAttendanceRecords();

        // 2. Batch insert new records
        await batchInsertAttendance(normalizedRecords);

        const duration = Date.now() - startTime;

        // Log the upload
        await logAttendanceUpload({
            file_name: fileName,
            rows_processed: normalizedRecords.length,
            late_count: lateCount,
            not_access_count: notAccessCount,
            invalid_count: invalidCount,
            processing_time_ms: duration,
            upload_user: (decoded as any).email,
            upload_time: new Date().toISOString()
        });

        return NextResponse.json({
            success: true,
            processed: normalizedRecords.length,
            late: lateCount,
            notAccess: notAccessCount,
            invalid: invalidCount,
            timeMs: duration
        });
    } catch (e: any) {
        console.error("[POST /api/attendance/upload] error:", e);
        return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
    }
}
