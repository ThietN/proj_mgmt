"use client";
import {
    ResponsiveContainer,
    PieChart, Pie, Cell,
    BarChart, Bar,
    XAxis, YAxis,
    CartesianGrid, Tooltip, Legend
} from "recharts";
import { Users, ShieldAlert, Award, Search, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface SpanOfControlProps {
    resources: any[];
    skills: any[];
}

const COLORS = ["#6366f1", "#06b6d4", "#f59e0b", "#ec4899", "#8b5cf6", "#10b981", "#ef4444"];

const tooltipStyle = {
    backgroundColor: "#111122",
    border: "1px solid #1a1a2e",
    borderRadius: "8px",
    color: "#e2e8f0",
    fontSize: "11px",
};

export function SpanOfControl({ resources, skills }: SpanOfControlProps) {
    // 1. Team Size & Basic Stats
    const activeResources = resources.filter(r => r.status && r.status !== 'Resigned');
    const teamSize = activeResources.length;

    // 2. Average Grade Calculation (Staff Grade Index)
    const gradeValues = activeResources.map(r => {
        const match = r.grade ? r.grade.match(/\d+/) : null;
        return match ? parseInt(match[0]) : 0;
    }).filter(v => v > 0);
    const avgGrade = gradeValues.length > 0 ? (gradeValues.reduce((a, b) => a + b, 0) / gradeValues.length).toFixed(1) : "0.0";
    const staffGradeIndex = parseFloat(avgGrade);

    // 3. Role Distribution
    const rolesCount: Record<string, number> = {};
    activeResources.forEach(r => {
        const role = r.role || "Unknown";
        rolesCount[role] = (rolesCount[role] || 0) + 1;
    });
    const roleData = Object.entries(rolesCount).map(([name, value]) => ({ name, value }));

    // 4. Grade Distribution (Histogram)
    const gradeCounts: Record<string, number> = {};
    activeResources.forEach(r => {
        const g = r.grade || "N/A";
        gradeCounts[g] = (gradeCounts[g] || 0) + 1;
    });
    const gradeDistributionData = Object.entries(gradeCounts)
        .sort((a, b) => {
            const valA = parseInt(a[0].match(/\d+/)?.[0] || '0');
            const valB = parseInt(b[0].match(/\d+/)?.[0] || '0');
            return valA - valB;
        })
        .map(([grade, count]) => ({ grade, count }));

    // 5. Skill Coverage
    const skillMatrix: Record<string, number> = {};
    activeResources.forEach(r => {
        if (Array.isArray(r.skills)) {
            r.skills.forEach((s: string) => {
                skillMatrix[s] = (skillMatrix[s] || 0) + 1;
            });
        }
    });
    const skillCoverageData = Object.entries(skillMatrix)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([name, count]) => ({ name, count }));

    // 6. Risk Indicators
    const risks = [];
    const juniorCount = gradeValues.filter(v => v <= 3).length;
    const seniorCount = gradeValues.filter(v => v >= 6).length;

    // Core Skills Risk
    const criticalSkills = ["React", "Next.js", "TypeScript", "Node.js", "Python", "Java"];
    const foundSkillGaps = criticalSkills.filter(s => (skillMatrix[s] || 0) < 2);

    if (teamSize > 0 && juniorCount / teamSize > 0.5) {
        risks.push({ level: "High", message: "Junior heavy team (>50% L1-L3). Increased supervision needed.", type: "danger" });
    }
    if (seniorCount === 0) {
        risks.push({ level: "Critical", message: "No Senior Leadership (L6+) identified in the pool.", type: "danger" });
    }
    if (activeResources.filter(r => r.role === 'PM' || r.role === 'TL').length === 0) {
        risks.push({ level: "Medium", message: "Missing Leadership Roles (PM/TL) for decision making.", type: "warning" });
    }
    if (foundSkillGaps.length > 0) {
        risks.push({ level: "Medium", message: `Core Skill Gaps (min 2 needed): ${foundSkillGaps.join(', ')}.`, type: "warning" });
    }

    const singlePointSkills = Object.entries(skillMatrix).filter(([_, count]) => count === 1).map(([name]) => name);
    if (singlePointSkills.length > 5) {
        risks.push({ level: "Low", message: `${singlePointSkills.length} skills held by only one person (Silo risk).`, type: "info" });
    }

    // Gauge calculation for Gauge UI
    const gaugeData = [
        { name: "Score", value: staffGradeIndex, fill: "#6366f1" },
        { name: "Max", value: Math.max(0, 15 - staffGradeIndex), fill: "#f1f5f9" }
    ];

    return (
        <div className="space-y-6 mt-8 border-t border-slate-100 pt-8">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
                    <Search className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-slate-900 tracking-tight">Span of Control</h2>
                    <p className="text-xs text-slate-500 font-medium tracking-wide uppercase">Resource distribution & Seniority Analysis</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-6">
                {/* 1. Summary Cards */}
                <div className="space-y-4">
                    <div className="glass-card p-5 border-blue-100 flex flex-col justify-between min-h-[140px]">
                        <div className="flex items-center justify-between">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Team Capacity</p>
                            <Users className="w-3.5 h-3.5 text-blue-500" />
                        </div>
                        <div>
                            <div className="text-3xl font-black text-slate-900 leading-none">{teamSize}</div>
                            <p className="text-[10px] text-slate-500 font-bold mt-2 uppercase tracking-tighter">Active Allocated Resources</p>
                        </div>
                    </div>

                    <div className="glass-card p-5 border-indigo-100 min-h-[220px]">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-4">Staff Grade Index</p>
                        <div className="relative flex flex-col items-center justify-center h-[140px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={gaugeData}
                                        cx="50%"
                                        cy="80%"
                                        startAngle={180}
                                        endAngle={0}
                                        innerRadius={55}
                                        outerRadius={75}
                                        paddingAngle={0}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {gaugeData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute top-[60%] text-center">
                                <span className="text-2xl font-black text-slate-900">L{avgGrade}</span>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Avg Grade</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Distributions */}
                <div className="glass-card p-5 xl:col-span-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Role Distribution</p>
                    <ResponsiveContainer width="100%" height={180}>
                        <PieChart>
                            <Pie
                                data={roleData}
                                cx="50%"
                                cy="50%"
                                innerRadius={45}
                                outerRadius={65}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {roleData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        const data = payload[0].payload;
                                        const total = roleData.reduce((acc, curr) => acc + curr.value, 0);
                                        const percentage = ((data.value / total) * 100).toFixed(1);
                                        return (
                                            <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700 p-2.5 rounded-xl shadow-2xl">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{data.name}</p>
                                                <div className="flex items-baseline gap-2">
                                                    <span className="text-sm font-black text-white">{data.value}</span>
                                                    <span className="text-[10px] font-bold text-blue-400">({percentage}%)</span>
                                                </div>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="grid grid-cols-2 gap-2 mt-4">
                        {roleData.map((r, i) => (
                            <div key={r.name} className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                                <span className="text-[10px] font-bold text-slate-600">{r.name}: {r.value}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="glass-card p-5 xl:col-span-2 flex flex-col">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Seniority Histogram (Grades)</p>
                    <div className="flex-1 min-h-[220px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={gradeDistributionData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" opacity={0.5} />
                                <XAxis
                                    dataKey="grade"
                                    tick={{ fontSize: 9, fill: "#64748b", fontWeight: 700 }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis hide />
                                <Tooltip contentStyle={tooltipStyle} />
                                <Bar dataKey="count" fill="url(#gradeGrad)" radius={[4, 4, 0, 0]}>
                                    {gradeDistributionData.map((entry, index) => (
                                        <Cell key={index} fill={index > 5 ? "#4f46e5" : "#6366f1"} opacity={0.6 + (index * 0.05)} />
                                    ))}
                                </Bar>
                                <defs>
                                    <linearGradient id="gradeGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#6366f1" stopOpacity={1} />
                                        <stop offset="100%" stopColor="#818cf8" stopOpacity={0.8} />
                                    </linearGradient>
                                </defs>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 3. Skills Bar Chart */}
                <div className="glass-card p-5 md:col-span-2">
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Skill Coverage (Top 8)</p>
                        <Award className="w-3.5 h-3.5 text-blue-500" />
                    </div>
                    <ResponsiveContainer width="100%" height={240}>
                        <BarChart data={skillCoverageData} layout="vertical" margin={{ left: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" opacity={0.5} />
                            <XAxis type="number" hide />
                            <YAxis
                                dataKey="name"
                                type="category"
                                tick={{ fontSize: 10, fill: "#64748b", fontWeight: 800 }}
                                axisLine={false}
                                tickLine={false}
                                width={80}
                            />
                            <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={tooltipStyle} />
                            <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={20} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* 4. Risk Indicators */}
                <div className="glass-card p-5 md:col-span-1 xl:col-span-2 bg-slate-50/50">
                    <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
                        <ShieldAlert className="w-4 h-4 text-pink-500" />
                        <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Risk Indicators</h3>
                    </div>
                    <div className="space-y-3">
                        {risks.length > 0 ? (
                            risks.map((risk, i) => (
                                <div key={i} className={cn(
                                    "p-3 rounded-xl border flex items-start gap-3 transition-all",
                                    risk.type === 'danger' ? "bg-red-50 border-red-100 text-red-700" :
                                        risk.type === 'warning' ? "bg-amber-50 border-amber-100 text-amber-700" :
                                            "bg-blue-50 border-blue-100 text-blue-700"
                                )}>
                                    <div className={cn(
                                        "w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                                        risk.type === 'danger' ? "bg-red-100" :
                                            risk.type === 'warning' ? "bg-amber-100" :
                                                "bg-blue-100"
                                    )}>
                                        <Info className="w-3 h-3" />
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-black uppercase tracking-widest mb-0.5 opacity-80">{risk.level} Level</div>
                                        <div className="text-[11px] font-bold leading-relaxed">{risk.message}</div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-10 opacity-40">
                                <ShieldAlert className="w-8 h-8 mx-auto mb-2" />
                                <p className="text-[10px] font-black uppercase tracking-widest">Team Stable: No high-risk indicators</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
