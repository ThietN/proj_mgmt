import {
    getResources,
    getProjects,
    getESAT,
    getCSAT,
    getInnovations,
    getAttendanceTrend,
    getInternMetrics,
    getHiring
} from "@/lib/database";
import { KpiCard } from "@/components/ui/KpiCard";
import { DashboardChartsDynamic } from "@/components/dashboard/DashboardChartsDynamic";
import {
    Users,
    TrendingUp,
    UserCheck,
    Shield,
    AlertTriangle,
    Smile,
    Star,
    Lightbulb,
    Briefcase,
    ShieldCheck
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ month?: string, quarter?: string }> }) {
    let resources: any[] = [];
    let projects: any[] = [];
    let esatRecords: any[] = [];
    let csatRecords: any[] = [];
    let innovations: any[] = [];

    const sp = await searchParams;
    const { month, quarter } = sp;

    try {
        resources = await getResources();
        projects = await getProjects();
        esatRecords = await getESAT();
        csatRecords = await getCSAT();
        innovations = await getInnovations();
        const attendanceTrend = await getAttendanceTrend(14); // Last 14 days
        const internMetrics = await getInternMetrics();
        const candidates = await getHiring();

        // Filter by Month (if provided)
        if (month) {
            const m = parseInt(month);
            resources = resources.filter(r => new Date(r.join_date).getMonth() + 1 === m);
            projects = projects.filter(p => new Date(p.start_date).getMonth() + 1 === m);
            csatRecords = csatRecords.filter(c => new Date(c.survey_date).getMonth() + 1 === m);
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

            resources = resources.filter(r => qMonths.includes(new Date(r.join_date).getMonth() + 1));
            projects = projects.filter(p => qMonths.includes(new Date(p.start_date).getMonth() + 1));
            esatRecords = esatRecords.filter(e => e.quarter.includes(`Q${q}`));
            csatRecords = csatRecords.filter(c => qMonths.includes(new Date(c.survey_date).getMonth() + 1));
            innovations = innovations.filter(i => qMonths.includes(new Date(i.start_date).getMonth() + 1));
        }

        // Sync consistency metrics from Projects
        const projTotalHC = projects.reduce((s, p) => s + (p.headcount || 0), 0);
        const projTotalEffort = projects.reduce((s, p) => s + (p.effort || 0), 0);
        const projTotalBillable = projects.reduce((s, p) => s + (p.billable || 0), 0);
        const projBillableRate = projTotalEffort > 0 ? Math.round((projTotalBillable / projTotalEffort) * 100) : 0;

        const billable = resources.filter((r) => r.status === "Billable");
        const backup = resources.filter((r) => r.status === "Backup");
        const available = resources.filter((r) => r.status === "Available");

        const atRisk = projects.filter(
            (p) => p.delivery_status === "At Risk" || p.delivery_status === "Critical"
        );

        // ESAT: latest quarter average
        const quarters = Array.from(new Set(esatRecords.map((e) => e.quarter))).sort();
        const latestQ = quarters[quarters.length - 1] || "Current";
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
        const csatCustomers = Array.from(new Set(csatRecords.map((c) => c.customer)));
        const csatByProject = csatCustomers.map((cust) => {
            const recs = csatRecords.filter((c) => c.customer === cust);
            const avg = recs.reduce((a, b) => a + b.survey_score, 0) / recs.length;
            const displayName = cust ? (cust.split(" ").slice(0, 2).join(" ")) : "Unknown";
            return { project: displayName, score: parseFloat(avg.toFixed(1)) };
        });

        // Skills coverage (top skills)
        const allSkills: Record<string, number> = {};
        resources.forEach((r) => {
            const skillsArray = Array.isArray(r.skills) ? r.skills : [];
            skillsArray.forEach((s: string) => {
                allSkills[s] = (allSkills[s] ?? 0) + 1;
            });
        });
        const topSkills = Object.entries(allSkills)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 7)
            .map(([skill, count]) => ({ skill, count }));

        return (
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Executive Dashboard</h1>
                        <p className="text-sm text-slate-500 mt-0.5">
                            {latestQ} · {projTotalHC} total capacity · {projects.filter(p => p.delivery_status !== "Completed").length} active projects
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500 bg-white border border-slate-200 px-3 py-1.5 rounded-lg">
                            Last updated: today
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="animate-fadeInUp animate-fadeInUp-delay-1">
                        <KpiCard
                            title="Actual Headcount"
                            value={projTotalHC.toFixed(1)}
                            subValue={`Synced from projects`}
                            trend="up"
                            trendValue="Active"
                            icon={Users}
                            iconColor="text-blue-600"
                            iconBg="bg-blue-600/10"
                        />
                    </div>
                    <div className="animate-fadeInUp animate-fadeInUp-delay-2">
                        <KpiCard
                            title="Total Effort"
                            value={projTotalEffort.toFixed(1)}
                            subValue="Total FTE Allocation"
                            icon={Briefcase}
                            iconColor="text-indigo-600"
                            iconBg="bg-indigo-50"
                        />
                    </div>
                    <div className="animate-fadeInUp animate-fadeInUp-delay-3">
                        <KpiCard
                            title="Billable"
                            value={projTotalBillable.toFixed(1)}
                            subValue="Revenue-generating FTE"
                            icon={ShieldCheck}
                            iconColor="text-emerald-600"
                            iconBg="bg-emerald-50"
                        />
                    </div>
                    <div className="animate-fadeInUp animate-fadeInUp-delay-4">
                        <KpiCard
                            title="NBR (%)"
                            value={`${(projTotalEffort > 0 ? ((projTotalEffort - projTotalBillable) / projTotalEffort) * 100 : 0).toFixed(1)}%`}
                            subValue="Non-Billable Rate"
                            trend="neutral"
                            icon={TrendingUp}
                            iconColor="text-pink-500"
                            iconBg="bg-pink-50"
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
                            iconColor="text-red-600"
                            iconBg="bg-red-50"
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
                            iconColor="text-sky-600"
                            iconBg="bg-sky-50"
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
                            iconColor="text-amber-600"
                            iconBg="bg-amber-50"
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
                <DashboardChartsDynamic
                    allocationData={allocationData}
                    headcountTrend={headcountTrend}
                    esatByQuarter={esatByQuarter}
                    csatByProject={csatByProject}
                    topSkills={topSkills}
                    attendanceTrend={attendanceTrend}
                    internMetrics={internMetrics}
                    candidates={candidates}
                />

                {/* Quick risk table */}
                {atRisk.length > 0 && (
                    <div className="glass-card p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <AlertTriangle className="w-4 h-4 text-red-600" />
                            <h2 className="text-sm font-semibold text-slate-900">Projects Needing Attention</h2>
                        </div>
                        <div className="space-y-2">
                            {atRisk.map((proj) => (
                                <div key={proj.project_id} className="flex items-center justify-between p-3 bg-red-500/5 border border-red-500/15 rounded-lg">
                                    <div>
                                        <div className="text-sm font-medium text-slate-900">{proj.project_name}</div>
                                        <div className="text-xs text-slate-500">{proj.customer} · HC: {proj.headcount} · Effort: {proj.effort}</div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="text-xs text-slate-500">Milestone: {proj.milestone_progress}%</div>
                                        <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${proj.delivery_status === "Critical"
                                            ? "bg-red-50 text-red-600 border-red-200"
                                            : "bg-amber-50 text-amber-600 border-amber-200"
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
    } catch (error: any) {
        return (
            <div className="p-10 m-10 bg-red-100 border-2 border-red-500 rounded-xl text-red-900 overflow-auto">
                <h1 className="text-xl font-bold mb-4">Error Detected in Server Component</h1>
                <pre className="whitespace-pre-wrap">{error?.message || String(error)}</pre>
                <div className="mt-4 text-sm font-mono whitespace-pre-wrap">Stack trace:<br />{error?.stack}</div>
            </div>
        );
    }
}
