import { getCSAT } from "@/lib/data";
import { CSATClient } from "@/components/csat/CSATClient";
import { KpiCard } from "@/components/ui/KpiCard";
import { Star, AlertTriangle, TrendingUp, Users } from "lucide-react";

export const dynamic = "force-dynamic";

export default function CSATPage() {
    const records = getCSAT();
    const avgScore = records.length
        ? records.reduce((a, b) => a + b.survey_score, 0) / records.length
        : 0;
    const atRisk = records.filter((r) => r.survey_score < 7);
    const excellent = records.filter((r) => r.survey_score >= 9);
    const customers = Array.from(new Set(records.map((c) => c.customer))).length;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white">Customer Satisfaction (CSAT)</h1>
                <p className="text-sm text-slate-500 mt-0.5">Track customer feedback, scores, and action plans</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <KpiCard title="Average CSAT" value={`${avgScore.toFixed(1)}/10`} icon={Star} iconColor="text-amber-400" iconBg="bg-amber-500/10" />
                <KpiCard title="Customers" value={customers} icon={Users} iconColor="text-indigo-400" iconBg="bg-indigo-500/10" />
                <KpiCard title="Excellent (≥9)" value={excellent.length} icon={TrendingUp} iconColor="text-emerald-400" iconBg="bg-emerald-500/10" />
                <KpiCard title="At Risk (<7)" value={atRisk.length} icon={AlertTriangle} iconColor="text-red-400" iconBg="bg-red-500/10" highlight={atRisk.length > 0} />
            </div>

            <CSATClient records={records} />
        </div>
    );
}
