"use client";
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";

interface DashboardChartsProps {
    allocationData: { name: string; value: number; fill: string }[];
    headcountTrend: { month: string; headcount: number }[];
    esatByQuarter: { quarter: string; score: number }[];
    csatByProject: { project: string; score: number }[];
    topSkills: { skill: string; count: number }[];
}

const tooltipStyle = {
    backgroundColor: "#111122",
    border: "1px solid #1a1a2e",
    borderRadius: "8px",
    color: "#e2e8f0",
    fontSize: "12px",
};

const RADIAN = Math.PI / 180;
interface LabelProps {
    cx: number;
    cy: number;
    midAngle: number;
    innerRadius: number;
    outerRadius: number;
    percent: number;
    name: string;
}
const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }: LabelProps) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return (
        <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={600}>
            {`${name}\n${(percent * 100).toFixed(0)}%`}
        </text>
    );
};

export function DashboardCharts({
    allocationData,
    headcountTrend,
    esatByQuarter,
    csatByProject,
    topSkills,
}: DashboardChartsProps) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {/* Resource Allocation Pie */}
            <div className="glass-card p-5">
                <h2 className="text-sm font-semibold text-white mb-1">Resource Allocation</h2>
                <p className="text-xs text-slate-500 mb-4">By billability status</p>
                <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                        <Pie
                            data={allocationData}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={80}
                            paddingAngle={4}
                            dataKey="value"
                            labelLine={false}
                        >
                            {allocationData.map((entry, index) => (
                                <Cell key={index} fill={entry.fill} />
                            ))}
                        </Pie>
                        <Tooltip contentStyle={tooltipStyle} />
                        <Legend
                            iconType="circle"
                            iconSize={8}
                            wrapperStyle={{ fontSize: "11px", color: "#94a3b8" }}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            {/* Headcount Trend */}
            <div className="glass-card p-5">
                <h2 className="text-sm font-semibold text-white mb-1">Headcount Trend</h2>
                <p className="text-xs text-slate-500 mb-4">Last 7 months</p>
                <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={headcountTrend}>
                        <defs>
                            <linearGradient id="hcGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1a1a2e" />
                        <XAxis dataKey="month" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, "dataMax + 2"]} />
                        <Tooltip contentStyle={tooltipStyle} />
                        <Area type="monotone" dataKey="headcount" stroke="#6366f1" strokeWidth={2} fill="url(#hcGrad)" dot={{ fill: "#6366f1", r: 3 }} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Skill Coverage */}
            <div className="glass-card p-5">
                <h2 className="text-sm font-semibold text-white mb-1">Top Skills Coverage</h2>
                <p className="text-xs text-slate-500 mb-4">Engineers per skill</p>
                <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={topSkills} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#1a1a2e" horizontal={false} />
                        <XAxis type="number" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis dataKey="skill" type="category" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} width={80} />
                        <Tooltip contentStyle={tooltipStyle} />
                        <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* ESAT Trend */}
            <div className="glass-card p-5 lg:col-span-1">
                <h2 className="text-sm font-semibold text-white mb-1">ESAT Trend</h2>
                <p className="text-xs text-slate-500 mb-4">Average company score by quarter</p>
                <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={esatByQuarter}>
                        <defs>
                            <linearGradient id="esatGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.2} />
                                <stop offset="95%" stopColor="#a78bfa" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1a1a2e" />
                        <XAxis dataKey="quarter" tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} />
                        <YAxis domain={[6, 10]} tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={tooltipStyle} />
                        <Line type="monotone" dataKey="score" stroke="#a78bfa" strokeWidth={2.5} dot={{ fill: "#a78bfa", r: 4 }} activeDot={{ r: 6, fill: "#7c3aed" }} />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* CSAT by Project */}
            <div className="glass-card p-5 lg:col-span-2">
                <h2 className="text-sm font-semibold text-white mb-1">CSAT by Project</h2>
                <p className="text-xs text-slate-500 mb-4">Customer satisfaction scores</p>
                <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={csatByProject}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1a1a2e" />
                        <XAxis dataKey="project" tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} />
                        <YAxis domain={[0, 10]} tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={tooltipStyle} />
                        <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                            {csatByProject.map((entry, index) => (
                                <Cell
                                    key={index}
                                    fill={entry.score >= 8 ? "#10b981" : entry.score >= 7 ? "#f59e0b" : "#ef4444"}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
