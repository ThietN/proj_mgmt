import AttendanceUpload from "@/components/attendance/AttendanceUpload";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function AttendanceUploadPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/attendance" className="p-2 hover:bg-slate-100 rounded-xl transition-all">
                    <ArrowLeft className="w-5 h-5 text-slate-400 hover:text-slate-900" />
                </Link>
                <div>
                    <h1 className="text-2xl font-black text-slate-900 leading-tight">Upload Attendance Report</h1>
                    <p className="text-sm text-slate-500 font-medium">Import employee check-in data from Excel files</p>
                </div>
            </div>

            <AttendanceUpload />
        </div>
    );
}
