"use client";
import { Candidate } from "@/types";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Plus, X, Check, Trash2, Edit2, UserPlus, GraduationCap, LayoutPanelLeft } from "lucide-react";
import { useRouter } from "next/navigation";

const stages = ["Applied", "Screening", "Interview", "Offer", "Joined"] as const;
const stageColors: Record<string, string> = {
    Applied: "border-slate-300",
    Screening: "border-blue-300",
    Interview: "border-sky-300",
    Offer: "border-amber-300",
    Joined: "border-emerald-300",
};

interface HiringClientProps {
    initialData: Candidate[];
}

const DEFAULT_FORM = {
    candidate_id: "",
    candidate_name: "",
    source: "",
    role_applied: "",
    interview_status: "Applied" as Candidate["interview_status"],
    expected_join_date: new Date().toISOString().split("T")[0],
    start_date: new Date().toISOString().split("T")[0],
    end_date: new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString().split("T")[0],
    mentor: "",
    type: "Candidate" as Candidate["type"]
};

function calculateProgress(start?: string, end?: string) {
    if (!start || !end) return 0;
    const startDate = new Date(start).getTime();
    const endDate = new Date(end).getTime();
    const now = new Date().getTime();
    if (now < startDate) return 0;
    if (now > endDate) return 100;
    const total = endDate - startDate;
    if (total <= 0) return 0;
    return Math.round(((now - startDate) / total) * 100);
}

