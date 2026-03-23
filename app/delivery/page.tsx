import { getProjects } from "@/lib/database";
import { DeliveryClient } from "@/components/delivery/DeliveryClient";
import { KpiCard } from "@/components/ui/KpiCard";
import { Rocket, AlertTriangle, CheckCircle, Activity } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DeliveryPage({ searchParams }: { searchParams: Promise<{ month?: string, quarter?: string }> }) {
    const sp = await searchParams;
    const { month, quarter } = sp;
    let projects = await getProjects();

    // Filter by Month (if provided)
    if (month) {
        const m = parseInt(month);
        projects = projects.filter(p => new Date(p.start_date).getMonth() + 1 === m);
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
        projects = projects.filter(p => qMonths.includes(new Date(p.start_date).getMonth() + 1));
    }

    const active = projects.filter((p) => p.delivery_status !== "Completed");
    const atRisk = projects.filter((p) => p.delivery_status === "At Risk" || p.delivery_status === "Critical");
    const completed = projects.filter((p) => p.delivery_status === "Completed");
    const onTrack = projects.filter((p) => p.delivery_status === "On Track");

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Delivery Tracking</h1>
                <p className="text-sm text-slate-500 mt-0.5">Project health, milestones, and risk indicators</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <KpiCard title="Active Projects" value={active.length} icon={Rocket} iconColor="text-blue-600" iconBg="bg-blue-600/10" />
                <KpiCard title="On Track" value={onTrack.length} icon={CheckCircle} iconColor="text-emerald-600" iconBg="bg-emerald-50" />
                <KpiCard title="At Risk / Critical" value={atRisk.length} icon={AlertTriangle} iconColor="text-red-600" iconBg="bg-red-50" highlight={atRisk.length > 0} />
                <KpiCard title="Completed" value={completed.length} icon={Activity} iconColor="text-slate-500" iconBg="bg-slate-500/10" />
            </div>

            <DeliveryClient projects={projects} />
        </div>
    );
}
