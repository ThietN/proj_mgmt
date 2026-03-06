import { getHiring } from "@/lib/data";
import { HiringClient } from "@/components/hiring/HiringClient";
import { KpiCard } from "@/components/ui/KpiCard";
import { UserPlus, CheckCircle, Clock, Users } from "lucide-react";

export const dynamic = "force-dynamic";

export default function HiringPage() {
    const candidates = getHiring();
    const activeInterns = candidates.filter((c) => c.type === "Intern" && c.interview_status === "Joined");
    const activeCandidates = candidates.filter((c) => c.type === "Candidate" && !["Joined", "Rejected"].includes(c.interview_status));
    const offers = candidates.filter((c) => c.interview_status === "Offer");
    const joined = candidates.filter((c) => c.interview_status === "Joined");

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white">Hiring & Intern Management</h1>
                <p className="text-sm text-slate-500 mt-0.5">Pipeline tracking and intern progress</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <KpiCard title="Active Pipeline" value={activeCandidates.length} icon={UserPlus} iconColor="text-indigo-400" iconBg="bg-indigo-500/10" subValue="Candidates in process" />
                <KpiCard title="Offers Sent" value={offers.length} icon={CheckCircle} iconColor="text-amber-400" iconBg="bg-amber-500/10" />
                <KpiCard title="Active Interns" value={activeInterns.length} icon={Users} iconColor="text-violet-400" iconBg="bg-violet-500/10" />
                <KpiCard title="Joined This Quarter" value={joined.length} icon={Clock} iconColor="text-emerald-400" iconBg="bg-emerald-500/10" />
            </div>

            <HiringClient initialData={candidates} />
        </div>
    );
}
