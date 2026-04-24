"use client";
import { useState } from "react";
import { MemberCertification, Resource, Certification } from "@/types";
import { Search, Filter, Plus, Edit2, Trash2, Calendar, Target, CheckCircle2, AlertCircle, Clock, ChevronRight, FileText, User, MoreHorizontal, Layers, GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";
import { MemberCertificationForm } from "./MemberCertificationForm";
import toast from "react-hot-toast";

interface MemberCertificationTrackerClientProps {
    initialData: MemberCertification[];
    members: Resource[];
    certifications: Certification[];
}

export function MemberCertificationTrackerClient({ initialData, members, certifications }: MemberCertificationTrackerClientProps) {
    const [records, setRecords] = useState<MemberCertification[]>(initialData);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [isAdding, setIsAdding] = useState(false);
    const [editingRecord, setEditingRecord] = useState<MemberCertification | null>(null);

    const filtered = records.filter(r => {
        const matchesSearch =
            (r.member?.name?.toLowerCase().includes(search.toLowerCase())) ||
            (r.certification?.name?.toLowerCase().includes(search.toLowerCase())) ||
            (r.member_id.toLowerCase().includes(search.toLowerCase()));
        const matchesStatus = statusFilter === "all" || r.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const handleDelete = async (id: string) => {
        if (!confirm(`Are you sure you want to remove this record?`)) return;
        try {
            const res = await fetch(`/api/member-certifications?id=${id}`, { method: "DELETE" });
            if (res.ok) {
                setRecords(records.filter(r => r.id !== id));
                toast.success("Record deleted");
            } else {
                toast.error("Failed to delete record");
            }
        } catch (err) {
            toast.error("An error occurred");
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'PASSED': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
            case 'SCHEDULED': return <Calendar className="w-4 h-4 text-blue-500" />;
            case 'LEARNING': return <Clock className="w-4 h-4 text-amber-500" />;
            case 'FAILED': return <AlertCircle className="w-4 h-4 text-red-500" />;
            case 'EXPIRED': return <Clock className="w-4 h-4 text-slate-400" />;
            default: return <Target className="w-4 h-4 text-slate-300" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PASSED': return "bg-emerald-50 text-emerald-700 border-emerald-100";
            case 'SCHEDULED': return "bg-blue-50 text-blue-700 border-blue-100";
            case 'LEARNING': return "bg-amber-50 text-amber-700 border-amber-100";
            case 'FAILED': return "bg-red-50 text-red-700 border-red-100";
            case 'EXPIRED': return "bg-slate-100 text-slate-600 border-slate-200";
            default: return "bg-slate-50 text-slate-500 border-slate-100";
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by member or cert..."
                            className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-sm outline-none focus:border-indigo-500 shadow-sm"
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm outline-none focus:border-indigo-500 shadow-sm font-medium text-slate-600"
                    >
                        <option value="all">All Status</option>
                        <option value="PLANNED">Planned</option>
                        <option value="LEARNING">Learning</option>
                        <option value="SCHEDULED">Scheduled</option>
                        <option value="PASSED">Passed</option>
                        <option value="FAILED">Failed</option>
                        <option value="EXPIRED">Expired</option>
                    </select>
                </div>
                <button
                    onClick={() => setIsAdding(true)}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all active:scale-95"
                >
                    <Plus className="w-4 h-4" />
                    Add Cert
                </button>
            </div>

            {(isAdding || editingRecord) && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                        <MemberCertificationForm
                            initialData={editingRecord || {}}
                            members={members}
                            certifications={certifications}
                            onSuccess={(newMc) => {
                                // For simplicity, re-fetching or refreshing would be better as it has joined data
                                // But let's try to update the local state manually for immediate feedback
                                if (editingRecord) {
                                    setRecords(records.map(r => r.id === editingRecord.id ? { ...r, ...newMc } : r));
                                } else {
                                    // In a real app, I'd want the full joined object from the server
                                    window.location.reload();
                                }
                                setIsAdding(false);
                                setEditingRecord(null);
                            }}
                            onCancel={() => {
                                setIsAdding(false);
                                setEditingRecord(null);
                            }}
                        />
                    </div>
                </div>
            )}

            <div className="glass-card overflow-hidden border-slate-200">
                <div className="overflow-x-auto text-[13px]">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="px-6 py-4 text-left font-black text-slate-400 uppercase tracking-widest text-[10px]">Member</th>
                                <th className="px-6 py-4 text-left font-black text-slate-400 uppercase tracking-widest text-[10px]">Certification</th>
                                <th className="px-6 py-4 text-left font-black text-slate-400 uppercase tracking-widest text-[10px]">Status / Progress</th>
                                <th className="px-6 py-4 text-left font-black text-slate-400 uppercase tracking-widest text-[10px]">Target Date</th>
                                <th className="px-6 py-4 text-left font-black text-slate-400 uppercase tracking-widest text-[10px]">Expiry</th>
                                <th className="px-6 py-4 text-left font-black text-slate-400 uppercase tracking-widest text-[10px]">Priority</th>
                                <th className="px-6 py-4 text-left font-black text-slate-400 uppercase tracking-widest text-[10px]">Notes</th>
                                <th className="px-6 py-4 text-right font-black text-slate-400 uppercase tracking-widest text-[10px]">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white/50">
                            {filtered.map((record) => (
                                <tr key={record.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-xs border border-slate-200">
                                                {record.member?.name?.split(" ").map(n => n[0]).slice(0, 2).join("") || "??"}
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-900 leading-tight">{record.member?.name || "Unknown"}</div>
                                                <div className="text-[10px] text-slate-400 font-mono tracking-tighter uppercase">{record.member?.role} • {record.member?.team}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div>
                                            <div className="font-black text-slate-800 leading-tight">{record.certification?.name}</div>
                                            <div className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                                                <span className="font-black uppercase tracking-wider text-blue-500/70">{record.certification?.provider}</span>
                                                <span className="opacity-30">•</span>
                                                <span className="font-mono">{record.certification?.code}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="space-y-2 max-w-[140px]">
                                            <div className={cn(
                                                "flex items-center gap-2 px-2 py-1 rounded-lg border w-fit text-[10px] font-black uppercase tracking-wider",
                                                getStatusColor(record.status)
                                            )}>
                                                {getStatusIcon(record.status)}
                                                {record.status}
                                            </div>
                                            {record.status !== 'PASSED' && record.status !== 'PLANNED' && (
                                                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                                    <div
                                                        className={cn(
                                                            "h-full transition-all duration-500",
                                                            record.status === 'LEARNING' ? "bg-amber-400" :
                                                                record.status === 'SCHEDULED' ? "bg-blue-400" : "bg-slate-300"
                                                        )}
                                                        style={{ width: `${record.progress_percent}%` }}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <div className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                                                <Calendar className="w-3 h-3 opacity-40" />
                                                {record.target_exam_date || "-"}
                                            </div>
                                            {record.actual_exam_date && (
                                                <div className="text-[10px] text-emerald-600 font-bold mt-1 flex items-center gap-1">
                                                    <BadgeCheck className="w-3 h-3" /> Exam: {record.actual_exam_date}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className={cn(
                                            "text-xs font-bold",
                                            record.expiry_date && new Date(record.expiry_date) < new Date() ? "text-red-500" : "text-slate-500"
                                        )}>
                                            {record.expiry_date || "-"}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={cn(
                                            "text-[10px] font-black px-2 py-0.5 rounded-md border uppercase tracking-wider",
                                            record.priority === 'HIGH' ? "text-red-600 bg-red-50 border-red-100" :
                                                record.priority === 'MEDIUM' ? "text-amber-600 bg-amber-50 border-amber-100" :
                                                    "text-blue-600 bg-blue-50 border-blue-100"
                                        )}>
                                            {record.priority}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="max-w-[150px] truncate group/note relative cursor-help">
                                            <span className="text-[11px] text-slate-500 italic">
                                                {record.manager_note || "-"}
                                            </span>
                                            {record.manager_note && (
                                                <div className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-slate-800 text-white text-[10px] rounded shadow-xl opacity-0 group-hover/note:opacity-100 transition-opacity pointer-events-none z-50 whitespace-normal">
                                                    {record.manager_note}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => setEditingRecord(record)}
                                                className="p-2 hover:bg-indigo-50 text-indigo-600 rounded-xl transition-all"
                                                title="Edit Progress"
                                            >
                                                <Edit2 className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(record.id)}
                                                className="p-2 hover:bg-red-50 text-red-500 rounded-xl transition-all"
                                                title="Remove Record"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {filtered.length === 0 && (
                    <div className="p-12 text-center text-slate-400 font-medium">
                        No tracking records found.
                    </div>
                )}
            </div>
        </div>
    );
}

function BadgeCheck({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" />
            <path d="m9 12 2 2 4-4" />
        </svg>
    )
}
