"use client";
import { Innovation } from "@/types";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Bot, Zap, Code2, FlaskConical } from "lucide-react";

interface InnovationsClientProps {
    innovations: Innovation[];
}

const TYPE_ICONS: Record<string, React.ElementType> = {
    AI: Bot,
    Automation: Zap,
    Framework: Code2,
    Research: FlaskConical,
};

const TYPE_COLORS: Record<string, string> = {
    AI: "bg-violet-500/10 text-violet-400 border-violet-500/20",
    Automation: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    Framework: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    Research: "bg-amber-500/10 text-amber-400 border-amber-500/20",
};

export function InnovationsClient({ innovations }: InnovationsClientProps) {
    const [typeFilter, setTypeFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");

    const types = Array.from(new Set(innovations.map((i) => i.type)));
    const statuses = Array.from(new Set(innovations.map((i) => i.status)));

    const filtered = innovations.filter((i) => {
        const matchesType = typeFilter === "all" || i.type === typeFilter;
        const matchesStatus = statusFilter === "all" || i.status === statusFilter;
        return matchesType && matchesStatus;
    });

    return (
        <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1.5">
                    <span className="text-xs text-slate-500">Type:</span>
                    {["all", ...types].map((t) => (
                        <button
                            key={t}
                            onClick={() => setTypeFilter(t)}
                            className={cn(
                                "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                                typeFilter === t
                                    ? "bg-indigo-600 text-white"
                                    : "bg-[#111122] border border-[#1a1a2e] text-slate-400 hover:text-slate-200"
                            )}
                        >
                            {t === "all" ? "All Types" : t}
                        </button>
                    ))}
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="text-xs text-slate-500">Status:</span>
                    {["all", ...statuses].map((s) => (
                        <button
                            key={s}
                            onClick={() => setStatusFilter(s)}
                            className={cn(
                                "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                                statusFilter === s
                                    ? "bg-indigo-600 text-white"
                                    : "bg-[#111122] border border-[#1a1a2e] text-slate-400 hover:text-slate-200"
                            )}
                        >
                            {s === "all" ? "All Status" : s}
                        </button>
                    ))}
                </div>
            </div>

            {/* Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filtered.map((init) => {
                    const Icon = TYPE_ICONS[init.type] ?? Zap;
                    return (
                        <div key={init.initiative_id} className="glass-card p-5 hover:border-indigo-500/20 transition-all">
                            <div className="flex items-start gap-3">
                                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center border", TYPE_COLORS[init.type])}>
                                    <Icon className="w-5 h-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                        <h3 className="text-sm font-semibold text-white leading-tight">{init.initiative_name}</h3>
                                        <StatusBadge status={init.status} size="sm" />
                                    </div>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className={cn("text-[10px] px-2 py-0.5 rounded-full border font-medium", TYPE_COLORS[init.type])}>
                                            {init.type}
                                        </span>
                                        <span className="text-[11px] text-slate-500">by {init.owner}</span>
                                    </div>
                                </div>
                            </div>

                            <p className="text-xs text-slate-400 mt-3 leading-relaxed">{init.description}</p>

                            <div className="flex items-center justify-between mt-4">
                                <div className="flex items-center gap-1.5">
                                    <span className="text-xs text-slate-500">Impact Score:</span>
                                    <div className="flex items-center gap-0.5">
                                        {Array.from({ length: 10 }).map((_, i) => (
                                            <div
                                                key={i}
                                                className={cn(
                                                    "w-2 h-2 rounded-sm",
                                                    i < init.impact_score ? "bg-indigo-500" : "bg-[#1a1a2e]"
                                                )}
                                            />
                                        ))}
                                    </div>
                                    <span className="text-xs font-bold text-indigo-400">{init.impact_score}/10</span>
                                </div>
                                <span className="text-[11px] text-slate-600">{init.start_date}</span>
                            </div>
                        </div>
                    );
                })}
            </div>
            {filtered.length === 0 && (
                <div className="glass-card p-12 text-center text-slate-500 text-sm">No initiatives match</div>
            )}
        </div>
    );
}
