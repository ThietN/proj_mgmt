import { getCSAT, getProjects } from "@/lib/database";
import { CSATClient } from "@/components/csat/CSATClient";
import { KpiCard } from "@/components/ui/KpiCard";
import { Star, AlertTriangle, TrendingUp, Users } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CSATPage({ searchParams }: { searchParams: Promise<{ month?: string, quarter?: string }> }) {
    const sp = await searchParams;
    const { month, quarter } = sp;
    let records = await getCSAT();
    const projects = await getProjects();

    // Filter by Month
    if (month) {
        const m = parseInt(month);
        records = records.filter(r => new Date(r.survey_date).getMonth() + 1 === m);
    }

    // Filter by Quarter
    if (quarter) {
        const q = parseInt(quarter);
        const qMonths = [[1, 2, 3], [4, 5, 6], [7, 8, 9], [10, 11, 12]][q - 1];
        records = records.filter(r => qMonths.includes(new Date(r.survey_date).getMonth() + 1));
    }

    const avgScore = records.length
        ? records.reduce((a, b) => a + b.survey_score, 0) / records.length
        : 0;
    const atRisk = records.filter((r) => r.survey_score < 7);
    const excellent = records.filter((r) => r.survey_score >= 9);
    const customers = Array.from(new Set(records.map((c) => c.customer))).length;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Customer Satisfaction (CSAT)</h1>
                <p className="text-sm text-slate-500 mt-0.5">Track customer feedback, scores, and action plans</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <KpiCard title="Average CSAT" value={`${avgScore.toFixed(1)}/10`} icon={Star} iconColor="text-amber-600" iconBg="bg-amber-50" />
                <KpiCard title="Customers" value={customers} icon={Users} iconColor="text-blue-600" iconBg="bg-blue-600/10" />
                <KpiCard title="Excellent (≥9)" value={excellent.length} icon={TrendingUp} iconColor="text-emerald-600" iconBg="bg-emerald-50" />
                <KpiCard title="At Risk (<7)" value={atRisk.length} icon={AlertTriangle} iconColor="text-red-600" iconBg="bg-red-50" highlight={atRisk.length > 0} />
            </div>

            <CSATClient records={records} projects={projects} />
        </div>
    );
}
