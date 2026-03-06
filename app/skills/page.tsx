import { getSkills, getResources } from "@/lib/data";
import { SkillsClient } from "@/components/skills/SkillsClient";
import { KpiCard } from "@/components/ui/KpiCard";
import { Brain, Star, Users, Zap } from "lucide-react";

export const dynamic = "force-dynamic";

export default function SkillsPage() {
    const skills = getSkills();
    const resources = getResources();

    const uniqueSkills = Array.from(new Set(skills.map((s) => s.skill_name)));
    const experts = skills.filter((s) => s.skill_level === "Expert").length;
    const teams = Array.from(new Set(resources.map((r) => r.team)));

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white">Skills & Capability Matrix</h1>
                <p className="text-sm text-slate-500 mt-0.5">Team skill coverage, levels, and gap analysis</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <KpiCard title="Unique Skills" value={uniqueSkills.length} icon={Brain} iconColor="text-indigo-400" iconBg="bg-indigo-500/10" />
                <KpiCard title="Expert Engineers" value={experts} icon={Star} iconColor="text-amber-400" iconBg="bg-amber-500/10" subValue="Expert-level entries" />
                <KpiCard title="Teams Tracked" value={teams.length} icon={Users} iconColor="text-violet-400" iconBg="bg-violet-500/10" />
                <KpiCard title="Skill Entries" value={skills.length} icon={Zap} iconColor="text-cyan-400" iconBg="bg-cyan-500/10" />
            </div>

            <SkillsClient skills={skills} resources={resources} />
        </div>
    );
}
