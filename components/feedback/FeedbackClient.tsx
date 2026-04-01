"use client";
import { useState } from "react";
import { Feedback, FeedbackCategory, FeedbackPriority, FeedbackStatus } from "@/types";
import { useRouter } from "next/navigation";
import { Plus, X, Check, Trash2, Edit2, MessageSquare, AlertTriangle, CheckCircle, Clock } from "lucide-react";

interface FeedbackClientProps {
    feedback: Feedback[];
}

const CATEGORIES: FeedbackCategory[] = ["Workplace", "Management", "Tools", "Culture", "Benefits", "Other"];
const PRIORITIES: FeedbackPriority[] = ["Low", "Medium", "High", "Critical"];
const STATUSES: FeedbackStatus[] = ["New", "In Review", "Resolved", "Closed"];

const PRIORITY_COLORS: Record<FeedbackPriority, string> = {
    Low: "bg-slate-100 text-slate-600",
    Medium: "bg-amber-100 text-amber-700",
    High: "bg-orange-100 text-orange-700",
    Critical: "bg-red-100 text-red-700",
};
const STATUS_COLORS: Record<FeedbackStatus, string> = {
    New: "bg-blue-100 text-blue-700",
    "In Review": "bg-amber-100 text-amber-700",
    Resolved: "bg-emerald-100 text-emerald-700",
    Closed: "bg-slate-100 text-slate-600",
};

const DEFAULT_FORM = {
    title: "",
    message: "",
    category: "Other" as FeedbackCategory,
    priority: "Medium" as FeedbackPriority,
    status: "New" as FeedbackStatus,
    is_anonymous: true,
    assigned_to: "",
    admin_response: "",
};

