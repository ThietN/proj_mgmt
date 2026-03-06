"use client";
import { useState } from "react";
import { Resource } from "@/types";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Search, Filter, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ResourcesClientProps {
    initialData: Resource[];
}

export function ResourcesClient({ initialData }: ResourcesClientProps) {
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [teamFilter, setTeamFilter] = useState<string>("all");

    const teams = Array.from(new Set(initialData.map((r) => r.team)));

    const filtered = initialData.filter((r) => {
        const matchesSearch =
            r.name.toLowerCase().includes(search.toLowerCase()) ||
            r.role.toLowerCase().includes(search.toLowerCase()) ||
            r.skills.some((s) => s.toLowerCase().includes(search.toLowerCase()));
        const matchesStatus = statusFilter === "all" || r.status === statusFilter;
        const matchesTeam = teamFilter === "all" || r.team === teamFilter;
        return matchesSearch && matchesStatus && matchesTeam;
    });

    return (
        <div className="glass-card overflow-hidden">
            {/* Filters */}
            <div className="p-4 border-b border-[#1a1a2e] flex flex-wrap gap-3 items-center">
                <div className="flex items-center gap-2 flex-1 min-w-[200px] bg-[#111122] border border-[#1a1a2e] rounded-lg px-3 py-2">
                    <Search className="w-3.5 h-3.5 text-slate-500" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by name, role, or skill..."
                        className="bg-transparent text-sm text-slate-300 placeholder-slate-600 outline-none w-full"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Filter className="w-3.5 h-3.5 text-slate-500" />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="bg-[#111122] border border-[#1a1a2e] text-slate-300 text-sm rounded-lg px-3 py-2 outline-none"
                    >
                        <option value="all">All Status</option>
                        <option value="Billable">Billable</option>
                        <option value="Backup">Backup</option>
                        <option value="Available">Available</option>
                    </select>
                    <select
                        value={teamFilter}
                        onChange={(e) => setTeamFilter(e.target.value)}
                        className="bg-[#111122] border border-[#1a1a2e] text-slate-300 text-sm rounded-lg px-3 py-2 outline-none"
                    >
                        <option value="all">All Teams</option>
                        {teams.map((team) => (
                            <option key={team} value={team}>{team}</option>
                        ))}
                    </select>
                </div>
                <div className="text-xs text-slate-500 ml-auto">
                    {filtered.length} of {initialData.length} engineers
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-[#1a1a2e]">
                            {["Engineer", "Role / Team", "Grade", "Skills", "English", "Status", "Allocation", "Risk"].map((h) => (
                                <th key={h} className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3 whitespace-nowrap">
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1a1a2e]">
                        {filtered.map((r) => (
                            <tr key={r.employee_id} className="hover:bg-white/2 transition-colors group">
                                <td className="px-4 py-3 whitespace-nowrap">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500/30 to-violet-600/30 flex items-center justify-center text-xs font-bold text-indigo-300">
                                            {r.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                                        </div>
                                        <div>
                                            <div className="font-medium text-slate-200 text-sm">{r.name}</div>
                                            <div className="text-[11px] text-slate-500">{r.employee_id}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="text-slate-300 text-sm">{r.role}</div>
                                    <div className="text-[11px] text-slate-500">{r.team}</div>
                                </td>
                                <td className="px-4 py-3">
                                    <span className="text-xs bg-[#1a1a2e] text-slate-300 px-2 py-1 rounded font-mono border border-[#252540]">
                                        {r.grade}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                                        {r.skills.slice(0, 3).map((skill) => (
                                            <span key={skill} className="text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-1.5 py-0.5 rounded">
                                                {skill}
                                            </span>
                                        ))}
                                        {r.skills.length > 3 && (
                                            <span className="text-[10px] text-slate-500">+{r.skills.length - 3}</span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <span className="text-xs font-mono text-slate-400">{r.english_level}</span>
                                </td>
                                <td className="px-4 py-3">
                                    <StatusBadge status={r.status} size="sm" />
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-2">
                                        <div className="w-20 bg-[#1a1a2e] rounded-full h-1.5">
                                            <div
                                                className={cn("h-1.5 rounded-full", r.allocation_percentage >= 80 ? "bg-emerald-500" : r.allocation_percentage >= 50 ? "bg-amber-500" : "bg-slate-500")}
                                                style={{ width: `${r.allocation_percentage}%` }}
                                            />
                                        </div>
                                        <span className="text-xs text-slate-400">{r.allocation_percentage}%</span>
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    {r.risk_flag ? (
                                        <div className="flex items-center gap-1">
                                            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                                            <StatusBadge status={r.risk_flag} size="sm" />
                                        </div>
                                    ) : (
                                        <span className="text-xs text-slate-600">—</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filtered.length === 0 && (
                    <div className="text-center py-12 text-slate-500 text-sm">
                        No engineers match your filters
                    </div>
                )}
            </div>
        </div>
    );
}
