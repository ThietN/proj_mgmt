import { getProjects } from "@/lib/database";
import { ProjectsClient } from "@/components/projects/ProjectsClient";
import { KpiCard } from "@/components/ui/KpiCard";
import { Briefcase, Rocket, AlertTriangle, ShieldCheck, Users, TrendingUp, Calendar, Zap, PieChart } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ProjectsPage({ searchParams }: { searchParams: { month?: string, quarter?: string } }) {
    const { month, quarter } = searchParams;
    let projects = await getProjects();

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
            {/* Top Summary Panel */}
            <div className="bg-white/40 backdrop-blur-md border border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.05)] rounded-2xl p-1 overflow-hidden">
                <div className="grid grid-cols-2 md:grid-cols-7 gap-1">
                    {/* Time Info */}
                    <div className="bg-white p-4 rounded-xl flex flex-col items-center justify-center border border-slate-50">
                        <Calendar className="w-4 h-4 text-blue-500 mb-1.5 opacity-60" />
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Year</span>
                        <span className="text-xl font-black text-slate-800 leading-tight">{currentYear}</span>
                    </div>
                    <div className="bg-white p-4 rounded-xl flex flex-col items-center justify-center border border-slate-50 font-mono">
                        <Zap className="w-4 h-4 text-amber-500 mb-1.5 opacity-60" />
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Week</span>
                        <span className="text-xl font-black text-slate-800 leading-tight">{currentWeek}</span>
                    </div>

                    {/* Resource Totals */}
                    <div className="bg-white p-4 rounded-xl flex flex-col items-center justify-center border border-slate-50">
                        <Users className="w-4 h-4 text-emerald-500 mb-1.5 opacity-60" />
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total HC</span>
                        <span className="text-xl font-black text-slate-800 leading-tight">{totalHC.toFixed(1)}</span>
                    </div>
                    <div className="bg-white p-4 rounded-xl flex flex-col items-center justify-center border border-slate-50">
                        <Briefcase className="w-4 h-4 text-indigo-500 mb-1.5 opacity-60" />
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Effort</span>
                        <span className="text-xl font-black text-slate-800 leading-tight">{totalEffort.toFixed(1)}</span>
                    </div>
                    <div className="bg-white p-4 rounded-xl flex flex-col items-center justify-center border border-slate-50">
                        <ShieldCheck className="w-4 h-4 text-cyan-500 mb-1.5 opacity-60" />
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Billable</span>
                        <span className="text-xl font-black text-slate-800 leading-tight">{totalBillable.toFixed(1)}</span>
                    </div>
                    <div className="bg-white p-4 rounded-xl flex flex-col items-center justify-center border border-slate-50">
                        <TrendingUp className="w-4 h-4 text-pink-500 mb-1.5 opacity-60" />
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Non-Bill</span>
                        <span className="text-xl font-black text-slate-800 leading-tight">{totalNonBillable.toFixed(1)}</span>
                    </div>
                    <div className="bg-white p-4 rounded-xl flex flex-col items-center justify-center border border-slate-50">
                        <PieChart className="w-4 h-4 text-rose-500 mb-1.5 opacity-60" />
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">NBR (%)</span>
                        <span className="text-xl font-black text-slate-800 leading-tight">{nbrRate.toFixed(1)}%</span>
                    </div>
                </div>
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

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <KpiCard title="Active Projects" value={active} icon={Rocket} iconColor="text-blue-600" iconBg="bg-blue-50" />
                <KpiCard title="Avg progress" value={`${avgProgress}%`} icon={Briefcase} iconColor="text-emerald-600" iconBg="bg-emerald-50" />
                <KpiCard title="At Risk" value={atRisk} icon={AlertTriangle} iconColor="text-red-600" iconBg="bg-red-50" />
                <KpiCard title="Completed" value={completed} icon={ShieldCheck} iconColor="text-slate-600" iconBg="bg-slate-50" />
            </div>

            <ProjectsClient initialData={projects} />
        </div>
    );
}
