import { getResources } from "@/lib/data";
import { ResourcesClient } from "@/components/resources/ResourcesClient";
import { KpiCard } from "@/components/ui/KpiCard";
import { Users, TrendingUp, UserCheck, Shield, AlertTriangle } from "lucide-react";

export const dynamic = "force-dynamic";

export default function ResourcesPage() {
    const resources = getResources();

    const billable = resources.filter((r) => r.status === "Billable").length;
    const backup = resources.filter((r) => r.status === "Backup").length;
    const available = resources.filter((r) => r.status === "Available").length;
    const risky = resources.filter((r) => r.risk_flag).length;
    const billableRate = Math.round((billable / resources.length) * 100);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white">Resource Management</h1>
                <p className="text-sm text-slate-500 mt-0.5">
                    Track all engineers, allocation, and team health
                </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <KpiCard title="Total Engineers" value={resources.length} icon={Users} iconColor="text-indigo-400" iconBg="bg-indigo-500/10" />
                <KpiCard title="Billable" value={billable} icon={TrendingUp} iconColor="text-emerald-400" iconBg="bg-emerald-500/10" />
                <KpiCard title="Available" value={available} icon={UserCheck} iconColor="text-cyan-400" iconBg="bg-cyan-500/10" />
                <KpiCard title="Backup" value={backup} icon={Shield} iconColor="text-amber-400" iconBg="bg-amber-500/10" />
                <KpiCard title="At Risk" value={risky} icon={AlertTriangle} iconColor="text-red-400" iconBg="bg-red-500/10" subValue={`Billable rate: ${billableRate}%`} />
            </div>

            <ResourcesClient initialData={resources} />
        </div>
    );
}
