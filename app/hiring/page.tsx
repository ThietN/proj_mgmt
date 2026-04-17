import { getInterns, getInternMetrics, getResources } from "@/lib/database";
import { InternTracker } from "@/components/hiring/InternTracker";
import { InternSummaryCards } from "@/components/hiring/InternSummaryCards";
import { GraduationCap, ArrowRight, UserCheck } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function HiringPage({ searchParams }: { searchParams: Promise<any> }) {
    const sp = await searchParams;
    // Fetch all interns for unified management
    const allInterns = await getInterns(sp);
    const metrics = await getInternMetrics();
    const resources = await getResources();

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200">
                        <UserCheck className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Hiring & Intern Management</h1>
                        <p className="text-sm text-slate-500 font-medium">Unified pipeline from recruitment to project conversion</p>
                    </div>
                </div>
            </div>

            <InternSummaryCards metrics={metrics} />

            <InternTracker initialData={allInterns} resources={resources} />
        </div>
    );
}
