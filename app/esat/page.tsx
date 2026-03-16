import { getESAT } from "@/lib/database";
import { ESATClient } from "@/components/esat/ESATClient";
import { KpiCard } from "@/components/ui/KpiCard";
import { Smile, TrendingUp, Users, Star } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ESATPage({ searchParams }: { searchParams: { month?: string, quarter?: string } }) {
    const { month, quarter } = searchParams;
    let records = await getESAT();

    // Filter by Quarter (based on Topbar)
    if (quarter) {
        const qStr = `Q${quarter}`;
        records = records.filter(r => r.quarter.includes(qStr));
    } else if (month) {
        // Map month to quarter for ESAT
        const m = parseInt(month);
        const q = Math.ceil(m / 3);
        const qStr = `Q${q}`;
        records = records.filter(r => r.quarter.includes(qStr));
    }

    const quarters = Array.from(new Set(records.map((e) => e.quarter))).sort();
    const latestQ = quarters[quarters.length - 1];
    const latestRecords = records.filter((e) => e.quarter === latestQ);
    const avgScore = latestRecords.length
        ? latestRecords.reduce((a, b) => a + b.score, 0) / latestRecords.length
        : 0;
    const highestTeam = latestRecords.sort((a, b) => b.score - a.score)[0];
    const teams = Array.from(new Set(records.map((e) => e.team))).length;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Employee Satisfaction (ESAT)</h1>
                <p className="text-sm text-slate-500 mt-0.5">Quarterly surveys, trends, and team comparisons</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <KpiCard title="Latest Avg Score" value={`${avgScore.toFixed(1)}/10`} icon={Smile} iconColor="text-sky-600" iconBg="bg-sky-50" subValue={latestQ} />
                <KpiCard title="Quarters Tracked" value={quarters.length} icon={TrendingUp} iconColor="text-blue-600" iconBg="bg-blue-600/10" />
                <KpiCard title="Teams" value={teams} icon={Users} iconColor="text-cyan-600" iconBg="bg-cyan-50" />
                <KpiCard title="Top Team Score" value={highestTeam ? `${highestTeam.score}/10` : "N/A"} icon={Star} iconColor="text-amber-600" iconBg="bg-amber-50" subValue={highestTeam?.team} />
            </div>

            <ESATClient records={records} quarters={quarters} />
        </div>
    );
}