export function HiringClient({ initialData }: HiringClientProps) {
    const router = useRouter();
    const [candidates, setHiring] = useState<Candidate[]>(initialData);
    const [tab, setTab] = useState<"pipeline" | "interns">("pipeline");
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState(DEFAULT_FORM);
    const [isLoading, setIsLoading] = useState(false);

    const pipeline = candidates.filter((c) => c.type === "Candidate");
    const internsList = candidates.filter((c) => c.type === "Intern");

    const startAdding = (type: Candidate["type"]) => {
        setFormData({ ...DEFAULT_FORM, type, candidate_id: `${type === 'Candidate' ? 'C' : 'I'}${1000 + candidates.length + 1}` });
        setEditingId(null);
        setIsAdding(true);
    };

    const startEditing = (c: Candidate) => {
        setFormData({
            candidate_id: c.candidate_id,
            candidate_name: c.candidate_name,
            source: c.source,
            role_applied: c.role_applied,
            interview_status: c.interview_status,
            expected_join_date: c.expected_join_date,
            start_date: c.start_date || new Date().toISOString().split("T")[0],
            end_date: c.end_date || new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString().split("T")[0],
            mentor: c.mentor || "",
            type: c.type
        });
        setEditingId(c.candidate_id);
        setIsAdding(true);
    };

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setIsLoading(true);
        try {
            const method = editingId ? "PUT" : "POST";
            const res = await fetch("/api/hiring", {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                const data = await res.json();
                if (editingId) {
                    setHiring(candidates.map(c => c.candidate_id === editingId ? { ...c, ...formData } as Candidate : c));
                } else {
                    if (data.candidate) {
                        setHiring([...candidates, data.candidate]);
                    }
                }
                setIsAdding(false);
                setFormData(DEFAULT_FORM);
                setEditingId(null);
                router.refresh();
            }
        } catch (err) { }
        setIsLoading(false);
    }

    async function handleDelete(id: string, name: string) {
        if (!confirm(`Are you sure you want to delete ${name}?`)) return;
        try {
            const res = await fetch(`/api/hiring?id=${id}`, {
                method: "DELETE"
            });
            if (res.ok) {
                setHiring(candidates.filter(c => c.candidate_id !== id));
                router.refresh();
            }
        } catch (err) { }
    }

    return (
        <div className="space-y-4">
            {/* Control Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-card p-4">
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg w-fit border border-slate-200">
                    {(["pipeline", "interns"] as const).map((t) => (
                        <button
                            key={t}
                            onClick={() => setTab(t)}
                            className={cn(
                                "px-4 py-1.5 rounded-md text-xs font-bold transition-all capitalize",
                                tab === t
                                    ? "bg-white text-blue-600 shadow-sm border border-slate-200"
                                    : "text-slate-500 hover:text-slate-800"
                            )}
                        >
                            {t === "pipeline" ? "Hiring Pipeline" : "Intern Tracker"}
                        </button>
                    ))}
                </div>
                <button
                    onClick={() => isAdding ? setIsAdding(false) : startAdding(tab === 'pipeline' ? 'Candidate' : 'Intern')}
                    className={cn(
                        "flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-sm ring-1 ring-inset",
                        isAdding ? "bg-white ring-slate-200 text-slate-600 hover:bg-slate-50" : "bg-blue-600 ring-blue-700 text-white hover:bg-blue-700"
                    )}
                >
                    {isAdding ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    {isAdding ? "Cancel" : `New ${tab === 'pipeline' ? 'Candidate' : 'Intern'}`}
                </button>
            </div>

            {isAdding && (
                <div className="glass-card p-6 bg-blue-50/20 border-blue-200 animate-fadeInUp">
                    <form onSubmit={handleSubmit} className="space-y-4 max-w-4xl mx-auto">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Full Name</label>
                                <input
                                    required
                                    value={formData.candidate_name}
                                    onChange={(e) => setFormData({ ...formData, candidate_name: e.target.value })}
                                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 shadow-sm"
                                    placeholder="John Doe"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Role / Position</label>
                                <input
                                    required
                                    value={formData.role_applied}
                                    onChange={(e) => setFormData({ ...formData, role_applied: e.target.value })}
                                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 shadow-sm"
                                    placeholder="Frontend Intern"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">{formData.type === 'Intern' ? 'Mentor' : 'Source'}</label>
                                <input
                                    required
                                    value={formData.type === 'Intern' ? formData.mentor : formData.source}
                                    onChange={(e) => setFormData(formData.type === 'Intern' ? { ...formData, mentor: e.target.value } : { ...formData, source: e.target.value })}
                                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 shadow-sm"
                                    placeholder={formData.type === 'Intern' ? "Senior Dev A" : "Referral"}
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Status</label>
                                <select
                                    value={formData.interview_status}
                                    onChange={(e) => setFormData({ ...formData, interview_status: e.target.value as any })}
                                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 shadow-sm"
                                >
                                    {stages.map(s => <option key={s} value={s}>{s}</option>)}
                                    <option value="Rejected">Rejected</option>
                                </select>
                            </div>
                            {formData.type === 'Candidate' && (
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Join Date</label>
                                    <input
                                        type="date"
                                        value={formData.expected_join_date}
                                        onChange={(e) => setFormData({ ...formData, expected_join_date: e.target.value })}
                                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 shadow-sm"
                                    />
                                </div>
                            )}
                            {formData.type === 'Intern' && (
                                <>
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Start Date</label>
                                        <input
                                            type="date"
                                            value={formData.start_date}
                                            onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 shadow-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">End Date</label>
                                        <input
                                            type="date"
                                            value={formData.end_date}
                                            onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 shadow-sm"
                                        />
                                    </div>
                                </>
                            )}
                        </div>
                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                            <button
                                type="button"
                                onClick={() => setIsAdding(false)}
                                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 disabled:opacity-50 shadow-md active:scale-95 transition-all"
                            >
                                {isLoading ? (
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <Check className="w-4 h-4" />
                                )}
                                {editingId ? "Update Record" : "Add Record"}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {tab === "pipeline" && (
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    {stages.map((stage) => {
                        const stageCandidates = pipeline.filter((c) => c.interview_status === stage);
                        return (
                            <div key={stage} className={cn("glass-card border p-4 bg-white/50", stageColors[stage])}>
                                <div className="flex items-center justify-between mb-4 border-b border-inherit pb-2">
                                    <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{stage}</h3>
                                    <span className="bg-slate-100 text-[10px] font-bold text-slate-600 px-1.5 py-0.5 rounded-full ring-1 ring-slate-200">
                                        {stageCandidates.length}
                                    </span>
                                </div>
                                <div className="space-y-3">
                                    {stageCandidates.map((c) => (
                                        <div key={c.candidate_id} className="group bg-white border border-slate-200 rounded-xl p-3 shadow-sm hover:shadow-md hover:border-blue-300 transition-all relative">
                                            <div className="flex items-center gap-1 absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => startEditing(c)} className="p-1 hover:text-blue-600"><Edit2 className="w-3 h-3" /></button>
                                                <button onClick={() => handleDelete(c.candidate_id, c.candidate_name)} className="p-1 hover:text-red-600"><Trash2 className="w-3 h-3" /></button>
                                            </div>
                                            <div className="font-bold text-slate-800 text-xs truncate pr-6">{c.candidate_name}</div>
                                            <div className="text-[10px] font-medium text-slate-400 mt-0.5 truncate">{c.role_applied}</div>
                                            <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-50">
                                                <span className="text-[9px] text-slate-400">{c.source}</span>
                                                <span className="text-[9px] font-bold text-blue-500">{new Date(c.expected_join_date).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                                            </div>
                                        </div>
                                    ))}
                                    {stageCandidates.length === 0 && (
                                        <div className="text-[10px] text-slate-400 text-center py-8 italic">No candidates</div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {tab === "interns" && (
                <div className="glass-card bg-white/50 border-slate-200">
                    <div className="p-4 border-b border-slate-200 bg-white/30 backdrop-blur-sm">
                        <h2 className="text-sm font-bold text-slate-900">Intern Tracking System</h2>
                        <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest mt-0.5">Performance & Mentor monitoring</p>
                    </div>
                    <div className="divide-y divide-slate-100">
                        {internsList.map((intern) => (
                            <div key={intern.candidate_id} className="p-4 hover:bg-blue-50/30 transition-all group relative">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-100 to-sky-100 flex items-center justify-center text-sm font-black text-blue-600 border border-blue-200 shadow-sm">
                                            {intern.candidate_name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                                        </div>
                                        <div>
                                            <div className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">{intern.candidate_name}</div>
                                            <div className="text-[11px] font-medium text-slate-400 flex items-center gap-2 mt-0.5">
                                                <span>{intern.role_applied}</span>
                                                <span className="w-1 h-1 rounded-full bg-slate-200" />
                                                <span className="text-slate-500">Mentor: <strong className="text-slate-700 font-bold">{intern.mentor}</strong></span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="flex flex-col items-end opacity-0 group-hover:opacity-100 transition-opacity">
                                            <div className="flex items-center gap-1 mb-2">
                                                <button onClick={() => startEditing(intern)} className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm"><Edit2 className="w-3.5 h-3.5" /></button>
                                                <button onClick={() => handleDelete(intern.candidate_id, intern.candidate_name)} className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-red-500 hover:border-red-200 transition-all shadow-sm"><Trash2 className="w-3.5 h-3.5" /></button>
                                            </div>
                                        </div>
                                        <StatusBadge status={intern.interview_status} size="sm" />
                                    </div>
                                </div>
                                <div className="mt-4 flex items-center gap-4">
                                    <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden ring-1 ring-slate-200">
                                        <div
                                            className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-1000"
                                            style={{ width: `${calculateProgress(intern.start_date, intern.end_date)}%` }}
                                        />
                                    </div>
                                    <span className="text-[11px] font-black text-slate-500 w-10 text-right">{calculateProgress(intern.start_date, intern.end_date)}%</span>
                                </div>
                                <div className="mt-2 flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                                    <div className="flex items-center gap-3">
                                        <span className="bg-slate-100 px-2 py-0.5 rounded">ID: {intern.candidate_id}</span>
                                        <span>Source: {intern.source}</span>
                                    </div>
                                    {intern.start_date && intern.end_date ? (
                                        <span className="text-blue-500">{new Date(intern.start_date).toLocaleDateString()} - {new Date(intern.end_date).toLocaleDateString()}</span>
                                    ) : (
                                        <span className="text-blue-500">Target Joined: {new Date(intern.expected_join_date).toLocaleDateString()}</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {((tab === "pipeline" as any && pipeline.length === 0) || (tab === "interns" as any && internsList.length === 0)) && (
                <div className="glass-card p-20 text-center bg-slate-50/50 border-dashed border-2">
                    <UserPlus className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                    <h3 className="text-slate-900 font-bold mb-1">No Records Found</h3>
                    <p className="text-slate-400 text-xs">Start by adding a new candidate or intern to the roster.</p>
                </div>
            )}
        </div>
    );
}
