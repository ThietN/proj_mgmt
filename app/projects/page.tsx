import { getProjects, getResources } from "@/lib/database";
import { ProjectsClient } from "@/components/projects/ProjectsClient";
import { KpiCard } from "@/components/ui/KpiCard";
import { Briefcase, Rocket, AlertTriangle, ShieldCheck, Users, TrendingUp, Calendar, Zap, PieChart, Shield, UserCheck } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ProjectsPage({ searchParams }: { searchParams: Promise<{ month?: string, quarter?: string }> }) {
    const sp = await searchParams;
    const { month, quarter } = sp;
    let projects = await getProjects();
    const resources = await getResources();

    // Filter by Month (if provided)
    if (month) {
        const m = parseInt(month);
        projects = projects.filter(p => new Date(p.start_date).getMonth() + 1 === m);
    }

    // Filter by Quarter (if provided)
    if (quarter) {
        const q = parseInt(quarter);
        const qMonths = [[1, 2, 3], [4, 5, 6], [7, 8, 9], [10, 11, 12]][q - 1];
        projects = projects.filter(p => qMonths.includes(new Date(p.start_date).getMonth() + 1));
    }

    // Calculations for the Summary Panel
    const totalHC = projects.reduce((a, b) => a + (b.headcount || 0), 0);
    const totalEffort = projects.reduce((a, b) => a + (b.effort || 0), 0);
    const totalBillable = projects.reduce((a, b) => a + (b.billable || 0), 0);
    const totalNonBillable = totalEffort - totalBillable;
    const nbrRate = totalEffort > 0 ? (totalNonBillable / totalEffort) * 100 : 0;

    // Week Calculation
    const now = new Date();
    const currentYear = now.getFullYear();
    const oneJan = new Date(now.getFullYear(), 0, 1);
    const numberOfDays = Math.floor((now.getTime() - oneJan.getTime()) / (24 * 60 * 60 * 1000));
    const currentWeek = Math.ceil((now.getDay() + 1 + numberOfDays) / 7);

    const active = projects.filter((p) => p.delivery_status !== "Completed").length;
    const completed = projects.filter((p) => p.delivery_status === "Completed").length;
    const atRisk = projects.filter((p) => p.delivery_status === "At Risk" || p.delivery_status === "Critical").length;
    const avgProgress = projects.length
        ? Math.round(projects.reduce((a, b) => a + b.milestone_progress, 0) / projects.length)
        : 0;

    return (
        <div className="space-y-6">
            {/* Executive KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <KpiCard
                    title="Actual Headcount"
                    value={totalHC.toFixed(1)}
                    subValue="Synced from projects"
                    icon={Users}
                    iconColor="text-blue-600"
                    iconBg="bg-blue-600/10"
                />
                <KpiCard
                    title="Billable Rate"
                    value={`${(100 - nbrRate).toFixed(0)}%`}
                    subValue={`${totalBillable.toFixed(1)} / ${totalEffort.toFixed(1)} FTE`}
                    icon={TrendingUp}
                    iconColor="text-emerald-600"
                    iconBg="bg-emerald-50"
                />
                <KpiCard
                    title="Available Pool"
                    value={resources.filter(r => r.status === "Available" || r.status === "Backup").length}
                    subValue="Across Lab 3 & 6"
                    icon={UserCheck}
                    iconColor="text-cyan-600"
                    iconBg="bg-cyan-50"
                />
                <KpiCard
                    title="Projects at Risk"
                    value={atRisk}
                    subValue={`of ${active} active projects`}
                    icon={AlertTriangle}
                    iconColor="text-red-600"
                    iconBg="bg-red-50"
                    highlight={atRisk > 0}
                />
            </div>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Project Management</h1>
                    <p className="text-sm text-slate-500 font-medium mt-1">
                        Register and update internal and client project details
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="text-[10px] font-black uppercase text-slate-400 border border-slate-200 px-3 py-1.5 rounded-lg bg-white shadow-xs">
                        {projects.length} Total Projects
                    </div>
                </div>
            </div>

            <ProjectsClient initialData={projects} resources={resources} />
        </div>
    );
}
