"use client";
import { Project } from "@/types";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useState } from "react";
import { Users, Calendar, Rocket, Plus, X, Check, Trash2, Edit2, AlertTriangle, Monitor, Target, CornerDownRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface DeliveryClientProps {
    projects: Project[];
}

const DEFAULT_FORM = {
    project_id: "",
    project_name: "",
    customer: "",
    headcount: 0,
    effort: 0,
    billable: 0,
    nbr: 0,
    delivery_status: "On Track" as Project["delivery_status"],
    risk_level: "Low" as Project["risk_level"],
    milestone_progress: 0,
    start_date: new Date().toISOString().split("T")[0],
    end_date: new Date().toISOString().split("T")[0],
    tech_stack: "",
    parent_id: ""
};

export function DeliveryClient({ projects: initialProjects }: DeliveryClientProps) {
    const router = useRouter();
    const [projects, setProjects] = useState<Project[]>(initialProjects);
    const [filter, setFilter] = useState("all");
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState(DEFAULT_FORM);
    const [isLoading, setIsLoading] = useState(false);

    const statuses = ["all", "On Track", "At Risk", "Critical", "Completed"];

    // Hierarchical sort: Parent first, then its children
    const sortedProjects = [...projects].sort((a, b) => {
        const idA = a.parent_id || a.project_id;
        const idB = b.parent_id || b.project_id;
        if (idA === idB) {
            return a.parent_id ? 1 : -1;
        }
        return idA.localeCompare(idB);
    });

    const filtered = filter === "all" ? sortedProjects : sortedProjects.filter((p) => p.delivery_status === filter);

    const startAdding = () => {
        setFormData({ ...DEFAULT_FORM, project_id: `P${1010 + projects.length}` });
        setEditingId(null);
        setIsAdding(true);
    };

    const startEditing = (p: Project) => {
        setFormData({
            project_id: p.project_id,
            project_name: p.project_name,
            customer: p.customer,
            headcount: p.headcount,
            effort: p.effort,
            billable: p.billable,
            nbr: p.nbr,
            delivery_status: p.delivery_status,
            risk_level: p.risk_level,
            milestone_progress: p.milestone_progress,
            start_date: p.start_date,
            end_date: p.end_date,
            tech_stack: p.tech_stack.join(", "),
            parent_id: p.parent_id || ""
        });
        setEditingId(p.project_id);
        setIsAdding(true);
    };

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setIsLoading(true);
        try {
            const method = editingId ? "PUT" : "POST";
            const res = await fetch("/api/projects", {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                const data = await res.json();
                if (editingId) {
                    setProjects(projects.map(p => p.project_id === editingId ? { ...p, ...formData, tech_stack: typeof formData.tech_stack === 'string' ? formData.tech_stack.split(',').map(s=>s.trim()).filter(Boolean) : formData.tech_stack } as Project : p));
                } else {
                    if (data.project) {
                        setProjects([...projects, data.project]);
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
            const res = await fetch(`/api/projects?id=${id}`, {
                method: "DELETE"
            });
            if (res.ok) {
                setProjects(projects.filter(p => p.project_id !== id));
                router.refresh();
            }
        } catch (err) { }
    }

    return (
        <div className="space-y-4">
            {/* Header / Filter bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-card p-4">
                <div className="flex items-center gap-2 flex-wrap">
                    {statuses.map((s) => (
                        <button
                            key={s}
                            onClick={() => setFilter(s)}
                            className={cn(
                                "px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize border",
                                filter === s
                                    ? "bg-blue-600 border-blue-600 text-white shadow-sm"
                                    : "bg-white border-slate-200 text-slate-500 hover:text-slate-800 hover:border-slate-300"
                            )}
                        >
                            {s === "all" ? "All Projects" : s}
                        </button>
                    ))}
                </div>
                <button
                    onClick={() => isAdding ? setIsAdding(false) : startAdding()}
                    className={cn(
                        "flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-sm shrink-0",
                        isAdding ? "bg-slate-100 text-slate-600 hover:bg-slate-200" : "bg-blue-600 text-white hover:bg-blue-700"
                    )}
                >
                    {isAdding ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    {isAdding ? "Cancel" : "New Project"}
                </button>
            </div>

            {isAdding && (
                <div className="glass-card p-6 bg-slate-50/50 border-blue-200 animate-fadeInUp">
                    <form onSubmit={handleSubmit} className="space-y-4 max-w-4xl mx-auto">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                                    Project Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    required
                                    value={formData.project_name}
                                    onChange={(e) => setFormData({ ...formData, project_name: e.target.value })}
                                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 shadow-sm"
                                    placeholder="Internal Dashboard V2"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                                    Customer / Team <span className="text-red-500">*</span>
                                </label>
                                <input
                                    required
                                    value={formData.customer}
                                    onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
                                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 shadow-sm"
                                    placeholder="Global Logistics"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Delivery Status</label>
                                <select
                                    value={formData.delivery_status}
                                    onChange={(e) => setFormData({ ...formData, delivery_status: e.target.value as any })}
                                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 shadow-sm"
                                >
                                    <option value="On Track">On Track</option>
                                    <option value="At Risk">At Risk</option>
                                    <option value="Critical">Critical</option>
                                    <option value="Completed">Completed</option>
                                </select>
                            </div>
                            {formData.delivery_status !== "On Track" && formData.delivery_status !== "Completed" ? (
                                <div className="animate-fadeIn">
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Risk Level</label>
                                    <select
                                        value={formData.risk_level}
                                        onChange={(e) => setFormData({ ...formData, risk_level: e.target.value as any })}
                                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 shadow-sm"
                                    >
                                        <option value="Low">Low</option>
                                        <option value="Medium">Medium</option>
                                        <option value="High">High</option>
                                    </select>
                                </div>
                            ) : (
                                <div />
                            )}
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Milestone %</label>
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={formData.milestone_progress}
                                    onChange={(e) => setFormData({ ...formData, milestone_progress: parseInt(e.target.value) })}
                                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 shadow-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Headcount</label>
                                <input
                                    type="number"
                                    step="any"
                                    value={formData.headcount}
                                    onChange={(e) => setFormData({ ...formData, headcount: parseFloat(e.target.value) || 0 })}
                                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 shadow-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Effort (MM)</label>
                                <input
                                    type="number"
                                    step="any"
                                    value={formData.effort}
                                    onChange={(e) => {
                                        const effort = parseFloat(e.target.value) || 0;
                                        setFormData({ ...formData, effort, nbr: effort - formData.billable });
                                    }}
                                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 shadow-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Billable (P)</label>
                                <input
                                    type="number"
                                    step="any"
                                    value={formData.billable}
                                    onChange={(e) => {
                                        const billable = parseFloat(e.target.value) || 0;
                                        setFormData({ ...formData, billable, nbr: formData.effort - billable });
                                    }}
                                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 shadow-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 opacity-50">Non-Billable</label>
                                <div className="w-full bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-500 font-bold h-[38px] flex items-center shadow-inner">
                                    {parseFloat((formData.effort - formData.billable).toFixed(2))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Due Date</label>
                                <input
                                    type="date"
                                    value={formData.end_date}
                                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 shadow-sm"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Parent Project (Optional)</label>
                                <select
                                    value={formData.parent_id}
                                    onChange={(e) => setFormData({ ...formData, parent_id: e.target.value })}
                                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 shadow-sm"
                                >
                                    <option value="">-- Parent Project --</option>
                                    {projects
                                        .filter(p => !p.parent_id && p.project_id !== editingId)
                                        .map(p => (
                                            <option key={p.project_id} value={p.project_id}>
                                                {p.project_name} ({p.customer})
                                            </option>
                                        ))
                                    }
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Tech Stack (comma separated)</label>
                            <input
                                value={formData.tech_stack}
                                onChange={(e) => setFormData({ ...formData, tech_stack: e.target.value })}
                                placeholder="React, Python, AWS..."
                                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 shadow-sm"
                            />
                        </div>
                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
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
                                {editingId ? "Update Project" : "Create Project"}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Project cards grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filtered.map((proj) => (
                    <div
                        key={proj.project_id}
                        className={cn(
                            "glass-card p-5 hover:border-blue-600/30 transition-all group relative",
                            proj.delivery_status === "Critical" && "border-red-500/30 bg-red-50/10",
                            proj.delivery_status === "At Risk" && "border-amber-500/30 bg-amber-50/10"
                        )}
                    >
                        {/* Actions buttons */}
                        <div className="absolute top-4 right-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={() => startEditing(proj)}
                                className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-blue-600 hover:border-blue-200 shadow-sm transition-all"
                                title="Edit"
                            >
                                <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                                onClick={() => handleDelete(proj.project_id, proj.project_name)}
                                className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-200 shadow-sm transition-all"
                                title="Delete"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                            </button>
                        </div>

                        {/* Header */}
                        <div className="flex items-start justify-between mb-4">
                            <div className="max-w-[70%]">
                                <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors flex items-center gap-1.5">
                                    {proj.parent_id && <CornerDownRight className="w-3.5 h-3.5 text-slate-300" />}
                                    {proj.project_name}
                                </h3>
                                <p className="text-xs font-medium text-slate-400 mt-0.5 flex items-center gap-1">
                                    {proj.customer}
                                    {proj.parent_id && (
                                        <>
                                            <span className="text-slate-200">|</span>
                                            <span className="text-[10px] font-bold text-blue-500">
                                                Part of: {projects.find(p => p.project_id === proj.parent_id)?.project_name}
                                            </span>
                                        </>
                                    )}
                                </p>
                            </div>
                            <div className="flex flex-col items-end gap-1.5 shrink-0">
                                <StatusBadge status={proj.delivery_status} size="sm" />
                            </div>
                        </div>

                        {/* Milestone Progress */}
                        <div className="mb-4 bg-slate-50/50 p-3 rounded-lg border border-slate-100">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Milestone Progress</span>
                                <span className={cn(
                                    "text-xs font-bold px-2 py-0.5 rounded-full bg-white border shadow-xs",
                                    proj.milestone_progress >= 80 ? "text-emerald-600 border-emerald-100" : "text-blue-600 border-blue-100"
                                )}>{proj.milestone_progress}%</span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                                <div
                                    className={cn(
                                        "h-full transition-all duration-1000",
                                        proj.milestone_progress >= 80 ? "bg-emerald-500" :
                                            proj.milestone_progress >= 50 ? "bg-blue-600" :
                                                proj.milestone_progress >= 30 ? "bg-amber-500" : "bg-red-500"
                                    )}
                                    style={{ width: `${proj.milestone_progress}%` }}
                                />
                            </div>
                        </div>

                        {/* Meta */}
                        <div className="grid grid-cols-2 gap-3 mb-4 px-1">
                            <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center">
                                    <Users className="w-3.5 h-3.5 text-blue-600" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">HC / Eff</span>
                                    <span className="text-xs font-bold text-slate-700">{proj.headcount} / {proj.effort}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                                    <Target className="w-3.5 h-3.5 text-emerald-600" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">Bil / NBR</span>
                                    <span className="text-xs font-bold text-slate-700">{proj.billable} / {proj.nbr}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center">
                                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">Due Date</span>
                                    <span className="text-xs font-bold text-slate-700">{new Date(proj.end_date).toLocaleDateString()}</span>
                                </div>
                            </div>
                            {proj.delivery_status !== "On Track" && proj.delivery_status !== "Completed" && (
                                <div className="flex items-center gap-2">
                                    <div className={cn(
                                        "w-7 h-7 rounded-lg flex items-center justify-center border",
                                        proj.risk_level === "Low" ? "bg-slate-50 border-slate-100" : "bg-red-50 border-red-100"
                                    )}>
                                        <AlertTriangle className={cn("w-3.5 h-3.5", proj.risk_level === "Low" ? "text-slate-400" : "text-red-500")} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">Risk</span>
                                        <span className={cn("text-xs font-bold", proj.risk_level === "Low" ? "text-slate-700" : "text-red-600")}>{proj.risk_level}</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Tech Stack */}
                        <div className="flex flex-wrap gap-1.5 pt-3 border-t border-slate-100">
                            {proj.tech_stack.map((tech) => (
                                <span key={tech} className="text-[9px] font-bold bg-white text-slate-600 border border-slate-200 px-2 py-0.5 rounded transition-colors hover:bg-slate-50">
                                    {tech}
                                </span>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {filtered.length === 0 && (
                <div className="glass-card p-20 text-center bg-slate-50/50">
                    <Monitor className="w-10 h-10 text-slate-200 mx-auto mb-4" />
                    <p className="text-slate-500 text-sm font-medium">No projects found matching the criteria.</p>
                </div>
            )}
        </div>
    );
}
