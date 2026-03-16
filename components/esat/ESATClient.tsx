"use client";
import { ESATRecord } from "@/types";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { BarChart3, Plus, X, Check, Trash2, Edit2, Smile, ListChecks, TrendingUp, Users } from "lucide-react";
import { useRouter } from "next/navigation";

interface ESATClientProps {
    records: ESATRecord[];
    quarters: string[];
}

const DEFAULT_FORM = {
    id: "",
    team: "",
    quarter: "",
    score: 0,
    respondents: 0,
    top_positive: "",
    top_improvement: ""
};

export function ESATClient({ records: initialData, quarters }: ESATClientProps) {
    const router = useRouter();
    const [records, setRecords] = useState<ESATRecord[]>(initialData);
    const [selectedTeam, setSelectedTeam] = useState("all");
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState(DEFAULT_FORM);
    const [isLoading, setIsLoading] = useState(false);

    const teams = Array.from(new Set(records.map((r) => r.team)));
    const filtered = selectedTeam === "all" ? records : records.filter((r) => r.team === selectedTeam);

    const startAdding = () => {
        setFormData({ ...DEFAULT_FORM, quarter: quarters[quarters.length - 1] || "2024-Q1" });
        setEditingId(null);
        setIsAdding(true);
    };

    const startEditing = (r: ESATRecord) => {
        setFormData({ ...r });
        setEditingId(r.id);
        setIsAdding(true);
    };

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setIsLoading(true);
        try {
            const method = editingId ? "PUT" : "POST";
            const res = await fetch("/api/esat", {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                const data = await res.json();
                if (editingId) {
                    setRecords(records.map(r => r.id === editingId ? { ...r, ...formData } as ESATRecord : r));
                } else {
                    if (data.record) {
                        setRecords([data.record, ...records]);
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

    async function handleDelete(id: string) {
        if (!confirm("Are you sure?")) return;
        try {
            const res = await fetch(`/api/esat?id=${id}`, { method: "DELETE" });
            if (res.ok) {
                setRecords(records.filter(r => r.id !== id));
                router.refresh();
            }
        } catch (err) { }
    }

    return (
        <div className="space-y-4">
            {/* Header / Filter */}
            <div className="glass-card p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/50 border-slate-200">
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 md:pb-0">
                    {["all", ...teams].map((t) => (
                        <button
                            key={t}
                            onClick={() => setSelectedTeam(t)}
                            className={cn(
                                "px-3 py-1.5 rounded-lg text-xs font-bold transition-all border whitespace-nowrap",
                                selectedTeam === t
                                    ? "bg-slate-900 border-slate-900 text-white shadow-sm"
                                    : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"
                            )}
                        >
                            {t === "all" ? "All Teams" : t}
                        </button>
                    ))}
                </div>
                <button
                    onClick={() => isAdding ? setIsAdding(false) : startAdding()}
                    className={cn(
                        "flex items-center justify-center gap-2 px-6 py-2 rounded-lg text-xs font-black transition-all shadow-sm ring-1 ring-inset",
                        isAdding ? "bg-white ring-slate-200 text-slate-600 hover:bg-slate-50" : "bg-sky-600 ring-sky-700 text-white hover:bg-sky-700"
                    )}
                >
                    {isAdding ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    {isAdding ? "Cancel" : "Add Survey Data"}
                </button>
            </div>

            {isAdding && (
                <div className="glass-card p-6 bg-sky-50/20 border-sky-200 animate-fadeInUp">
                    <form onSubmit={handleSubmit} className="space-y-4 max-w-4xl mx-auto">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Team</label>
                                <input
                                    required
                                    value={formData.team}
                                    onChange={(e) => setFormData({ ...formData, team: e.target.value })}
                                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 outline-none focus:border-sky-500 shadow-sm"
                                    placeholder="Product Team"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Quarter</label>
                                <input
                                    required
                                    value={formData.quarter}
                                    onChange={(e) => setFormData({ ...formData, quarter: e.target.value })}
                                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 outline-none focus:border-sky-500 shadow-sm"
                                    placeholder="2024-Q1"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Avg Score (0-10)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    min="0"
                                    max="10"
                                    required
                                    value={formData.score}
                                    onChange={(e) => setFormData({ ...formData, score: parseFloat(e.target.value) })}
                                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 outline-none focus:border-sky-500 shadow-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Respondents</label>
                                <input
                                    type="number"
                                    required
                                    value={formData.respondents}
                                    onChange={(e) => setFormData({ ...formData, respondents: parseInt(e.target.value) })}
                                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 outline-none focus:border-sky-500 shadow-sm"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Top Positives</label>
                                <textarea
                                    value={formData.top_positive}
                                    onChange={(e) => setFormData({ ...formData, top_positive: e.target.value })}
                                    rows={2}
                                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 outline-none focus:border-sky-500 shadow-sm resize-none"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Top Improvements</label>
                                <textarea
                                    value={formData.top_improvement}
                                    onChange={(e) => setFormData({ ...formData, top_improvement: e.target.value })}
                                    rows={2}
                                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 outline-none focus:border-sky-500 shadow-sm resize-none"
                                />
                            </div>
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
                                className="flex items-center gap-2 bg-sky-600 text-white px-8 py-2 rounded-lg text-sm font-black hover:bg-sky-700 disabled:opacity-50 shadow-md active:scale-95 transition-all"
                            >
                                {isLoading ? (
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <Check className="w-4 h-4" />
                                )}
                                {editingId ? "Update Survey" : "Save Survey"}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* List / Table */}
            <div className="grid grid-cols-1 gap-4">
                {filtered.map((r) => (
                    <div key={r.id} className="group glass-card p-5 bg-white/40 hover:bg-white/70 hover:border-sky-300 transition-all border-slate-200 relative overflow-hidden">
                        {/* Background Quarter Stamp */}
                        <div className="absolute top-1/2 -translate-y-1/2 right-10 text-[60px] font-black text-slate-100/30 -z-10 select-none pointer-events-none group-hover:text-sky-100/30 transition-colors">
                            {r.quarter}
                        </div>

                        {/* Actions */}
                        <div className="absolute top-4 right-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                            <button onClick={() => startEditing(r)} className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-sky-600 hover:border-sky-200 shadow-sm transition-all"><Edit2 className="w-3.5 h-3.5" /></button>
                            <button onClick={() => handleDelete(r.id)} className="p-1.5 bg-white border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-200 rounded-lg shadow-sm transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>

                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-1">
                                    <h3 className="text-lg font-black text-slate-900 group-hover:text-sky-600 transition-colors">{r.team}</h3>
                                    <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-[10px] font-black text-slate-500 uppercase tracking-widest">{r.quarter}</span>
                                </div>
                                <div className="flex items-center gap-4 text-xs font-bold text-slate-400 uppercase tracking-tighter">
                                    <span className="flex items-center gap-1"><Users className="w-3 h-3 text-slate-300" /> {r.respondents} Respondents</span>
                                    <span className="flex items-center gap-1"><Smile className="w-3 h-3 text-slate-300" /> Avg Score: <strong className="text-slate-700">{r.score}/10</strong></span>
                                </div>

                                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-emerald-50/50 p-3 rounded-xl border border-emerald-100">
                                        <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-1.5 mb-1"><TrendingUp className="w-3 h-3" /> Top Positives</span>
                                        <p className="text-[11px] font-medium text-slate-600 leading-relaxed">{r.top_positive || "No entry recorded"}</p>
                                    </div>
                                    <div className="bg-amber-50/50 p-3 rounded-xl border border-amber-100">
                                        <span className="text-[9px] font-black text-amber-600 uppercase tracking-widest flex items-center gap-1.5 mb-1"><ListChecks className="w-3 h-3" /> Top Improvements</span>
                                        <p className="text-[11px] font-medium text-slate-600 leading-relaxed">{r.top_improvement || "No entry recorded"}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="shrink-0 flex items-center justify-center w-24 h-24 rounded-2xl bg-gradient-to-br from-white to-slate-50 border-2 border-white shadow-xl group-hover:scale-105 transition-transform">
                                <div className="relative flex flex-col items-center">
                                    <span className="text-2xl font-black text-slate-900 leading-none">{r.score}</span>
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter mt-1">Satisfaction</span>

                                    {/* Score Circle Progress */}
                                    <svg className="absolute -inset-8 w-24 h-24 -rotate-90">
                                        <circle cx="48" cy="48" r="40" fill="none" stroke="currentColor" strokeWidth="6" className="text-slate-100" />
                                        <circle cx="48" cy="48" r="40" fill="none" stroke="currentColor" strokeWidth="6" strokeDasharray={`${(r.score / 10) * 251} 251`} className="text-sky-500 transition-all duration-1000" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filtered.length === 0 && (
                <div className="glass-card p-24 text-center bg-slate-50/30 border-dashed border-2">
                    <BarChart3 className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                    <h3 className="text-slate-900 font-bold mb-1">No ESAT Records</h3>
                    <p className="text-slate-400 text-xs">Run a team satisfaction survey to populate this view.</p>
                </div>
            )}
        </div>
    );
}
