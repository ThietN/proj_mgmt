import { getESAT } from "@/lib/data";
import { ESATClient } from "@/components/esat/ESATClient";
import { KpiCard } from "@/components/ui/KpiCard";
import { Smile, TrendingUp, Users, Star } from "lucide-react";

export const dynamic = "force-dynamic";

export default function ESATPage() {
    const records = getESAT();
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
                <h1 className="text-2xl font-bold text-white">Employee Satisfaction (ESAT)</h1>
                <p className="text-sm text-slate-500 mt-0.5">Quarterly surveys, trends, and team comparisons</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <KpiCard title="Latest Avg Score" value={`${avgScore.toFixed(1)}/10`} icon={Smile} iconColor="text-violet-400" iconBg="bg-violet-500/10" subValue={latestQ} />
                <KpiCard title="Quarters Tracked" value={quarters.length} icon={TrendingUp} iconColor="text-indigo-400" iconBg="bg-indigo-500/10" />
                <KpiCard title="Teams" value={teams} icon={Users} iconColor="text-cyan-400" iconBg="bg-cyan-500/10" />
                <KpiCard title="Top Team Score" value={highestTeam ? `${highestTeam.score}/10` : "N/A"} icon={Star} iconColor="text-amber-400" iconBg="bg-amber-500/10" subValue={highestTeam?.team} />
            </div>

            <ESATClient records={records} quarters={quarters} />
        </div>
    );
}
