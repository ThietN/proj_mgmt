import AttendanceDashboard from "@/components/attendance/AttendanceDashboard";

export const dynamic = "force-dynamic";

export default function AttendancePage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 leading-tight">Attendance Dashboard</h1>
                    <p className="text-sm text-slate-500 font-medium">Work Tracker analytics and employee attendance monitoring</p>
                </div>
            </div>

            <AttendanceDashboard />
        </div>
    );
}
