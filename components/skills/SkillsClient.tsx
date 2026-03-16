"use client";
import { SkillEntry, Resource } from "@/types";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Plus, X, Check, Trash2, Edit2, Brain, Search, Filter, Users } from "lucide-react";
import { useRouter } from "next/navigation";

const SKILL_LEVEL_ORDER = ["Beginner", "Intermediate", "Advanced", "Expert"] as const;
const LEVEL_COLORS: Record<string, string> = {
    Beginner: "bg-slate-100 text-slate-500 border-slate-200",
    Intermediate: "bg-blue-50 text-blue-600 border-blue-200",
    Advanced: "bg-violet-50 text-violet-600 border-violet-200",
    Expert: "bg-amber-50 text-amber-600 border-amber-200",
};

interface SkillsClientProps {
    skills: SkillEntry[];
    resources: Resource[];
}

const DEFAULT_FORM = {
    id: "",
    employee_id: "",
    skill_name: "",
    skill_level: "Beginner" as SkillEntry["skill_level"]
};

export function SkillsClient({ skills: initialSkills, resources }: SkillsClientProps) {
    const router = useRouter();
    const [skills, setSkills] = useState<SkillEntry[]>(initialSkills);
    const [selectedTeam, setSelectedTeam] = useState("all");
    const [isManaging, setIsManaging] = useState(false);
    const [formData, setFormData] = useState(DEFAULT_FORM);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const teams = Array.from(new Set(resources.map((r) => r.team)));

    const filteredResources = resources.filter((r) => {
        const matchesTeam = selectedTeam === "all" || r.team === selectedTeam;
        const matchesSearch = r.name.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesTeam && matchesSearch;
    });

    const filteredEmployeeIds = filteredResources.map((r) => r.employee_id);
    const filteredSkills = skills.filter((s) => filteredEmployeeIds.includes(s.employee_id));
    const uniqueSkillNames = Array.from(new Set(skills.map((s) => s.skill_name))).sort();

    // Matrix
    const matrix: Record<string, Record<string, { level: string, id: string }>> = {};
    resources.forEach((r) => { matrix[r.employee_id] = {}; });
    skills.forEach((s) => {
        if (matrix[s.employee_id]) {
            matrix[s.employee_id][s.skill_name] = { level: s.skill_level, id: s.id };
        }
    });

    // Gaps
    const skillCounts: Record<string, number> = {};
    uniqueSkillNames.forEach((skill) => {
        skillCounts[skill] = skills.filter((s) => s.skill_name === skill).length;
    });
    const gapSkills = uniqueSkillNames.filter((s) => skillCounts[s] < 2);

    async function handleAddSkill(e: React.FormEvent) {
        e.preventDefault();
        if (!formData.employee_id || !formData.skill_name) return;
        setIsLoading(true);
        try {
            const res = await fetch("/api/skills", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                const data = await res.json();
                setSkills([...skills, data.entry]);
                setFormData(DEFAULT_FORM);
                router.refresh();
            }
        } catch (err) { }
        setIsLoading(false);
    }

    async function handleDeleteSkill(id: string) {
        try {
            const res = await fetch(`/api/skills?id=${id}`, { method: "DELETE" });
            if (res.ok) {
                setSkills(skills.filter(s => s.id !== id));
                router.refresh();
            }
        } catch (err) { }
    }

    return (
        <div className="space-y-4">
            {/* Header / Controls */}
            <div className="glass-card p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Search names..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-blue-500 min-w-[200px]"
                        />
                    </div>
                    <select
                        value={selectedTeam}
                        onChange={(e) => setSelectedTeam(e.target.value)}
                        className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-blue-500"
                    >
                        <option value="all">All Teams</option>
                        {teams.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                </div>
                <button
                    onClick={() => setIsManaging(!isManaging)}
                    className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all border",
                        isManaging ? "bg-slate-900 border-slate-900 text-white" : "bg-white border-slate-200 text-slate-600 hover:border-blue-300"
                    )}
                >
                    {isManaging ? <X className="w-3.5 h-3.5" /> : <Brain className="w-3.5 h-3.5 text-blue-500" />}
                    {isManaging ? "Close Skill Manager" : "Manage Skills"}
                </button>
            </div>

            {isManaging && (
                <div className="glass-card p-6 bg-blue-50/20 border-blue-200 animate-fadeInUp">
                    <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">Attribute New Skill</h3>
                    <form onSubmit={handleAddSkill} className="flex flex-wrap items-end gap-4">
                        <div className="flex-1 min-w-[200px]">
                            <label className="block text-[9px] font-black text-slate-400 uppercase mb-1">Select Engineer</label>
                            <select
                                required
                                value={formData.employee_id}
                                onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500"
                            >
                                <option value="">Select an engineer...</option>
                                {resources.map(r => <option key={r.employee_id} value={r.employee_id}>{r.name} ({r.team})</option>)}
                            </select>
                        </div>
                        <div className="flex-1 min-w-[150px]">
                            <label className="block text-[9px] font-black text-slate-400 uppercase mb-1">Skill Name</label>
                            <input
                                required
                                list="existing-skills"
                                value={formData.skill_name}
                                onChange={(e) => setFormData({ ...formData, skill_name: e.target.value })}
                                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500"
                                placeholder="React, Python, etc."
                            />
                            <datalist id="existing-skills">
                                {uniqueSkillNames.map(s => <option key={s} value={s} />)}
                            </datalist>
                        </div>
                        <div className="w-[150px]">
                            <label className="block text-[9px] font-black text-slate-400 uppercase mb-1">Level</label>
                            <select
                                value={formData.skill_level}
                                onChange={(e) => setFormData({ ...formData, skill_level: e.target.value as any })}
                                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500"
                            >
                                {SKILL_LEVEL_ORDER.map(l => <option key={l} value={l}>{l}</option>)}
                            </select>
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-black hover:bg-blue-700 h-[38px] transition-all active:scale-95 disabled:opacity-50"
                        >
                            {isLoading ? "..." : "Add Entry"}
                        </button>
                    </form>
                </div>
            )}

            {/* Matrix Visuals */}
            <div className="glass-card overflow-hidden bg-white/50 backdrop-blur-sm border-slate-200 shadow-sm relative">
                <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                    <div>
                        <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-widest leading-none">Engineering Talent</h2>
                        <h3 className="text-sm font-black text-slate-900 mt-1">Skills Distribution Matrix</h3>
                    </div>
                    <div className="flex items-center gap-4">
                        {SKILL_LEVEL_ORDER.map((level) => (
                            <div key={level} className="flex items-center gap-1.5">
                                <div className={cn("w-2 h-2 rounded-full", LEVEL_COLORS[level].split(' ')[0])} />
                                <span className="text-[10px] font-bold text-slate-500">{level}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="overflow-x-auto max-h-[600px] no-scrollbar">
                    <table className="w-full text-left border-collapse">
                        <thead className="sticky top-0 z-20 bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-tighter sticky left-0 bg-slate-50 z-30 border-r border-slate-200 min-w-[180px]">Engineer</th>
                                {uniqueSkillNames.map((skill) => (
                                    <th key={skill} className="px-4 py-3 text-[10px] font-black text-slate-700 uppercase tracking-tight text-center whitespace-nowrap border-r border-slate-100 last:border-0 min-w-[100px]">
                                        {skill}
                                        {gapSkills.includes(skill) && <span className="text-rose-500 ml-1" title="Critical Gap">●</span>}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredResources.map((r) => (
                                <tr key={r.employee_id} className="hover:bg-blue-50/30 transition-colors group">
                                    <td className="px-5 py-3 sticky left-0 bg-white group-hover:bg-blue-50/50 z-10 border-r border-slate-100">
                                        <div className="font-bold text-slate-900 text-xs">{r.name}</div>
                                        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mt-0.5">{r.team}</div>
                                    </td>
                                    {uniqueSkillNames.map((skill) => {
                                        const entry = matrix[r.employee_id]?.[skill];
                                        return (
                                            <td key={skill} className="px-2 py-3 text-center border-r border-slate-100 last:border-0 relative group/cell">
                                                {entry ? (
                                                    <div className="flex flex-col items-center justify-center">
                                                        <span className={cn(
                                                            "text-[9px] font-black px-2 py-1 rounded-md border min-w-[32px] transition-all",
                                                            LEVEL_COLORS[entry.level]
                                                        )}>
                                                            {entry.level[0]}
                                                        </span>
                                                        {isManaging && (
                                                            <button
                                                                onClick={() => handleDeleteSkill(entry.id)}
                                                                className="absolute -top-1 -right-1 opacity-0 group-hover/cell:opacity-100 bg-rose-500 text-white rounded-full p-0.5 shadow-sm transition-opacity"
                                                            >
                                                                <Trash2 className="w-2.5 h-2.5" />
                                                            </button>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-200">·</span>
                                                )}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredResources.length === 0 && (
                    <div className="p-20 text-center border-t border-slate-100 bg-slate-50/50">
                        <Users className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">No engineers found</p>
                    </div>
                )}
            </div>

            {/* Legends & Insights */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="glass-card p-4 border-amber-200/50 bg-amber-50/10">
                    <h4 className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <Filter className="w-3 h-3" /> Critical Skill Gaps
                    </h4>
                    <div className="flex flex-wrap gap-2">
                        {gapSkills.map(s => (
                            <span key={s} className="px-2 py-1 rounded-lg bg-white border border-amber-200 text-[10px] font-bold text-amber-700 shadow-sm">
                                {s} <span className="text-slate-300 ml-1">({skillCounts[s]})</span>
                            </span>
                        ))}
                        {gapSkills.length === 0 && <span className="text-xs text-slate-400 italic">No critical gaps identified</span>}
                    </div>
                </div>
                <div className="glass-card p-4 border-blue-200/50 bg-blue-50/10">
                    <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-3">Matrix Guide</h4>
                    <div className="flex justify-between items-center text-[10px] font-black text-slate-500">
                        <span><strong>B</strong>: Theoretical knowledge</span>
                        <span><strong>I</strong>: Applied experience</span>
                        <span><strong>A</strong>: Subject mastery</span>
                        <span><strong>E</strong>: Industry expert</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
