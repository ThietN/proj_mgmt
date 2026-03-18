import { getHiring } from "@/lib/database";
import { HiringClient } from "@/components/hiring/HiringClient";
import { KpiCard } from "@/components/ui/KpiCard";
import { UserPlus, CheckCircle, Clock, Users } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HiringPage({ searchParams }: { searchParams: { month?: string, quarter?: string } }) {
    const { month, quarter } = searchParams;
    let candidates = await getHiring();

    // Filter by Month (if provided)
    if (month) {
        const m = parseInt(month);
        candidates = candidates.filter(c => new Date(c.expected_join_date).getMonth() + 1 === m);
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
        candidates = candidates.filter(c => qMonths.includes(new Date(c.expected_join_date).getMonth() + 1));
    }

    const activeInterns = candidates.filter((c) => c.type === "Intern" && c.interview_status === "Joined");
    const activeCandidates = candidates.filter((c) => c.type === "Candidate" && !["Joined", "Rejected"].includes(c.interview_status));
    const offers = candidates.filter((c) => c.interview_status === "Offer");
    const joined = candidates.filter((c) => c.interview_status === "Joined");

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Hiring & Intern Management</h1>
                <p className="text-sm text-slate-500 mt-0.5">Pipeline tracking and intern progress</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <KpiCard title="Active Pipeline" value={activeCandidates.length} icon={UserPlus} iconColor="text-blue-600" iconBg="bg-blue-600/10" subValue="Candidates in process" />
                <KpiCard title="Offers Sent" value={offers.length} icon={CheckCircle} iconColor="text-amber-600" iconBg="bg-amber-50" />
                <KpiCard title="Active Interns" value={activeInterns.length} icon={Users} iconColor="text-sky-600" iconBg="bg-sky-50" />
                <KpiCard title="Joined This Quarter" value={joined.length} icon={Clock} iconColor="text-emerald-600" iconBg="bg-emerald-50" />
            </div>

            <HiringClient initialData={candidates} />
        </div>
    );
}
