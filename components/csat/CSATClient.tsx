"use client";
import { CSATRecord } from "@/types";
import {
    BarChart,
    Bar,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { AlertTriangle, CheckCircle } from "lucide-react";

interface CSATClientProps {
    records: CSATRecord[];
}

const tooltipStyle = {
    backgroundColor: "#111122",
    border: "1px solid #1a1a2e",
    borderRadius: "8px",
    color: "#e2e8f0",
    fontSize: "12px",
};

export function CSATClient({ records }: CSATClientProps) {
    const atRisk = records.filter((r) => r.survey_score < 7);
    const excellent = records.filter((r) => r.survey_score >= 9);

    const chartData = records.map((r) => ({
        name: r.project.split(" ").slice(0, 2).join(" "),
        score: r.survey_score,
        customer: r.customer,
    }));

    return (
        <div className="space-y-4">
            {/* Risk Alerts */}
            {atRisk.length > 0 && (
                <div className="glass-card border-red-500/20 p-5">
                    <div className="flex items-center gap-2 mb-3">
                        <AlertTriangle className="w-4 h-4 text-red-400" />
                        <h2 className="text-sm font-semibold text-red-400">Customer Risk Alerts</h2>
                    </div>
                    <div className="space-y-3">
                        {atRisk.map((r) => (
                            <div key={r.record_id} className="p-3 bg-red-500/5 border border-red-500/15 rounded-lg">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <div className="text-sm font-medium text-white">{r.project}</div>
                                        <div className="text-xs text-slate-500">{r.customer} · {r.survey_date}</div>
                                        {r.feedback && <p className="text-xs text-slate-400 mt-1 italic">"{r.feedback}"</p>}
                                    </div>
                                    <span className="text-lg font-bold text-red-400 ml-4">{r.survey_score}</span>
                                </div>
                                {r.action_plan && (
                                    <div className="mt-2 p-2 bg-[#111122] rounded text-xs text-amber-400">
                                        📋 Action: {r.action_plan}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Chart */}
            <div className="glass-card p-5">
                <h2 className="text-sm font-semibold text-white mb-1">CSAT Scores by Project</h2>
                <p className="text-xs text-slate-500 mb-4">Green ≥ 8, Yellow 7–8, Red &lt; 7</p>
                <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1a1a2e" />
                        <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} />
                        <YAxis domain={[0, 10]} tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                        <Tooltip
                            contentStyle={tooltipStyle}
                            formatter={(value, _, props) => [`${value}/10 — ${props.payload.customer}`, "CSAT Score"]}
                        />
                        <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                            {chartData.map((entry, i) => (
                                <Cell key={i} fill={entry.score >= 9 ? "#10b981" : entry.score >= 7 ? "#f59e0b" : "#ef4444"} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* All records table */}
            <div className="glass-card overflow-hidden">
                <div className="p-4 border-b border-[#1a1a2e]">
                    <h2 className="text-sm font-semibold text-white">All Survey Records</h2>
                </div>
                <div className="divide-y divide-[#1a1a2e]">
                    {records.map((r) => (
                        <div key={r.record_id} className="p-4 hover:bg-white/2 transition-colors">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        {r.survey_score >= 9 ? (
                                            <CheckCircle className="w-4 h-4 text-emerald-400" />
                                        ) : r.survey_score < 7 ? (
                                            <AlertTriangle className="w-4 h-4 text-red-400" />
                                        ) : null}
                                        <span className="text-sm font-medium text-slate-200">{r.project}</span>
                                        <span className="text-xs text-slate-500">· {r.customer}</span>
                                    </div>
                                    {r.feedback && <p className="text-xs text-slate-500 mt-1 italic ml-6">"{r.feedback}"</p>}
                                    {r.action_plan && (
                                        <p className="text-xs text-amber-400 mt-1 ml-6">Action: {r.action_plan}</p>
                                    )}
                                </div>
                                <div className="flex flex-col items-end ml-4 flex-shrink-0">
                                    <span className={`text-xl font-bold ${r.survey_score >= 8 ? "text-emerald-400" : r.survey_score >= 7 ? "text-amber-400" : "text-red-400"}`}>
                                        {r.survey_score}
                                    </span>
                                    <span className="text-[10px] text-slate-600">{r.survey_date}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
