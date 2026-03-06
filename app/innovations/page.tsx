import { getInnovations } from "@/lib/data";
import { InnovationsClient } from "@/components/innovations/InnovationsClient";
import { KpiCard } from "@/components/ui/KpiCard";
import { Lightbulb, Zap, CheckCircle, Clock } from "lucide-react";

export const dynamic = "force-dynamic";

export default function InnovationsPage() {
    const innovations = getInnovations();
    const inProgress = innovations.filter((i) => i.status === "In Progress");
    const completed = innovations.filter((i) => i.status === "Completed");
    const planning = innovations.filter((i) => i.status === "Planning");
    const avgImpact = innovations.length
        ? (innovations.reduce((a, b) => a + b.impact_score, 0) / innovations.length).toFixed(1)
        : "N/A";

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white">Technical & Innovation</h1>
                <p className="text-sm text-slate-500 mt-0.5">Internal innovation initiatives and R&D tracking</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <KpiCard title="Total Initiatives" value={innovations.length} icon={Lightbulb} iconColor="text-pink-400" iconBg="bg-pink-500/10" />
                <KpiCard title="In Progress" value={inProgress.length} icon={Zap} iconColor="text-blue-400" iconBg="bg-blue-500/10" />
                <KpiCard title="Completed" value={completed.length} icon={CheckCircle} iconColor="text-emerald-400" iconBg="bg-emerald-500/10" />
                <KpiCard title="Avg Impact Score" value={`${avgImpact}/10`} icon={Clock} iconColor="text-amber-400" iconBg="bg-amber-500/10" subValue={`${planning.length} in planning`} />
            </div>

            <InnovationsClient innovations={innovations} />
        </div>
    );
}