export default function FeedbackClient({ feedback: initialFeedback }: FeedbackClientProps) {
    const router = useRouter();
    const [feedback, setFeedback] = useState<Feedback[]>(initialFeedback);
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState(DEFAULT_FORM);
    const [isLoading, setIsLoading] = useState(false);
    const [filterStatus, setFilterStatus] = useState<FeedbackStatus | "All">("All");
    const [filterCategory, setFilterCategory] = useState<FeedbackCategory | "All">("All");

    const filtered = feedback
        .filter(f => filterStatus === "All" || f.status === filterStatus)
        .filter(f => filterCategory === "All" || f.category === filterCategory);

    const kpis = {
        total: feedback.length,
        new: feedback.filter(f => f.status === "New").length,
        inReview: feedback.filter(f => f.status === "In Review").length,
        resolved: feedback.filter(f => f.status === "Resolved").length,
    };

    const startAdding = () => { setFormData({ ...DEFAULT_FORM }); setEditingId(null); setIsAdding(true); };
    const startEditing = (f: Feedback) => {
        setFormData({
            title: f.title,
            message: f.message,
            category: f.category,
            priority: f.priority,
            status: f.status,
            is_anonymous: f.is_anonymous,
            assigned_to: f.assigned_to || "",
            admin_response: f.admin_response || "",
        });
        setEditingId(f.id);
        setIsAdding(true);
    };
    const cancelForm = () => { setIsAdding(false); setEditingId(null); setFormData({ ...DEFAULT_FORM }); };

    const handleSave = async () => {
        if (!formData.title.trim() || !formData.message.trim()) return;
        setIsLoading(true);
        try {
            const payload = {
                title: formData.title,
                message: formData.message,
                category: formData.category,
                priority: formData.priority,
                status: formData.status,
                is_anonymous: formData.is_anonymous,
                assigned_to: formData.assigned_to,
                admin_response: formData.admin_response,
                ...(editingId ? { id: editingId } : {}),
            };
            const res = await fetch("/api/feedback", {
                method: editingId ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            if (!res.ok) { const e = await res.json(); throw new Error(e.error || "Save failed"); }
            cancelForm();
            const updated = await fetch("/api/feedback").then(r => r.json());
            if (updated.feedback) setFeedback(updated.feedback);
            router.refresh();
        } catch (err: any) {
            alert("Error saving feedback: " + err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this feedback?")) return;
        setIsLoading(true);
        try {
            await fetch(`/api/feedback?id=${id}`, { method: "DELETE" });
            setFeedback(prev => prev.filter(f => f.id !== id));
        } finally {
            setIsLoading(false);
        }
    };

    const quickStatus = async (id: string, status: FeedbackStatus) => {
        await fetch("/api/feedback", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, status }),
        });
        setFeedback(prev => prev.map(f => f.id === id ? { ...f, status } : f));
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Feedback</h1>
                    <p className="text-slate-400 text-sm mt-1">Employee feedback and suggestions</p>
                </div>
                <button onClick={startAdding} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg transition-colors">
                    <Plus size={16} /> Submit Feedback
                </button>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: "Total Feedback", value: kpis.total, icon: MessageSquare, color: "text-blue-400" },
                    { label: "New", value: kpis.new, icon: AlertTriangle, color: "text-amber-400" },
                    { label: "In Review", value: kpis.inReview, icon: Clock, color: "text-orange-400" },
                    { label: "Resolved", value: kpis.resolved, icon: CheckCircle, color: "text-emerald-400" },
                ].map(k => (
                    <div key={k.label} className="glass-card p-4 flex items-center gap-3">
                        <k.icon size={24} className={k.color} />
                        <div>
                            <p className="text-xs text-slate-400">{k.label}</p>
                            <p className="text-xl font-bold text-slate-800">{k.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2">
                <div className="flex gap-1">
                    {(["All", ...STATUSES] as const).map(s => (
                        <button key={s} onClick={() => setFilterStatus(s as any)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filterStatus === s ? "bg-blue-600 text-white" : "bg-white/5 text-slate-400 hover:bg-white/10"}`}>
                            {s}
                        </button>
                    ))}
                </div>
                <div className="flex gap-1">
                    {(["All", ...CATEGORIES] as const).map(c => (
                        <button key={c} onClick={() => setFilterCategory(c as any)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filterCategory === c ? "bg-violet-600 text-white" : "bg-white/5 text-slate-400 hover:bg-white/10"}`}>
                            {c}
                        </button>
                    ))}
                </div>
            </div>

            {/* Form */}
            {isAdding && (
                <div className="glass-card p-6 space-y-4 border border-blue-200">
                    <div className="flex items-center justify-between">
                        <h2 className="text-slate-800 font-semibold">{editingId ? "Edit Feedback" : "Submit Feedback"}</h2>
                        <button onClick={cancelForm}><X size={18} className="text-slate-400 hover:text-slate-700" /></button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-xs text-slate-600 font-medium mb-1">Title *</label>
                            <input value={formData.title} onChange={e => setFormData(p => ({ ...p, title: e.target.value }))}
                                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" placeholder="Feedback title" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-xs text-slate-600 font-medium mb-1">Message *</label>
                            <textarea value={formData.message} onChange={e => setFormData(p => ({ ...p, message: e.target.value }))}
                                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-sm focus:outline-none focus:border-blue-500 resize-none h-24" placeholder="Describe your feedback..." />
                        </div>
                        <div>
                            <label className="block text-xs text-slate-600 font-medium mb-1">Category</label>
                            <select value={formData.category} onChange={e => setFormData(p => ({ ...p, category: e.target.value as FeedbackCategory }))}
                                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-sm focus:outline-none focus:border-blue-500">
                                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs text-slate-600 font-medium mb-1">Priority</label>
                            <select value={formData.priority} onChange={e => setFormData(p => ({ ...p, priority: e.target.value as FeedbackPriority }))}
                                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-sm focus:outline-none focus:border-blue-500">
                                {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                        </div>
                        {editingId && (
                            <>
                                <div>
                                    <label className="block text-xs text-slate-600 font-medium mb-1">Status</label>
                                    <select value={formData.status} onChange={e => setFormData(p => ({ ...p, status: e.target.value as FeedbackStatus }))}
                                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-sm focus:outline-none focus:border-blue-500">
                                        {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs text-slate-600 font-medium mb-1">Assigned To</label>
                                    <input value={formData.assigned_to} onChange={e => setFormData(p => ({ ...p, assigned_to: e.target.value }))}
                                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-sm focus:outline-none focus:border-blue-500" placeholder="Assigned team/person" />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-xs text-slate-600 font-medium mb-1">Admin Response</label>
                                    <textarea value={formData.admin_response} onChange={e => setFormData(p => ({ ...p, admin_response: e.target.value }))}
                                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-sm focus:outline-none focus:border-blue-500 resize-none h-20" placeholder="Official response..." />
                                </div>
                            </>
                        )}
                        <div className="flex items-center gap-2">
                            <input type="checkbox" id="fb_anon" checked={formData.is_anonymous} onChange={e => setFormData(p => ({ ...p, is_anonymous: e.target.checked }))} className="accent-blue-500" />
                            <label htmlFor="fb_anon" className="text-sm text-slate-700">Submit anonymously</label>
                        </div>
                    </div>
                    <div className="flex gap-2 pt-2">
                        <button onClick={handleSave} disabled={isLoading}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm px-4 py-2 rounded-lg transition-colors">
                            <Check size={14} /> {isLoading ? "Saving..." : (editingId ? "Save Changes" : "Submit")}
                        </button>
                        <button onClick={cancelForm} className="text-sm text-slate-500 hover:text-slate-800 px-4 py-2">Cancel</button>
                    </div>
                </div>
            )}

            {/* Feedback List */}
            <div className="space-y-3">
                {filtered.length === 0 && <div className="text-center py-12 text-slate-500">No feedback found.</div>}
                {filtered.map(f => (
                    <div key={f.id} className="glass-card p-5 flex flex-col gap-2 hover:border-blue-500/20 transition-colors border border-transparent">
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[f.status]}`}>{f.status}</span>
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PRIORITY_COLORS[f.priority]}`}>{f.priority}</span>
                                    <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{f.category}</span>
                                </div>
                                <h3 className="text-slate-800 font-semibold text-sm">{f.title}</h3>
                                <p className="text-slate-400 text-xs mt-1">{f.message}</p>
                            </div>
                            <div className="flex gap-1 shrink-0">
                                <button onClick={() => startEditing(f)} className="p-1.5 rounded hover:bg-white/10"><Edit2 size={13} className="text-slate-400" /></button>
                                <button onClick={() => handleDelete(f.id)} className="p-1.5 rounded hover:bg-white/10"><Trash2 size={13} className="text-rose-400" /></button>
                            </div>
                        </div>
                        {f.admin_response && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                <p className="text-xs text-blue-600 font-medium mb-1">Admin Response</p>
                                <p className="text-xs text-slate-600">{f.admin_response}</p>
                            </div>
                        )}
                        <div className="flex items-center justify-between">
                            <div className="text-xs text-slate-600">
                                {f.is_anonymous ? "Anonymous" : (f.submitted_by || "Unknown")}
                                {f.assigned_to && ` · Assigned: ${f.assigned_to}`}
                                {f.created_at && ` · ${new Date(f.created_at).toLocaleDateString()}`}
                            </div>
                            {f.status === "New" && (
                                <button onClick={() => quickStatus(f.id, "In Review")} className="text-xs text-amber-400 hover:text-amber-300">→ In Review</button>
                            )}
                            {f.status === "In Review" && (
                                <button onClick={() => quickStatus(f.id, "Resolved")} className="text-xs text-emerald-400 hover:text-emerald-300">→ Resolve</button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
