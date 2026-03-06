"use client";
import { SkillEntry, Resource } from "@/types";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useState } from "react";

const SKILL_LEVEL_ORDER = ["Beginner", "Intermediate", "Advanced", "Expert"] as const;
const LEVEL_COLORS: Record<string, string> = {
    Beginner: "bg-slate-700 text-slate-400",
    Intermediate: "bg-blue-900/50 text-blue-300",
    Advanced: "bg-violet-900/50 text-violet-300",
    Expert: "bg-amber-900/50 text-amber-300",
};

interface SkillsClientProps {
    skills: SkillEntry[];
    resources: Resource[];
}

export function SkillsClient({ skills, resources }: SkillsClientProps) {
    const [selectedTeam, setSelectedTeam] = useState("all");
    const teams = Array.from(new Set(resources.map((r) => r.team)));

    const filteredResources = selectedTeam === "all"
        ? resources
        : resources.filter((r) => r.team === selectedTeam);

    const filteredEmployeeIds = filteredResources.map((r) => r.employee_id);
    const filteredSkills = skills.filter((s) => filteredEmployeeIds.includes(s.employee_id));
    const uniqueSkillNames = Array.from(new Set(filteredSkills.map((s) => s.skill_name))).sort();

    // Build matrix: employee -> { skillName -> level }
    const matrix: Record<string, Record<string, string>> = {};
    filteredResources.forEach((r) => { matrix[r.employee_id] = {}; });
    filteredSkills.forEach((s) => {
        if (matrix[s.employee_id]) {
            matrix[s.employee_id][s.skill_name] = s.skill_level;
        }
    });

    // Gap detection: skills with < 2 team members
    const skillCounts: Record<string, number> = {};
    uniqueSkillNames.forEach((skill) => {
        skillCounts[skill] = filteredSkills.filter((s) => s.skill_name === skill).length;
    });
    const gapSkills = uniqueSkillNames.filter((s) => skillCounts[s] < 2);

    return (
        <div className="space-y-4">
            {/* Team filter */}
            <div className="flex items-center gap-3">
                <span className="text-sm text-slate-400">Filter by team:</span>
                <div className="flex items-center gap-2 flex-wrap">
                    {["all", ...teams].map((team) => (
                        <button
                            key={team}
                            onClick={() => setSelectedTeam(team)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${selectedTeam === team
                                ? "bg-indigo-600 text-white"
                                : "bg-[#111122] border border-[#1a1a2e] text-slate-400 hover:text-slate-200"
                                }`}
                        >
                            {team === "all" ? "All Teams" : team}
                        </button>
                    ))}
                </div>
            </div>

            {/* Skill Gap Alert */}
            {gapSkills.length > 0 && (
                <div className="glass-card border-amber-500/20 p-4">
                    <p className="text-xs font-semibold text-amber-400 mb-2">⚠ Skill Gaps Detected (&lt; 2 engineers)</p>
                    <div className="flex flex-wrap gap-2">
                        {gapSkills.map((skill) => (
                            <span key={skill} className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-1 rounded">
                                {skill} ({skillCounts[skill]})
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Matrix */}
            <div className="glass-card overflow-hidden">
                <div className="p-4 border-b border-[#1a1a2e] flex items-center gap-3">
                    <span className="text-sm font-semibold text-white">Skill Matrix</span>
                    <div className="flex items-center gap-3 ml-auto">
                        {SKILL_LEVEL_ORDER.map((level) => (
                            <span key={level} className={`text-[10px] px-2 py-0.5 rounded font-medium ${LEVEL_COLORS[level]}`}>
                                {level}
                            </span>
                        ))}
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                        <thead>
                            <tr className="border-b border-[#1a1a2e]">
                                <th className="text-left text-slate-500 font-medium px-4 py-3 sticky left-0 bg-[#0d0d1a] min-w-[160px]">Engineer</th>
                                {uniqueSkillNames.map((skill) => (
                                    <th key={skill} className="text-center text-slate-500 font-medium px-3 py-3 whitespace-nowrap min-w-[90px]">
                                        {skill}
                                        {gapSkills.includes(skill) && <span className="text-amber-400 ml-1">⚠</span>}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#1a1a2e]">
                            {filteredResources.map((r) => (
                                <tr key={r.employee_id} className="hover:bg-white/2 transition-colors">
                                    <td className="px-4 py-3 sticky left-0 bg-[#0d0d1a]">
                                        <div className="font-medium text-slate-300">{r.name}</div>
                                        <div className="text-[10px] text-slate-600">{r.team}</div>
                                    </td>
                                    {uniqueSkillNames.map((skill) => {
                                        const level = matrix[r.employee_id]?.[skill];
                                        return (
                                            <td key={skill} className="px-3 py-3 text-center">
                                                {level ? (
                                                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${LEVEL_COLORS[level]}`}>
                                                        {level[0]}
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-700">—</span>
                                                )}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="p-3 border-t border-[#1a1a2e] text-[10px] text-slate-600">
                    B = Beginner · I = Intermediate · A = Advanced · E = Expert
                </div>
            </div>
        </div>
    );
}
