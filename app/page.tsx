import { getResources } from "@/lib/data";
import { getProjects } from "@/lib/data";
import { getESAT } from "@/lib/data";
import { getCSAT } from "@/lib/data";
import { getInnovations } from "@/lib/data";
import { KpiCard } from "@/components/ui/KpiCard";
import { DashboardCharts } from "@/components/dashboard/DashboardCharts";
import {
    Users,
    TrendingUp,
    UserCheck,
    Shield,
    AlertTriangle,
    Smile,
    Star,
    Lightbulb,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default function DashboardPage() {
    const resources = getResources();
    const projects = getProjects();
    const esatRecords = getESAT();
    const csatRecords = getCSAT();
    const innovations = getInnovations();

    const billable = resources.filter((r) => r.status === "Billable");
    const backup = resources.filter((r) => r.status === "Backup");
    const available = resources.filter((r) => r.status === "Available");
    const billableRate = Math.round((billable.length / resources.length) * 100);

    const atRisk = projects.filter(
        (p) => p.delivery_status === "At Risk" || p.delivery_status === "Critical"
    );

    // ESAT: latest quarter average
    const quarters = Array.from(new Set(esatRecords.map((e) => e.quarter))).sort();
    const latestQ = quarters[quarters.length - 1];
    const latestESAT = esatRecords.filter((e) => e.quarter === latestQ);
    const avgESAT =
        latestESAT.length > 0
            ? (latestESAT.reduce((a, b) => a + b.score, 0) / latestESAT.length).toFixed(1)
            : "N/A";

    // CSAT: average of recent records
    const avgCSAT =
        csatRecords.length > 0
            ? (csatRecords.reduce((a, b) => a + b.survey_score, 0) / csatRecords.length).toFixed(1)
            : "N/A";

    const activeInnovations = innovations.filter(
        (i) => i.status === "In Progress" || i.status === "Planning"
    ).length;

    // Chart data for resource allocation pie
    const allocationData = [
        { name: "Billable", value: billable.length, fill: "#6366f1" },
        { name: "Backup", value: backup.length, fill: "#f59e0b" },
        { name: "Available", value: available.length, fill: "#06b6d4" },
    ];

    // Headcount trend (simulated monthly)
    const headcountTrend = [
        { month: "Sep", headcount: 8 },
        { month: "Oct", headcount: 9 },
        { month: "Nov", headcount: 10 },
        { month: "Dec", headcount: 10 },
        { month: "Jan", headcount: 11 },
        { month: "Feb", headcount: 12 },
        { month: "Mar", headcount: resources.length },
    ];

    // ESAT trend per quarter
    const esatByQuarter = quarters.map((q) => {
        const qRecords = esatRecords.filter((e) => e.quarter === q);
        const avg = qRecords.reduce((a, b) => a + b.score, 0) / qRecords.length;
        return { quarter: q, score: parseFloat(avg.toFixed(1)) };
    });

    // CSAT trend
    const csatProjects = Array.from(new Set(csatRecords.map((c) => c.project)));
    const csatByProject = csatProjects.map((p) => {
        const recs = csatRecords.filter((c) => c.project === p);
        const avg = recs.reduce((a, b) => a + b.survey_score, 0) / recs.length;
        return { project: p.split(" ").slice(0, 2).join(" "), score: parseFloat(avg.toFixed(1)) };
    });

    // Skills coverage (top skills)
    const allSkills: Record<string, number> = {};
    resources.forEach((r) => r.skills.forEach((s) => { allSkills[s] = (allSkills[s] ?? 0) + 1; }));
    const topSkills = Object.entries(allSkills)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 7)
        .map(([skill, count]) => ({ skill, count }));

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Executive Dashboard</h1>
                    <p className="text-sm text-slate-500 mt-0.5">
                        {latestQ} · {resources.length} engineers · {projects.filter(p => p.delivery_status !== "Completed").length} active projects
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 bg-[#111122] border border-[#1a1a2e] px-3 py-1.5 rounded-lg">
                        Last updated: today
                    </span>
                </div>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="animate-fadeInUp animate-fadeInUp-delay-1">
                    <KpiCard
                        title="Total Headcount"
                        value={resources.length}
                        subValue={`+2 this quarter`}
                        trend="up"
                        trendValue="20%"
                        icon={Users}
                        iconColor="text-indigo-400"
                        iconBg="bg-indigo-500/10"
                    />
                </div>
                <div className="animate-fadeInUp animate-fadeInUp-delay-2">
                    <KpiCard
                        title="Billable Rate"
                        value={`${billableRate}%`}
                        subValue={`${billable.length} of ${resources.length} engineers`}
                        trend="up"
                        trendValue="5%"
                        icon={TrendingUp}
                        iconColor="text-emerald-400"
                        iconBg="bg-emerald-500/10"
                    />
                </div>
                <div className="animate-fadeInUp animate-fadeInUp-delay-3">
                    <KpiCard
                        title="Available Pool"
                        value={available.length}
                        subValue="Ready for new projects"
                        trend="neutral"
                        icon={UserCheck}
                        iconColor="text-cyan-400"
                        iconBg="bg-cyan-500/10"
                    />
                </div>
                <div className="animate-fadeInUp animate-fadeInUp-delay-4">
                    <KpiCard
                        title="Backup Engineers"
                        value={backup.length}
                        subValue="Partially allocated"
                        trend="neutral"
                        icon={Shield}
                        iconColor="text-amber-400"
                        iconBg="bg-amber-500/10"
                    />
                </div>
                <div className="animate-fadeInUp animate-fadeInUp-delay-5">
                    <KpiCard
                        title="Projects at Risk"
                        value={atRisk.length}
                        subValue={`of ${projects.length} total projects`}
                        trend={atRisk.length > 1 ? "down" : "neutral"}
                        trendValue={atRisk.length > 1 ? "Needs attention" : undefined}
                        icon={AlertTriangle}
                        iconColor="text-red-400"
                        iconBg="bg-red-500/10"
                        highlight={atRisk.length > 0}
                    />
                </div>
                <div className="animate-fadeInUp animate-fadeInUp-delay-6">
                    <KpiCard
                        title="ESAT Score"
                        value={`${avgESAT}/10`}
                        subValue={latestQ}
                        trend="up"
                        trendValue="+0.5"
                        icon={Smile}
                        iconColor="text-violet-400"
                        iconBg="bg-violet-500/10"
                    />
                </div>
                <div className="animate-fadeInUp animate-fadeInUp-delay-7">
                    <KpiCard
                        title="CSAT Score"
                        value={`${avgCSAT}/10`}
                        subValue="Across all customers"
                        trend="up"
                        trendValue="+0.3"
                        icon={Star}
                        iconColor="text-amber-400"
                        iconBg="bg-amber-500/10"
                    />
                </div>
                <div className="animate-fadeInUp animate-fadeInUp-delay-8">
                    <KpiCard
                        title="Active Innovations"
                        value={activeInnovations}
                        subValue={`of ${innovations.length} initiatives`}
                        trend="up"
                        trendValue="+2"
                        icon={Lightbulb}
                        iconColor="text-pink-400"
                        iconBg="bg-pink-500/10"
                    />
                </div>
            </div>

            {/* Charts */}
            <DashboardCharts
                allocationData={allocationData}
                headcountTrend={headcountTrend}
                esatByQuarter={esatByQuarter}
                csatByProject={csatByProject}
                topSkills={topSkills}
            />

            {/* Quick risk table */}
            {atRisk.length > 0 && (
                <div className="glass-card p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <AlertTriangle className="w-4 h-4 text-red-400" />
                        <h2 className="text-sm font-semibold text-white">Projects Needing Attention</h2>
                    </div>
                    <div className="space-y-2">
                        {atRisk.map((proj) => (
                            <div key={proj.project_id} className="flex items-center justify-between p-3 bg-red-500/5 border border-red-500/15 rounded-lg">
                                <div>
                                    <div className="text-sm font-medium text-white">{proj.project_name}</div>
                                    <div className="text-xs text-slate-500">{proj.customer} · Team: {proj.team_size}</div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="text-xs text-slate-400">Milestone: {proj.milestone_progress}%</div>
                                    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${proj.delivery_status === "Critical"
                                        ? "bg-red-500/10 text-red-400 border-red-500/20"
                                        : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                        }`}>
                                        {proj.delivery_status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
