import { getProjects } from "@/lib/data";
import { DeliveryClient } from "@/components/delivery/DeliveryClient";
import { KpiCard } from "@/components/ui/KpiCard";
import { Rocket, AlertTriangle, CheckCircle, Activity } from "lucide-react";

export const dynamic = "force-dynamic";

export default function DeliveryPage() {
    const projects = getProjects();
    const active = projects.filter((p) => p.delivery_status !== "Completed");
    const atRisk = projects.filter((p) => p.delivery_status === "At Risk" || p.delivery_status === "Critical");
    const completed = projects.filter((p) => p.delivery_status === "Completed");
    const onTrack = projects.filter((p) => p.delivery_status === "On Track");

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white">Delivery Tracking</h1>
                <p className="text-sm text-slate-500 mt-0.5">Project health, milestones, and risk indicators</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <KpiCard title="Active Projects" value={active.length} icon={Rocket} iconColor="text-indigo-400" iconBg="bg-indigo-500/10" />
                <KpiCard title="On Track" value={onTrack.length} icon={CheckCircle} iconColor="text-emerald-400" iconBg="bg-emerald-500/10" />
                <KpiCard title="At Risk / Critical" value={atRisk.length} icon={AlertTriangle} iconColor="text-red-400" iconBg="bg-red-500/10" highlight={atRisk.length > 0} />
                <KpiCard title="Completed" value={completed.length} icon={Activity} iconColor="text-slate-400" iconBg="bg-slate-500/10" />
            </div>

            <DeliveryClient projects={projects} />
        </div>
    );
}
