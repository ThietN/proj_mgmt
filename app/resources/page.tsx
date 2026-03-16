import { getResources, getProjects } from "@/lib/database";
import { ResourcesClient } from "@/components/resources/ResourcesClient";
import { KpiCard } from "@/components/ui/KpiCard";
import { Users, TrendingUp, UserCheck, Shield, AlertTriangle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ResourcesPage({ searchParams }: { searchParams: { month?: string, quarter?: string } }) {
    const { month, quarter } = searchParams;
    let resources = await getResources();
    const projects = await getProjects();

    // Filter by Month (if provided)
    if (month) {
        const m = parseInt(month);
        resources = resources.filter(r => new Date(r.join_date).getMonth() + 1 === m);
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
    }

    const billable = resources.filter((r) => r.status === "Billable").length;
    const backup = resources.filter((r) => r.status === "Backup").length;
    const available = resources.filter((r) => r.status === "Available").length;
    const risky = resources.filter((r) => r.risk_flag).length;
    const billableRate = resources.length > 0 ? Math.round((billable / resources.length) * 100) : 0;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Resource Management</h1>
                <p className="text-sm text-slate-500 mt-0.5">
                    Track all engineers, allocation, and team health
                </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <KpiCard title="Total Engineers" value={resources.length} icon={Users} iconColor="text-blue-600" iconBg="bg-blue-600/10" />
                <KpiCard title="Billable" value={billable} icon={TrendingUp} iconColor="text-emerald-600" iconBg="bg-emerald-50" />
                <KpiCard title="Available" value={available} icon={UserCheck} iconColor="text-cyan-600" iconBg="bg-cyan-50" />
                <KpiCard title="Backup" value={backup} icon={Shield} iconColor="text-amber-600" iconBg="bg-amber-50" />
                <KpiCard title="At Risk" value={risky} icon={AlertTriangle} iconColor="text-red-600" iconBg="bg-red-50" subValue={`Billable rate: ${billableRate}%`} />
            </div>

            <ResourcesClient initialData={resources} projects={projects} />
        </div>
    );
}
