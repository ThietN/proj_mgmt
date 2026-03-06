"use client";
import { ESATRecord } from "@/types";
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Cell,
} from "recharts";

interface ESATClientProps {
    records: ESATRecord[];
    quarters: string[];
}

const TEAM_COLORS = ["#6366f1", "#a78bfa", "#06b6d4", "#f59e0b", "#10b981", "#f43f5e"];

const tooltipStyle = {
    backgroundColor: "#111122",
    border: "1px solid #1a1a2e",
    borderRadius: "8px",
    color: "#e2e8f0",
    fontSize: "12px",
};

export function ESATClient({ records, quarters }: ESATClientProps) {
    const teams = Array.from(new Set(records.map((e) => e.team)));

    // ESAT trend per quarter per team
    const trendData = quarters.map((q) => {
        const entry: Record<string, string | number> = { quarter: q };
        teams.forEach((team) => {
            const teamRecs = records.filter((r) => r.quarter === q && r.team === team);
            entry[team] = teamRecs.length ? parseFloat((teamRecs.reduce((a, b) => a + b.score, 0) / teamRecs.length).toFixed(1)) : 0;
        });
        return entry;
    });

    // Latest quarter comparison
    const latestQ = quarters[quarters.length - 1];
    const latestRecords = records.filter((r) => r.quarter === latestQ);
    const teamScores = teams.map((team) => {
        const recs = latestRecords.filter((r) => r.team === team);
        return {
            team,
            score: recs.length ? parseFloat((recs.reduce((a, b) => a + b.score, 0) / recs.length).toFixed(1)) : 0,
            comment: recs[0]?.comment ?? "",
        };
    }).sort((a, b) => b.score - a.score);

    return (
        <div className="space-y-4">
            {/* Trend chart */}
            <div className="glass-card p-5">
                <h2 className="text-sm font-semibold text-white mb-1">ESAT Trend by Team</h2>
                <p className="text-xs text-slate-500 mb-4">Score per quarter per team (1–10 scale)</p>
                <ResponsiveContainer width="100%" height={280}>
                    <LineChart data={trendData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1a1a2e" />
                        <XAxis dataKey="quarter" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis domain={[6, 10]} tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={tooltipStyle} />
                        <Legend wrapperStyle={{ fontSize: "11px", color: "#94a3b8" }} />
                        {teams.map((team, i) => (
                            <Line key={team} type="monotone" dataKey={team} stroke={TEAM_COLORS[i % TEAM_COLORS.length]} strokeWidth={2} dot={{ r: 3 }} />
                        ))}
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Team comparison */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="glass-card p-5">
                    <h2 className="text-sm font-semibold text-white mb-1">Team Comparison — {latestQ}</h2>
                    <p className="text-xs text-slate-500 mb-4">Ranked by average score</p>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={teamScores} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="#1a1a2e" horizontal={false} />
                            <XAxis type="number" domain={[0, 10]} tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                            <YAxis dataKey="team" type="category" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} width={100} />
                            <Tooltip contentStyle={tooltipStyle} />
                            <Bar dataKey="score" radius={[0, 4, 4, 0]} fill="#6366f1">
                                {teamScores.map((entry, index) => (
                                    <Cell key={index} fill={entry.score >= 8.5 ? "#10b981" : entry.score >= 7.5 ? "#6366f1" : "#f59e0b"} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="glass-card p-5">
                    <h2 className="text-sm font-semibold text-white mb-1">Team Feedback — {latestQ}</h2>
                    <p className="text-xs text-slate-500 mb-4">Latest survey highlights</p>
                    <div className="space-y-3">
                        {teamScores.map((team) => (
                            <div key={team.team} className="p-3 bg-[#111122] border border-[#1a1a2e] rounded-lg">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs font-medium text-slate-300">{team.team}</span>
                                    <span className={`text-xs font-bold ${team.score >= 8.5 ? "text-emerald-400" : team.score >= 7.5 ? "text-indigo-400" : "text-amber-400"}`}>
                                        {team.score}/10
                                    </span>
                                </div>
                                {team.comment && (
                                    <p className="text-[11px] text-slate-500 italic">"{team.comment}"</p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
