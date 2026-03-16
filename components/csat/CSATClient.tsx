"use client";
import { CSATRecord } from "@/types";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Star, Plus, X, Check, Trash2, Edit2, ShieldAlert, Heart, Calendar, MessageSquare, ListChecks } from "lucide-react";
import { useRouter } from "next/navigation";

interface CSATClientProps {
    records: CSATRecord[];
}

const DEFAULT_FORM = {
    id: "",
    customer: "",
    project_id: "",
    survey_date: new Date().toISOString().split("T")[0],
    survey_score: 10,
    feedback: "",
    action_plan: ""
};

export function CSATClient({ records: initialData }: CSATClientProps) {
    const router = useRouter();
    const [records, setRecords] = useState<CSATRecord[]>(initialData);
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState(DEFAULT_FORM);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const filtered = records.filter((r) =>
        r.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.project_id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const startAdding = () => {
        setFormData({ ...DEFAULT_FORM, id: `C${Date.now()}` });
        setEditingId(null);
        setIsAdding(true);
    };

    const startEditing = (r: CSATRecord) => {
        setFormData({
            id: r.id,
            customer: r.customer,
            project_id: r.project_id || r.record_id || "",
            survey_date: r.survey_date,
            survey_score: r.survey_score,
            feedback: r.feedback || "",
            action_plan: r.action_plan || ""
        });
        setEditingId(r.id);
        setIsAdding(true);
    };

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setIsLoading(true);
        try {
            const method = editingId ? "PUT" : "POST";
            const res = await fetch("/api/csat", {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                const data = await res.json();
                if (editingId) {
                    setRecords(records.map(r => r.id === editingId ? { ...r, ...formData } as CSATRecord : r));
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
        if (!confirm("Remove this CSAT record?")) return;
        try {
            const res = await fetch(`/api/csat?id=${id}`, { method: "DELETE" });
            if (res.ok) {
                setRecords(records.filter(r => r.id !== id));
                router.refresh();
            }
        } catch (err) { }
    }

    return (
        <div className="space-y-4">
            {/* Control Bar */}
            <div className="glass-card p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 border-slate-200">
                <div className="relative flex-1 max-w-md">
                    <Star className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="Search Client or Project..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold outline-none focus:border-amber-400 focus:bg-white shadow-sm transition-all"
                    />
                </div>
                <button
                    onClick={() => isAdding ? setIsAdding(false) : startAdding()}
                    className={cn(
                        "flex items-center justify-center gap-2 px-6 py-2 rounded-lg text-xs font-black transition-all shadow-md ring-1 ring-inset",
                        isAdding ? "bg-white ring-slate-200 text-slate-600 hover:bg-slate-50" : "bg-gradient-to-r from-amber-500 to-orange-500 ring-amber-600 text-white hover:opacity-95"
                    )}
                >
                    {isAdding ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    {isAdding ? "Cancel" : "Add Client Feedback"}
                </button>
            </div>

            {isAdding && (
                <div className="glass-card p-6 bg-amber-50/20 border-amber-200 animate-fadeInUp">
                    <form onSubmit={handleSubmit} className="space-y-4 max-w-4xl mx-auto">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="lg:col-span-2">
                                <label className="block text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1.5">Client / Organization</label>
                                <input
                                    required
                                    value={formData.customer}
                                    onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
                                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold text-slate-900 outline-none focus:border-amber-500 shadow-sm"
                                    placeholder="Ex: Coca-Cola Japan"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1.5">Project ID</label>
                                <input
                                    required
                                    value={formData.project_id}
                                    onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
                                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold text-slate-900 outline-none focus:border-amber-500 shadow-sm"
                                    placeholder="P10XX"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1.5">CSAT Score (1-10)</label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="range"
                                        min="1"
                                        max="10"
                                        value={formData.survey_score}
                                        onChange={(e) => setFormData({ ...formData, survey_score: parseInt(e.target.value) })}
                                        className="flex-1 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
                                    />
                                    <span className="text-sm font-black text-amber-500 w-6">{formData.survey_score}</span>
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1.5">Client Feedback</label>
                                <textarea
                                    value={formData.feedback}
                                    onChange={(e) => setFormData({ ...formData, feedback: e.target.value })}
                                    rows={3}
                                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium text-slate-900 outline-none focus:border-amber-500 shadow-sm"
                                    placeholder="Key quotes or overall impression..."
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1.5">Action Plan (if applicable)</label>
                                <textarea
                                    value={formData.action_plan}
                                    onChange={(e) => setFormData({ ...formData, action_plan: e.target.value })}
                                    rows={3}
                                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium text-slate-900 outline-none focus:border-amber-500 shadow-sm"
                                    placeholder="Steps taken to address feedback..."
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
                                className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-8 py-2 rounded-lg text-sm font-black hover:opacity-95 disabled:opacity-50 shadow-md active:scale-95 transition-all"
                            >
                                {isLoading ? (
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <Check className="w-4 h-4" />
                                )}
                                {editingId ? "Update Result" : "Log Result"}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Matrix / List */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filtered.map((r) => (
                    <div key={r.id} className="group glass-card p-6 bg-white/40 hover:bg-white/70 hover:border-amber-400 transition-all border-slate-200 relative">
                        {/* Rating Badge */}
                        <div className={cn(
                            "absolute bottom-4 right-4 text-[44px] font-black flex flex-col items-center leading-none select-none pointer-events-none opacity-20 group-hover:opacity-100 group-hover:scale-110 transition-all",
                            r.survey_score >= 9 ? "text-emerald-500" : r.survey_score >= 7 ? "text-blue-500" : "text-rose-500"
                        )}>
                            {r.survey_score}
                            <span className="text-[10px] font-black uppercase tracking-tighter">Score</span>
                        </div>

                        {/* Actions */}
                        <div className="absolute top-4 right-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => startEditing(r)} className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-amber-600 hover:border-amber-200 shadow-sm transition-all"><Edit2 className="w-3.5 h-3.5" /></button>
                            <button onClick={() => handleDelete(r.id)} className="p-1.5 bg-white border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-200 rounded-lg shadow-sm transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>

                        <div className="flex flex-col gap-4">
                            <div className="flex-1">
                                <h3 className="text-lg font-black text-slate-900 group-hover:text-amber-600 transition-colors leading-tight">{r.customer}</h3>
                                <div className="flex items-center gap-3 mt-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-slate-300" /> {new Date(r.survey_date).toLocaleDateString()}</span>
                                    <span className="w-1 h-1 rounded-full bg-slate-200" />
                                    <span className="flex items-center gap-1">Project ID: <strong className="text-slate-700">{r.project_id}</strong></span>
                                </div>
                            </div>

                            <div className="space-y-4 pr-16">
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                                        <MessageSquare className="w-4 h-4 text-blue-500" />
                                    </div>
                                    <div>
                                        <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest mb-1 block">Customer Voice</span>
                                        <p className="text-xs font-medium text-slate-600 leading-relaxed bg-slate-50/50 p-2 rounded-lg border border-slate-100 italic">
                                            "{r.feedback || "No feedback provided"}"
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                                        <ListChecks className="w-4 h-4 text-emerald-500" />
                                    </div>
                                    <div>
                                        <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-1 block">Management Action</span>
                                        <p className="text-xs font-medium text-slate-700 leading-relaxed bg-white/50 p-2 rounded-lg border border-slate-200">
                                            {r.action_plan || "Pending action plan..."}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Critical Alert Pin if Score < 7 */}
                        {r.survey_score < 7 && (
                            <div className="absolute top-0 left-0 w-1.5 h-full bg-rose-500 flex items-center justify-center">
                                <ShieldAlert className="w-3 h-3 text-white -rotate-90" />
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {filtered.length === 0 && (
                <div className="glass-card p-24 text-center bg-slate-50/30 border-dashed border-2">
                    <Heart className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                    <h3 className="text-slate-900 font-bold mb-1">No CSAT Data</h3>
                    <p className="text-slate-400 text-xs">Capture customer sentiments to improve service delivery.</p>
                </div>
            )}
        </div>
    );
}
