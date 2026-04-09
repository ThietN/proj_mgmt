"use client";
import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend, LineChart, Line
} from 'recharts';
import {
    Users, Clock, AlertCircle, TrendingUp, Filter,
    Download, Calendar, Search, Upload, X, History
} from "lucide-react";
import { cn } from "@/lib/utils";
import AttendanceUpload from "./AttendanceUpload";

const COLORS = ['#f59e0b', '#ef4444', '#10b981', '#94a3b8']; // Amber (Late), Red (Not Access), Emerald, Slate

interface RankingMember {
    username: string;
    name: string;
    count: number;
}

export default function AttendanceDashboard() {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);
    const [showUpload, setShowUpload] = useState(false);
    const [filters, setFilters] = useState({
        startDate: "",
        endDate: "",
        project: ""
    });

    useEffect(() => {
        fetchStats();
    }, [filters]);

    const fetchStats = async () => {
        setLoading(true);
        try {
            const query = new URLSearchParams(filters).toString();
            const res = await fetch(`/api/attendance/stats?${query}`);
            if (res.ok) {
                const json = await res.json();
                setData(json);
            }
        } catch (err) { }
        setLoading(false);
    };

    const getRankColor = (index: number) => {
        const rank = index + 1;
        if (rank <= 3) return "bg-orange-50 text-orange-600 border-orange-100 ring-orange-500/30";
        if (rank <= 5) return "bg-yellow-50 text-yellow-600 border-yellow-100 ring-yellow-500/30";
        if (rank <= 10) return "bg-slate-50 text-slate-500 border-slate-100";
        return "bg-slate-50 text-slate-500 border-slate-100";
    };

    if (loading && !data) return <div className="p-20 text-center text-slate-400">Loading dashboard...</div>;

    const stats = data?.stats || { total: 0, late: 0, notAccess: 0, onTime: 0, startDate: null, endDate: null };
    const lateRate = stats.total > 0 ? (stats.late / stats.total * 100).toFixed(1) : "0.0";
    const notAccessRate = stats.total > 0 ? (stats.notAccess / stats.total * 100).toFixed(1) : "0.0";

    const pieData = [
        { name: 'Late', value: stats.late },
        { name: 'Not Access', value: stats.notAccess },
    ].filter(v => v.value > 0);

    const handleExport = () => {
        if (!data?.stats) return;
        const ws = XLSX.utils.json_to_sheet([
            { Type: 'Total Records', Value: stats.total },
            { Type: 'Late Count', Value: stats.late },
            { Type: 'Not Access Count', Value: stats.notAccess }
        ]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Attendance Summary");
        XLSX.writeFile(wb, `attendance_report_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    return (
        <div className="space-y-6">
            {/* Range & Filters */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {stats.startDate && (
                    <div className="flex items-center gap-3 bg-indigo-50 px-4 py-2 rounded-2xl border border-indigo-100 shadow-sm">
                        <Calendar className="w-5 h-5 text-indigo-500" />
                        <div>
                            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest leading-none mb-1">Report Data Range</p>
                            <p className="text-sm font-black text-indigo-700 leading-none">
                                {new Date(stats.startDate).toLocaleDateString()} — {new Date(stats.endDate).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                )}

                <div className="glass-card p-2 flex flex-wrap items-center gap-4 bg-white/50 backdrop-blur-md">
                    <div className="flex items-center gap-2 text-slate-400 px-2 border-r border-slate-100">
                        <Filter className="w-4 h-4" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Filters</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <input type="date" value={filters.startDate} onChange={e => setFilters({ ...filters, startDate: e.target.value })}
                            className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-medium outline-none focus:border-indigo-400" />
                        <span className="text-slate-300">-</span>
                        <input type="date" value={filters.endDate} onChange={e => setFilters({ ...filters, endDate: e.target.value })}
                            className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-medium outline-none focus:border-indigo-400" />
                    </div>
                    <select value={filters.project} onChange={e => setFilters({ ...filters, project: e.target.value })}
                        className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-medium outline-none focus:border-indigo-400">
                        <option value="">All Projects</option>
                    </select>
                    <button onClick={() => setShowUpload(true)} className="flex items-center gap-2 px-3 py-1 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:opacity-90 shadow-md">
                        <Upload className="w-3.5 h-3.5" /> Upload
                    </button>
                    <button onClick={handleExport} className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-bold hover:bg-emerald-100 transition-all border border-emerald-100">
                        <Download className="w-3.5 h-3.5" /> Export
                    </button>
                    <button onClick={fetchStats} className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors">
                        <TrendingUp className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Upload Modal */}
            {showUpload && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col relative animate-springIn">
                        <div className="p-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-10">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                                    <Upload className="w-4 h-4" />
                                </div>
                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Upload Tracking File</h3>
                            </div>
                            <button onClick={() => { setShowUpload(false); fetchStats(); }} className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6">
                            <AttendanceUpload />
                        </div>
                        <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Close this window after processing is complete to refresh dashboard</p>
                        </div>
                    </div>
                </div>
            )}

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card p-6 bg-white border-l-4 border-l-slate-400 shadow-sm hover:translate-y-[-2px] transition-all">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Records</p>
                            <h3 className="text-3xl font-black text-slate-900 leading-none">{stats.total.toLocaleString()}</h3>
                        </div>
                        <Users className="w-10 h-10 text-slate-100" />
                    </div>
                </div>
                <div className="glass-card p-6 bg-white border-l-4 border-l-amber-500 shadow-sm hover:translate-y-[-2px] transition-all">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-2">Total Lates</p>
                            <h3 className="text-3xl font-black text-slate-900 leading-none">{stats.late.toLocaleString()}</h3>
                            <div className="flex items-center gap-2 mt-2">
                                <span className="text-[10px] text-amber-50 bg-amber-600 font-black px-2 py-0.5 rounded-full">{lateRate}%</span>
                                <span className="text-[10px] text-slate-400 font-bold">Lateness Rate</span>
                            </div>
                        </div>
                        <Clock className="w-10 h-10 text-amber-50" />
                    </div>
                </div>
                <div className="glass-card p-6 bg-white border-l-4 border-l-red-500 shadow-sm hover:translate-y-[-2px] transition-all">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-2">Not Accesses</p>
                            <h3 className="text-3xl font-black text-slate-900 leading-none">{stats.notAccess.toLocaleString()}</h3>
                            <div className="flex items-center gap-2 mt-2">
                                <span className="text-[10px] text-red-50 bg-red-600 font-black px-2 py-0.5 rounded-full">{notAccessRate}%</span>
                                <span className="text-[10px] text-slate-400 font-bold">Not Access Rate</span>
                            </div>
                        </div>
                        <AlertCircle className="w-10 h-10 text-red-50" />
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 glass-card p-6 bg-white shrink-0 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Attendance Issue Trend (Last 30 Days)</h3>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1.5">
                                <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                                <span className="text-[10px] font-bold text-slate-400 uppercase">Late</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                                <span className="text-[10px] font-bold text-slate-400 uppercase">Not Access</span>
                            </div>
                        </div>
                    </div>
                    <div className="h-[280px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data?.trend}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
                                <XAxis dataKey="date" fontSize={9} tickFormatter={(v) => v.split('-').slice(1).join('/')} stroke="#cbd5e1" axisLine={false} tickLine={false} />
                                <YAxis fontSize={9} stroke="#cbd5e1" axisLine={false} tickLine={false} />
                                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                                <Line type="monotone" dataKey="late" name="Late" stroke="#f59e0b" strokeWidth={4} dot={false} activeDot={{ r: 6, strokeWidth: 0 }} />
                                <Line type="monotone" dataKey="notAccess" name="Not Access" stroke="#ef4444" strokeWidth={4} dot={false} activeDot={{ r: 6, strokeWidth: 0 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div className="glass-card p-6 bg-white shrink-0 shadow-sm flex flex-col items-center justify-center">
                    <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-6 w-full text-center">Issue Distribution</h3>
                    <div className="h-[240px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={pieData} cx="50%" cy="50%" innerRadius={70} outerRadius={90} paddingAngle={2} dataKey="value" stroke="none">
                                    {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 'bold' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Ranking Lists */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
                {/* Top Late Members */}
                <div className="glass-card bg-white overflow-visible flex flex-col shadow-sm border-t-2 border-t-amber-500">
                    <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-amber-500" />
                            <h3 className="text-xs font-black text-amber-700 uppercase tracking-widest">Top Late Members</h3>
                        </div>
                    </div>
                    <div className="flex-1 divide-y divide-slate-50">
                        {data?.topLate?.length > 0 ? (
                            data.topLate.map((member: any, idx: number) => {
                                const colorCls = getRankColor(idx);
                                return (
                                    <div key={member.username} className="group relative flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className={cn("w-6 h-6 flex items-center justify-center rounded-lg text-xs font-black border ring-2 ring-inset transition-all", colorCls)}>
                                                {idx + 1}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-900 leading-tight">{member.name}</p>
                                                <p className="text-[10px] text-slate-400 font-medium tracking-wide">Username: {member.username}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-black text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                                                {member.count} <span className="text-[10px] text-slate-400">times</span>
                                            </span>
                                        </div>

                                        {/* Tooltip */}
                                        <div className="absolute left-full top-0 ml-4 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200 z-[100] p-4 opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity before:content-[''] before:absolute before:right-full before:top-6 before:border-[8px] before:border-transparent before:border-r-white before:filter before:drop-shadow-[-2px_0_1px_rgba(0,0,0,0.05)]">
                                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 pb-2 border-b border-slate-100 flex items-center gap-2">
                                                <History className="w-3 h-3" /> Lateness History
                                            </h4>
                                            <div className="space-y-2 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                                                {member.details.map((d: any, i: number) => (
                                                    <div key={i} className="flex items-center justify-between text-[11px]">
                                                        <span className="font-bold text-slate-600">{new Date(d.date).toLocaleDateString()}</span>
                                                        <span className="text-amber-600 font-black bg-amber-50 px-2 py-0.5 rounded-full">{d.time}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="p-10 text-center text-slate-300 text-xs font-black italic uppercase tracking-widest">No issues found</div>
                        )}
                    </div>
                </div>

                {/* Top Not Access Members */}
                <div className="glass-card bg-white overflow-visible flex flex-col shadow-sm border-t-2 border-t-red-500">
                    <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-red-500" />
                            <h3 className="text-xs font-black text-red-700 uppercase tracking-widest">Top Not Access Members</h3>
                        </div>
                    </div>
                    <div className="flex-1 divide-y divide-slate-50">
                        {data?.topNotAccess?.length > 0 ? (
                            data.topNotAccess.map((member: any, idx: number) => {
                                const colorCls = getRankColor(idx);
                                return (
                                    <div key={member.username} className="group relative flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className={cn("w-6 h-6 flex items-center justify-center rounded-lg text-xs font-black border ring-2 ring-inset transition-all", colorCls)}>
                                                {idx + 1}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-900 leading-tight">{member.name}</p>
                                                <p className="text-[10px] text-slate-400 font-medium tracking-wide">ID: {member.username}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-black text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                                                {member.count} <span className="text-[10px] text-slate-400">times</span>
                                            </span>
                                        </div>

                                        {/* Tooltip */}
                                        <div className="absolute right-full top-0 mr-4 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200 z-[100] p-4 opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity before:content-[''] before:absolute before:left-full before:top-6 before:border-[8px] before:border-transparent before:border-l-white before:filter before:drop-shadow-[2px_0_1px_rgba(0,0,0,0.05)]">
                                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 pb-2 border-b border-slate-100 flex items-center gap-2">
                                                <History className="w-3 h-3" /> Missing Access History
                                            </h4>
                                            <div className="space-y-2 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                                                {member.details.map((d: any, i: number) => (
                                                    <div key={i} className="flex items-center justify-between text-[11px]">
                                                        <span className="font-bold text-slate-600">{new Date(d.date).toLocaleDateString()}</span>
                                                        <span className="text-red-600 font-black bg-red-50 px-2 py-0.5 rounded-full">{d.time}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="p-10 text-center text-slate-300 text-xs font-black italic uppercase tracking-widest">No issues found</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
