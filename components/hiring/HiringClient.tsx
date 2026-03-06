"use client";
import { Candidate } from "@/types";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useState } from "react";
import { cn } from "@/lib/utils";

const stages = ["Applied", "Screening", "Interview", "Offer", "Joined"] as const;
const stageColors: Record<string, string> = {
    Applied: "border-slate-500/20",
    Screening: "border-blue-500/20",
    Interview: "border-violet-500/20",
    Offer: "border-amber-500/20",
    Joined: "border-emerald-500/20",
};

interface HiringClientProps {
    initialData: Candidate[];
}

export function HiringClient({ initialData }: HiringClientProps) {
    const [tab, setTab] = useState<"pipeline" | "interns">("pipeline");

    const candidates = initialData.filter((c) => c.type === "Candidate");
    const interns = initialData.filter((c) => c.type === "Intern");

    return (
        <div className="space-y-4">
            {/* Tab switcher */}
            <div className="flex items-center gap-1 bg-[#111122] border border-[#1a1a2e] rounded-lg p-1 w-fit">
                {(["pipeline", "interns"] as const).map((t) => (
                    <button
                        key={t}
                        onClick={() => setTab(t)}
                        className={cn(
                            "px-4 py-1.5 rounded-md text-sm font-medium transition-all capitalize",
                            tab === t
                                ? "bg-indigo-600 text-white shadow"
                                : "text-slate-400 hover:text-slate-200"
                        )}
                    >
                        {t === "pipeline" ? "Hiring Pipeline" : "Intern Tracker"}
                    </button>
                ))}
            </div>

            {tab === "pipeline" && (
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    {stages.map((stage) => {
                        const stageCandidates = candidates.filter((c) => c.interview_status === stage);
                        return (
                            <div key={stage} className={cn("glass-card border p-4", stageColors[stage])}>
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{stage}</h3>
                                    <span className="w-5 h-5 rounded-full bg-[#1a1a2e] text-[10px] text-slate-400 flex items-center justify-center font-medium">
                                        {stageCandidates.length}
                                    </span>
                                </div>
                                <div className="space-y-2">
                                    {stageCandidates.map((c) => (
                                        <div key={c.candidate_id} className="bg-[#111122] border border-[#1a1a2e] rounded-lg p-3 hover:border-indigo-500/20 transition-colors">
                                            <div className="font-medium text-slate-200 text-sm">{c.candidate_name}</div>
                                            <div className="text-[11px] text-slate-500 mt-0.5">{c.role_applied}</div>
                                            <div className="text-[10px] text-slate-600 mt-1">via {c.source}</div>
                                            {c.expected_join_date && (
                                                <div className="text-[10px] text-indigo-400 mt-1">Join: {c.expected_join_date}</div>
                                            )}
                                        </div>
                                    ))}
                                    {stageCandidates.length === 0 && (
                                        <div className="text-[11px] text-slate-600 text-center py-4">No candidates</div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {tab === "interns" && (
                <div className="glass-card overflow-hidden">
                    <div className="p-4 border-b border-[#1a1a2e]">
                        <h2 className="text-sm font-semibold text-white">Active Interns</h2>
                        <p className="text-xs text-slate-500 mt-0.5">Track internship progress and mentorship</p>
                    </div>
                    <div className="divide-y divide-[#1a1a2e]">
                        {interns.map((intern) => (
                            <div key={intern.candidate_id} className="p-4 hover:bg-white/2 transition-colors">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500/30 to-pink-600/30 flex items-center justify-center text-xs font-bold text-violet-300">
                                            {intern.candidate_name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                                        </div>
                                        <div>
                                            <div className="font-medium text-slate-200 text-sm">{intern.candidate_name}</div>
                                            <div className="text-xs text-slate-500">{intern.role_applied} · Mentor: {intern.mentor}</div>
                                        </div>
                                    </div>
                                    <StatusBadge status={intern.interview_status} size="sm" />
                                </div>
                                <div className="mt-3 flex items-center gap-3">
                                    <div className="flex-1 bg-[#1a1a2e] rounded-full h-2">
                                        <div
                                            className="h-2 rounded-full bg-gradient-to-r from-violet-500 to-indigo-500"
                                            style={{ width: `${intern.internship_progress}%` }}
                                        />
                                    </div>
                                    <span className="text-xs text-slate-400 w-10 text-right">{intern.internship_progress}%</span>
                                </div>
                                <div className="mt-1 text-[11px] text-slate-600">
                                    Source: {intern.source} · Join: {intern.expected_join_date}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
