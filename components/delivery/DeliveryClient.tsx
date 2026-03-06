"use client";
import { Project } from "@/types";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useState } from "react";
import { Users, Calendar, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

interface DeliveryClientProps {
    projects: Project[];
}

export function DeliveryClient({ projects }: DeliveryClientProps) {
    const [filter, setFilter] = useState("all");

    const statuses = ["all", "On Track", "At Risk", "Critical", "Completed"];
    const filtered = filter === "all" ? projects : projects.filter((p) => p.delivery_status === filter);

    return (
        <div className="space-y-4">
            {/* Filter bar */}
            <div className="flex items-center gap-2 flex-wrap">
                {statuses.map((s) => (
                    <button
                        key={s}
                        onClick={() => setFilter(s)}
                        className={cn(
                            "px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize",
                            filter === s
                                ? "bg-indigo-600 text-white"
                                : "bg-[#111122] border border-[#1a1a2e] text-slate-400 hover:text-slate-200"
                        )}
                    >
                        {s === "all" ? "All Projects" : s}
                    </button>
                ))}
            </div>

            {/* Project cards grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filtered.map((proj) => (
                    <div
                        key={proj.project_id}
                        className={cn(
                            "glass-card p-5 hover:border-indigo-500/20 transition-all",
                            proj.delivery_status === "Critical" && "border-red-500/25",
                            proj.delivery_status === "At Risk" && "border-amber-500/25"
                        )}
                    >
                        {/* Header */}
                        <div className="flex items-start justify-between mb-3">
                            <div>
                                <h3 className="text-sm font-semibold text-white">{proj.project_name}</h3>
                                <p className="text-xs text-slate-500 mt-0.5">{proj.customer}</p>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                                <StatusBadge status={proj.delivery_status} size="sm" />
                                <StatusBadge status={proj.risk_level} size="sm" />
                            </div>
                        </div>

                        {/* Milestone Progress */}
                        <div className="mb-3">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-xs text-slate-500">Milestone Progress</span>
                                <span className="text-xs font-medium text-slate-300">{proj.milestone_progress}%</span>
                            </div>
                            <div className="w-full bg-[#1a1a2e] rounded-full h-2">
                                <div
                                    className={cn(
                                        "h-2 rounded-full transition-all",
                                        proj.milestone_progress >= 80 ? "bg-emerald-500" :
                                            proj.milestone_progress >= 50 ? "bg-indigo-500" :
                                                proj.milestone_progress >= 30 ? "bg-amber-500" : "bg-red-500"
                                    )}
                                    style={{ width: `${proj.milestone_progress}%` }}
                                />
                            </div>
                        </div>

                        {/* Meta */}
                        <div className="flex items-center gap-4 text-xs text-slate-500">
                            <div className="flex items-center gap-1">
                                <Users className="w-3.5 h-3.5" />
                                {proj.team_size} engineers
                            </div>
                            <div className="flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5" />
                                {proj.end_date}
                            </div>
                        </div>

                        {/* Tech Stack */}
                        <div className="flex flex-wrap gap-1 mt-3">
                            {proj.tech_stack.map((tech) => (
                                <span key={tech} className="text-[10px] bg-[#1a1a2e] text-slate-400 border border-[#252540] px-1.5 py-0.5 rounded">
                                    {tech}
                                </span>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
            {filtered.length === 0 && (
                <div className="glass-card p-12 text-center text-slate-500 text-sm">
                    No projects match this filter
                </div>
            )}
        </div>
    );
}
