import { getInnovations } from "@/lib/database";
import { InnovationsClient } from "@/components/innovations/InnovationsClient";
import { KpiCard } from "@/components/ui/KpiCard";
import { Lightbulb, Zap, CheckCircle, Clock } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function InnovationsPage({ searchParams }: { searchParams: { month?: string, quarter?: string } }) {
    const { month, quarter } = searchParams;
    let innovations = await getInnovations();

    // Filter by Month (if provided)
    if (month) {
        const m = parseInt(month);
        innovations = innovations.filter(i => new Date(i.start_date).getMonth() + 1 === m);
    }

    // Filter by Quarter (if provided)
    if (quarter) {
        const q = parseInt(quarter);
        const qMonths = [
            [1, 2, 3],
            [4, 5, 6],
            [7, 8, 9],
            [10, 11, 12]
        ][q - 1];
        innovations = innovations.filter(i => qMonths.includes(new Date(i.start_date).getMonth() + 1));
    }

    const inProgress = innovations.filter((i) => i.status === "In Progress");
    const completed = innovations.filter((i) => i.status === "Completed");
    const planning = innovations.filter((i) => i.status === "Planning");
    const avgImpact = innovations.length
        ? (innovations.reduce((a, b) => a + b.impact_score, 0) / innovations.length).toFixed(1)
        : "N/A";

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Technical & Innovation</h1>
                <p className="text-sm text-slate-500 mt-0.5">Internal innovation initiatives and R&D tracking</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <KpiCard title="Total Initiatives" value={innovations.length} icon={Lightbulb} iconColor="text-pink-400" iconBg="bg-pink-500/10" />
                <KpiCard title="In Progress" value={inProgress.length} icon={Zap} iconColor="text-blue-400" iconBg="bg-blue-50" />
                <KpiCard title="Completed" value={completed.length} icon={CheckCircle} iconColor="text-emerald-600" iconBg="bg-emerald-50" />
                <KpiCard title="Avg Impact Score" value={`${avgImpact}/10`} icon={Clock} iconColor="text-amber-600" iconBg="bg-amber-50" subValue={`${planning.length} in planning`} />
            </div>

            <InnovationsClient innovations={innovations} />
        </div>
    );
}
