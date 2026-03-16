"use client";
import { Innovation } from "@/types";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Bot, Zap, Code2, FlaskConical, Plus, X, Check, Trash2, Edit2, Lightbulb, Star } from "lucide-react";
import { useRouter } from "next/navigation";

interface InnovationsClientProps {
    innovations: Innovation[];
}

const TYPE_ICONS: Record<string, React.ElementType> = {
    AI: Bot,
    Automation: Zap,
    Framework: Code2,
    Research: FlaskConical,
};

const TYPE_COLORS: Record<string, string> = {
    AI: "bg-sky-50 text-sky-600 border-sky-200",
    Automation: "bg-cyan-50 text-cyan-600 border-cyan-200",
    Framework: "bg-blue-600/10 text-blue-600 border-blue-600/20",
    Research: "bg-amber-50 text-amber-600 border-amber-200",
};

const DEFAULT_FORM = {
    initiative_id: "",
    initiative_name: "",
    owner: "",
    type: "AI" as Innovation["type"],
    status: "Planning" as Innovation["status"],
    impact_score: 5,
    description: "",
    start_date: new Date().toISOString().split("T")[0]
};

export function InnovationsClient({ innovations: initialData }: InnovationsClientProps) {
    const router = useRouter();
    const [innovations, setInnovations] = useState<Innovation[]>(initialData);
    const [typeFilter, setTypeFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState(DEFAULT_FORM);
    const [isLoading, setIsLoading] = useState(false);

    const types = Array.from(new Set(innovations.map((i) => i.type)));
    const statuses = Array.from(new Set(innovations.map((i) => i.status)));

    const filtered = innovations.filter((i) => {
        const matchesType = typeFilter === "all" || i.type === typeFilter;
        const matchesStatus = statusFilter === "all" || i.status === statusFilter;
        return matchesType && matchesStatus;
    });

    const startAdding = () => {
        setFormData({ ...DEFAULT_FORM, initiative_id: `I${1010 + innovations.length}` });
        setEditingId(null);
        setIsAdding(true);
    };

    const startEditing = (i: Innovation) => {
        setFormData({
            initiative_id: i.initiative_id,
            initiative_name: i.initiative_name,
            owner: i.owner,
            type: i.type,
            status: i.status,
            impact_score: i.impact_score,
            description: i.description,
            start_date: i.start_date
        });
        setEditingId(i.initiative_id);
        setIsAdding(true);
    };

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setIsLoading(true);
        try {
            const method = editingId ? "PUT" : "POST";
            const res = await fetch("/api/innovations", {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                const data = await res.json();
                if (editingId) {
                    setInnovations(innovations.map(i => i.initiative_id === editingId ? { ...i, ...formData } as Innovation : i));
                } else {
                    if (data.innovation) {
                        setInnovations([...innovations, data.innovation]);
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
        if (!confirm(`Are you sure you want to archive ${name}?`)) return;
        try {
            const res = await fetch(`/api/innovations?id=${id}`, {
                method: "DELETE"
            });
            if (res.ok) {
                setInnovations(innovations.filter(i => i.initiative_id !== id));
                router.refresh();
            }
        } catch (err) { }
    }

    return (
        <div className="space-y-4">
            {/* Header / Filter bar */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 glass-card p-4 bg-white/50 backdrop-blur-sm">
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 no-scrollbar">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest min-w-fit">Type:</span>
                        {["all", ...types].map((t) => (
                            <button
                                key={t}
                                onClick={() => setTypeFilter(t)}
                                className={cn(
                                    "px-3 py-1 rounded-full text-[11px] font-bold transition-all border whitespace-nowrap",
                                    typeFilter === t
                                        ? "bg-slate-900 border-slate-900 text-white shadow-sm"
                                        : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"
                                )}
                            >
                                {t === "all" ? "All" : t}
                            </button>
                        ))}
                    </div>
                    <div className="h-4 w-px bg-slate-200 hidden lg:block" />
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 no-scrollbar">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest min-w-fit">Status:</span>
                        {["all", ...statuses].map((s) => (
                            <button
                                key={s}
                                onClick={() => setStatusFilter(s)}
                                className={cn(
                                    "px-3 py-1 rounded-full text-[11px] font-bold transition-all border whitespace-nowrap",
                                    statusFilter === s
                                        ? "bg-blue-600 border-blue-600 text-white shadow-sm"
                                        : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"
                                )}
                            >
                                {s === "all" ? "All" : s}
                            </button>
                        ))}
                    </div>
                </div>
                <button
                    onClick={() => isAdding ? setIsAdding(false) : startAdding()}
                    className={cn(
                        "flex items-center justify-center gap-2 px-6 py-2 rounded-lg text-sm font-black transition-all shadow-sm ring-1 ring-inset",
                        isAdding ? "bg-white ring-slate-200 text-slate-600 hover:bg-slate-50" : "bg-gradient-to-r from-pink-500 to-rose-500 ring-rose-600 text-white hover:opacity-90"
                    )}
                >
                    {isAdding ? <X className="w-4 h-4" /> : <Lightbulb className="w-4 h-4" />}
                    {isAdding ? "Cancel" : "New Initiative"}
                </button>
            </div>

            {isAdding && (
                <div className="glass-card p-6 bg-rose-50/20 border-rose-200 animate-fadeInUp">
                    <form onSubmit={handleSubmit} className="space-y-4 max-w-4xl mx-auto">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Initiative Name</label>
                                <input
                                    required
                                    value={formData.initiative_name}
                                    onChange={(e) => setFormData({ ...formData, initiative_name: e.target.value })}
                                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 outline-none focus:border-rose-400 shadow-sm"
                                    placeholder="AI Code Assistant Implementation"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Owner / Lead</label>
                                <input
                                    required
                                    value={formData.owner}
                                    onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 outline-none focus:border-rose-400 shadow-sm"
                                    placeholder="Technical Lead A"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Type</label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 outline-none focus:border-rose-400 shadow-sm"
                                    >
                                        <option value="AI">AI</option>
                                        <option value="Automation">Automation</option>
                                        <option value="Framework">Framework</option>
                                        <option value="Research">Research</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Status</label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 outline-none focus:border-rose-400 shadow-sm"
                                    >
                                        <option value="Planning">Planning</option>
                                        <option value="In Progress">In Progress</option>
                                        <option value="Completed">Completed</option>
                                        <option value="On Hold">On Hold</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Impact Score (1-10)</label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="range"
                                        min="1"
                                        max="10"
                                        value={formData.impact_score}
                                        onChange={(e) => setFormData({ ...formData, impact_score: parseInt(e.target.value) })}
                                        className="flex-1 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-rose-500"
                                    />
                                    <span className="text-sm font-black text-rose-500 w-6">{formData.impact_score}</span>
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Start Date</label>
                                <input
                                    type="date"
                                    value={formData.start_date}
                                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 outline-none focus:border-rose-400 shadow-sm"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Description</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={3}
                                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 outline-none focus:border-rose-400 shadow-sm resize-none"
                                placeholder="Explain the value and goals of this initiative..."
                            />
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
                                className="flex items-center gap-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white px-8 py-2 rounded-lg text-sm font-black hover:opacity-90 disabled:opacity-50 shadow-md active:scale-95 transition-all"
                            >
                                {isLoading ? (
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <Check className="w-4 h-4" />
                                )}
                                {editingId ? "Update Innovation" : "Launch Initiative"}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filtered.map((init) => {
                    const Icon = TYPE_ICONS[init.type] ?? Zap;
                    return (
                        <div key={init.initiative_id} className="group glass-card p-5 hover:border-rose-500/30 transition-all bg-white/40 hover:bg-white/70 relative">
                            {/* Actions */}
                            <div className="absolute top-4 right-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => startEditing(init)} className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-blue-600 hover:border-blue-200 shadow-sm transition-all"><Edit2 className="w-3.5 h-3.5" /></button>
                                <button onClick={() => handleDelete(init.initiative_id, init.initiative_name)} className="p-1.5 bg-white border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-200 rounded-lg shadow-sm transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center border-2 border-white shadow-sm ring-1 ring-slate-200", TYPE_COLORS[init.type])}>
                                    <Icon className="w-6 h-6" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={cn("px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-tighter border", TYPE_COLORS[init.type])}>
                                            {init.type}
                                        </span>
                                        <span className="text-[10px] font-bold text-slate-400 tracking-wider">ID: {init.initiative_id}</span>
                                    </div>
                                    <h3 className="text-sm font-black text-slate-900 group-hover:text-rose-500 transition-colors leading-tight">{init.initiative_name}</h3>
                                    <div className="flex items-center gap-2 mt-1.5">
                                        <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500 border border-white">
                                            {init.owner.charAt(0)}
                                        </div>
                                        <span className="text-[11px] font-bold text-slate-500">Lead: {init.owner}</span>
                                    </div>
                                </div>
                            </div>

                            <p className="text-xs text-slate-500 mt-4 leading-relaxed font-medium bg-slate-50/50 p-3 rounded-xl border border-slate-100 italic">"{init.description}"</p>

                            <div className="flex items-center justify-between mt-5 pt-3 border-t border-slate-100">
                                <div className="flex flex-col gap-1.5">
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Impact Score</span>
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-0.5">
                                            {Array.from({ length: 10 }).map((_, i) => (
                                                <div
                                                    key={i}
                                                    className={cn(
                                                        "w-1.5 h-4 rounded-sm transition-all duration-300",
                                                        i < init.impact_score ? "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.3)]" : "bg-slate-200"
                                                    )}
                                                />
                                            ))}
                                        </div>
                                        <span className="text-sm font-black text-rose-500">{init.impact_score}/10</span>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    <StatusBadge status={init.status} size="sm" />
                                    <span className="text-[10px] font-bold text-slate-400">{new Date(init.start_date).toLocaleDateString([], { month: 'short', year: 'numeric' })}</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {filtered.length === 0 && (
                <div className="glass-card p-24 text-center bg-slate-50/30 border-dashed border-2">
                    <Star className="w-12 h-12 text-slate-200 mx-auto mb-4 animate-pulse" />
                    <h3 className="text-slate-900 font-bold mb-1">No Innovations Logged</h3>
                    <p className="text-slate-400 text-xs">Be the first to propose a new R&D or AI initiative.</p>
                </div>
            )}
        </div>
    );
}
