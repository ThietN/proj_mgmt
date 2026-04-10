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
    attendanceTrend: { date: string; late: number; notAccess: number }[];
    internMetrics: { totalInterns: number; inProgress: number; completed: number; convertedToBillable: number; completionRate: number };
    candidates: any[];
}

const tooltipStyle = {
    backgroundColor: "#111122",
    border: "1px solid #1a1a2e",
    borderRadius: "8px",
    color: "#e2e8f0",
    fontSize: "12px",
};

export function DashboardCharts({
    allocationData,
    headcountTrend,
    esatByQuarter,
    csatByProject,
    topSkills,
    attendanceTrend,
    internMetrics,
    candidates,
}: DashboardChartsProps) {
    // Process Hiring Data
    const hiringStatusCount = candidates.reduce((acc: any, c) => {
        acc[c.status] = (acc[c.status] || 0) + 1;
        return acc;
    }, {});
    
    const hiringData = [
        { name: "Initial", value: hiringStatusCount["Initial Contact"] || 0, fill: "#94a3b8" },
        { name: "Interview", value: hiringStatusCount["Interviewing"] || 0, fill: "#6366f1" },
        { name: "Offer", value: hiringStatusCount["Offer Extended"] || 0, fill: "#10b981" },
        { name: "Joined", value: hiringStatusCount["Joined"] || 0, fill: "#0ea5e9" },
    ];

    const internStatusData = [
        { name: "In Training", value: internMetrics.inProgress, fill: "#f59e0b" },
        { name: "Completed", value: internMetrics.completed, fill: "#10b981" },
        { name: "Converted", value: internMetrics.convertedToBillable, fill: "#6366f1" },
    ];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {/* Resource Allocation Pie */}
            <div className="glass-card p-5">
                <h2 className="text-sm font-semibold text-slate-900 mb-1">Resource Allocation</h2>
                <p className="text-xs text-slate-500 mb-4">By billability status</p>
                <ResponsiveContainer width="100%" height={220}>
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

            {/* Work Tracker - Lateness & Access */}
            <div className="glass-card p-5">
                <h2 className="text-sm font-semibold text-slate-900 mb-1">Work Tracker Trend</h2>
                <p className="text-xs text-slate-500 mb-4">Lateness and Not Access (Last 14 days)</p>
                <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={attendanceTrend}>
                        <defs>
                            <linearGradient id="lateGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="accessGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} />
                                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                        <XAxis 
                            dataKey="date" 
                            tick={{ fill: "#64748b", fontSize: 9 }} 
                            axisLine={false} 
                            tickLine={false} 
                            tickFormatter={(val) => val.split("-").slice(1).join("/")}
                        />
                        <YAxis tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={tooltipStyle} />
                        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "11px" }} />
                        <Area type="monotone" name="Late" dataKey="late" stroke="#ef4444" strokeWidth={2} fill="url(#lateGrad)" dot={{ r: 2 }} />
                        <Area type="monotone" name="No Access" dataKey="notAccess" stroke="#f59e0b" strokeWidth={2} fill="url(#accessGrad)" dot={{ r: 2 }} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Intern Funnel */}
            <div className="glass-card p-5">
                <h2 className="text-sm font-semibold text-slate-900 mb-1">Internship Pipeline</h2>
                <p className="text-xs text-slate-500 mb-4">Statuses and conversions</p>
                <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={internStatusData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                        <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={tooltipStyle} />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                            {internStatusData.map((entry, index) => (
                                <Cell key={index} fill={entry.fill} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Hiring Pipeline */}
            <div className="glass-card p-5 lg:col-span-1">
                <h2 className="text-sm font-semibold text-slate-900 mb-1">Hiring Progress</h2>
                <p className="text-xs text-slate-500 mb-4">External candidates by stage</p>
                <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={hiringData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                        <XAxis type="number" tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} />
                        <YAxis dataKey="name" type="category" tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} width={70} />
                        <Tooltip contentStyle={tooltipStyle} />
                        <Bar dataKey="value" fill="#6366f1" radius={[0, 4, 4, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* CSAT by Project */}
            <div className="glass-card p-5 lg:col-span-1">
                <h2 className="text-sm font-semibold text-slate-900 mb-1">CSAT by Project</h2>
                <p className="text-xs text-slate-500 mb-4">Customer satisfaction scores</p>
                <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={csatByProject}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                        <XAxis dataKey="project" tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} />
                        <YAxis domain={[0, 10]} tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} />
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

            {/* ESAT Trend */}
            <div className="glass-card p-5 lg:col-span-1">
                <h2 className="text-sm font-semibold text-slate-900 mb-1">ESAT Trend</h2>
                <p className="text-xs text-slate-500 mb-4">Quarterly employee satisfaction</p>
                <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={esatByQuarter}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                        <XAxis dataKey="quarter" tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} />
                        <YAxis domain={[6, 10]} tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={tooltipStyle} />
                        <Line type="monotone" dataKey="score" stroke="#8b5cf6" strokeWidth={2} dot={{ fill: "#8b5cf6", r: 3 }} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
