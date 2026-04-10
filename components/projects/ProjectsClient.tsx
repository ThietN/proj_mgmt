"use client";
import { Project } from "@/types";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useState } from "react";
import {
    Users,
    Calendar,
    Rocket,
    Plus,
    X,
    Check,
    Trash2,
    Edit2,
    AlertTriangle,
    Briefcase,
    Search,
    ChevronDown,
    Layers,
    Target,
    CornerDownRight,
    ArrowRight,
    TrendingUp,
    UserCheck,
    Shield
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";


interface ProjectsClientProps {
    initialData: Project[];
    resources?: any[];
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

const normalizeTechStack = (techStack: Project["tech_stack"] | string | null | undefined) => {
    if (Array.isArray(techStack)) {
        return techStack;
    }

    if (typeof techStack === "string" && techStack.trim()) {
        return techStack.split(",").map((t) => t.trim()).filter(Boolean);
    }

    return [];
};

export function ProjectsClient({ initialData, resources = [] }: ProjectsClientProps) {
    const router = useRouter();
    const [projects, setProjects] = useState<Project[]>(initialData.map(p => ({
        ...p,
        headcount: p.headcount || 0,
        effort: p.effort || 0,
        billable: p.billable || 0,
        nbr: p.nbr || 0,
        tech_stack: normalizeTechStack(p.tech_stack as Project["tech_stack"] | string | null | undefined)
    }))); 
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState(DEFAULT_FORM);
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    // Hierarchical sort: Parent first, then its children
    const sortedProjects = [...projects].sort((a, b) => {
        const idA = a.parent_id || a.project_id;
        const idB = b.parent_id || b.project_id;
        if (idA === idB) {
            return a.parent_id ? 1 : -1;
        }
        return idA.localeCompare(idB);
    });

    const filtered = (sortedProjects || []).filter(p => {
        if (!p || typeof p.project_name === 'undefined' || typeof p.customer === 'undefined') return false;
        return (
            p.project_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.customer.toLowerCase().includes(searchQuery.toLowerCase())
        );
    });

    const startAdding = () => {
        setFormData({ ...DEFAULT_FORM, project_id: `P${1000 + projects.length + 1}` });
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
            tech_stack: normalizeTechStack(p.tech_stack).join(", "),
            parent_id: p.parent_id || ""
        });
        setEditingId(p.project_id);
        setIsAdding(true);
    };


    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setIsLoading(true);
        setErrorMsg(null);
        try {
            const method = editingId ? "PUT" : "POST";
            const techStackArray = formData.tech_stack
                .split(",")
                .map(t => t.trim())
                .filter(Boolean);
            const payload = {
                ...formData,
                tech_stack: techStackArray,
                nbr: formData.effort - formData.billable
            };
            const res = await fetch("/api/projects", {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (res.ok) {
                if (editingId) {
                    const updatedProject: Project = {
                        project_id: formData.project_id,
                        project_name: formData.project_name,
                        customer: formData.customer,
                        headcount: formData.headcount,
                        effort: formData.effort,
                        billable: formData.billable,
                        nbr: formData.effort - formData.billable,
                        delivery_status: formData.delivery_status,
                        risk_level: formData.risk_level,
                        milestone_progress: formData.milestone_progress,
                        start_date: formData.start_date,
                        end_date: formData.end_date,
                        tech_stack: techStackArray,
                        parent_id: formData.parent_id || undefined
                    };
                    setProjects(prev => prev.map(p => p.project_id === editingId ? updatedProject : p));
                    toast.success("Project updated successfully!");
                } else {
                    const newProject: Project = {
                        ...data.project,
                        tech_stack: normalizeTechStack(data.project?.tech_stack),
                        nbr: (data.project?.effort || 0) - (data.project?.billable || 0)
                    };
                    setProjects(prev => [...prev, newProject]);
                    toast.success("New project registered!");
                }
                setIsAdding(false);
                setFormData(DEFAULT_FORM);
                setEditingId(null);
                router.refresh();
            } else {
                setErrorMsg(data?.error || "Failed to save project.");
                toast.error(data?.error || "Failed to save project.");
            }
        } catch (err: any) {
            setErrorMsg(err?.message || "Network error.");
            toast.error(err?.message || "An error occurred");
        }
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
                toast.success("Project deleted.");
                router.refresh();
            } else {
                toast.error("Failed to delete project.");
            }
        } catch (err: any) {
            toast.error(err?.message || "An error occurred");
        }
    }

    return (
        <div className="space-y-4">
            {/* Action Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-card p-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search projects or customers..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 transition-all font-medium"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <button
                    onClick={startAdding}
                    className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-95 shrink-0"
                >
                    <Plus className="w-4 h-4" />
                    New Project
                </button>
            </div>

            {isAdding && (
                <div className="glass-card p-6 border-blue-200 bg-white animate-fadeIn">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-100 shadow-sm">
                                <Briefcase className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <h2 className="text-base font-bold text-slate-900">{editingId ? 'Edit Project' : 'Register New Project'}</h2>
                                <p className="text-xs text-slate-500">Form to {editingId ? 'update project details' : 'onboard a new project'}</p>
                            </div>
                        </div>
                        <button onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="lg:col-span-2">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                                    Project Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    required
                                    value={formData.project_name}
                                    onChange={(e) => setFormData({ ...formData, project_name: e.target.value })}
                                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 shadow-sm transition-all"
                                    placeholder="e.g. NextGen AI Platform"
                                />
                            </div>
                            <div className="lg:col-span-2">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                                    Customer <span className="text-red-500">*</span>
                                </label>
                                <input
                                    required
                                    value={formData.customer}
                                    onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
                                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 shadow-sm transition-all"
                                    placeholder="e.g. TechCorp"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Delivery Status</label>
                                <select
                                    value={formData.delivery_status}
                                    onChange={(e) => setFormData({ ...formData, delivery_status: e.target.value as any })}
                                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 shadow-sm"
                                >
                                    <option value="On Track">On Track</option>
                                    <option value="At Risk">At Risk</option>
                                    <option value="Critical">Critical</option>
                                    <option value="Completed">Completed</option>
                                </select>
                            </div>
                            {(formData.delivery_status !== "On Track" && formData.delivery_status !== "Completed") ? (
                                <div className="animate-fadeIn">
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Risk Level</label>
                                    <select
                                        value={formData.risk_level}
                                        onChange={(e) => setFormData({ ...formData, risk_level: e.target.value as any })}
                                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 shadow-sm"
                                    >
                                        <option value="Low">Low</option>
                                        <option value="Medium">Medium</option>
                                        <option value="High">High</option>
                                    </select>
                                </div>
                            ) : (
                                <div /> /* Spacer to maintain grid */
                            )}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Headcount</label>
                                <input
                                    type="number"
                                    step="any"
                                    required
                                    value={formData.headcount}
                                    onChange={(e) => setFormData({ ...formData, headcount: parseFloat(e.target.value) || 0 })}
                                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 shadow-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Effort</label>
                                <input
                                    type="number"
                                    step="any"
                                    required
                                    value={formData.effort}
                                    onChange={(e) => {
                                        const effort = parseFloat(e.target.value) || 0;
                                        setFormData({ ...formData, effort, nbr: effort - formData.billable });
                                    }}
                                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 shadow-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Billable</label>
                                <input
                                    type="number"
                                    step="any"
                                    required
                                    value={formData.billable}
                                    onChange={(e) => {
                                        const billable = parseFloat(e.target.value) || 0;
                                        setFormData({ ...formData, billable, nbr: formData.effort - billable });
                                    }}
                                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 shadow-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 opacity-50">Non-Billable</label>
                                <div className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-500 font-bold shadow-sm h-[42px] flex items-center">
                                    {parseFloat((formData.effort - formData.billable).toFixed(2))}
                                </div>
                            </div>
                            <div className="lg:col-span-2">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Milestone Progress (%)</label>
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    required
                                    value={formData.milestone_progress}
                                    onChange={(e) => setFormData({ ...formData, milestone_progress: parseInt(e.target.value) })}
                                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 shadow-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Start Date</label>
                                <input
                                    type="date"
                                    required
                                    value={formData.start_date}
                                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 shadow-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">End Date (Target)</label>
                                <input
                                    type="date"
                                    required
                                    value={formData.end_date}
                                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 shadow-sm"
                                />
                            </div>
                            <div className="md:col-span-2 lg:col-span-1">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Tech Stack (comma separated)</label>
                                <input
                                    value={formData.tech_stack}
                                    onChange={(e) => setFormData({ ...formData, tech_stack: e.target.value })}
                                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 shadow-sm"
                                    placeholder="Next.js, Python, PostgreSQL..."
                                />
                            </div>
                            <div className="md:col-span-2 lg:col-span-2">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Parent Project (Optional)</label>
                                <select
                                    value={formData.parent_id}
                                    onChange={(e) => setFormData({ ...formData, parent_id: e.target.value })}
                                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 shadow-sm"
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

                        {errorMsg && (
                            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 font-medium flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4 shrink-0" />
                                {errorMsg}
                            </div>
                        )}
                        <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                            <button
                                type="button"
                                onClick={() => { setIsAdding(false); setErrorMsg(null); }}
                                className="px-6 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="flex items-center gap-2 bg-blue-600 text-white px-8 py-2.5 rounded-lg text-sm font-bold hover:bg-blue-700 disabled:opacity-50 shadow-lg shadow-blue-600/20 active:scale-95 transition-all"
                            >
                                {isLoading ? (
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <Check className="w-4 h-4" />
                                )}
                                {editingId ? "Update Project" : "Save Project"}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Projects Table */}
            <div className="glass-card overflow-hidden bg-white border-slate-200">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-200">
                                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Project & Client</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">HC</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Eff.</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Billable</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center whitespace-nowrap">Non-Billable</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Tech Stack</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Timeline</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Progress</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Status / Risk</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filtered.map((proj) => (
                                <tr key={proj.project_id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-start gap-2">
                                            {proj.parent_id && (
                                                <CornerDownRight className="w-4 h-4 text-slate-300 mt-0.5 shrink-0" />
                                            )}
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-1.5">
                                                    <span className={cn(
                                                        "text-sm font-bold transition-colors group-hover:text-blue-600",
                                                        proj.parent_id ? "text-slate-600 font-semibold" : "text-slate-900"
                                                    )}>
                                                        {proj.project_name}
                                                    </span>
                                                    {proj.parent_id && (
                                                        <span className="text-[9px] font-black bg-slate-100 text-slate-400 px-1 rounded uppercase tracking-tighter">Sub</span>
                                                    )}
                                                </div>
                                                <span className="text-[11px] font-medium text-slate-500 mt-0.5">{proj.customer}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 text-center">
                                        <span className="text-sm font-black text-slate-700">{proj.headcount}</span>
                                    </td>
                                    <td className="px-4 py-4 text-center">
                                        <span className="text-sm font-black text-blue-600">{proj.effort}</span>
                                    </td>
                                    <td className="px-4 py-4 text-center">
                                        <span className="text-sm font-black text-emerald-600">{proj.billable}</span>
                                    </td>
                                    <td className="px-4 py-4 text-center">
                                        <span className="text-sm font-black text-slate-400">{proj.nbr}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-1 max-w-[200px] relative group cursor-help" title={proj.tech_stack.join(", ")}>
                                            {proj.tech_stack.slice(0, 3).map((tech, i) => (
                                                <span key={i} className="text-[9px] font-bold px-2 py-0.5 bg-blue-50/50 text-blue-700 rounded-full border border-blue-100 whitespace-nowrap uppercase tracking-tighter">
                                                    {tech}
                                                </span>
                                            ))}
                                            {proj.tech_stack.length > 3 && (
                                                <div className="relative">
                                                    <span className="text-[9px] font-black bg-slate-100 text-slate-500 border border-slate-200 px-1.5 py-0.5 rounded-full">+{proj.tech_stack.length - 3}</span>
                                                    {/* Tooltip */}
                                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-40 p-2 bg-white/95 backdrop-blur-md border border-slate-200 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                                                        <p className="text-[10px] font-black text-slate-400 uppercase mb-1 border-b border-slate-100 pb-1">Tech Stack</p>
                                                        <div className="flex flex-wrap gap-1">
                                                            {proj.tech_stack.map(t => (
                                                                <span key={t} className="text-[9px] font-bold bg-slate-50 text-slate-600 px-1.5 py-0.5 rounded border border-slate-100">
                                                                    {t}
                                                                </span>
                                                            ))}
                                                        </div>
                                                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-white/95" />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col items-center justify-center text-center">
                                            <span className="text-[11px] font-bold text-slate-700">{new Date(proj.start_date).toLocaleDateString([], { month: 'short', year: '2-digit' })}</span>
                                            <div className="w-0.5 h-3 bg-slate-200 my-0.5" />
                                            <span className="text-[11px] font-extrabold text-blue-600">{new Date(proj.end_date).toLocaleDateString([], { month: 'short', year: '2-digit' })}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 min-w-[150px]">
                                        <div className="flex flex-col gap-1.5">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[11px] font-bold text-slate-500">{proj.milestone_progress}%</span>
                                            </div>
                                            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden border border-slate-200">
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
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1">
                                            <StatusBadge status={proj.delivery_status} size="sm" />
                                            {proj.delivery_status !== "On Track" && proj.delivery_status !== "Completed" && (
                                                <div className={cn(
                                                    "text-[9px] font-black uppercase px-2 py-0.5 rounded-full w-fit border",
                                                    proj.risk_level === "Low" ? "bg-slate-50 text-slate-500 border-slate-200" :
                                                        proj.risk_level === "Medium" ? "bg-amber-50 text-amber-600 border-amber-200" :
                                                            "bg-red-50 text-red-600 border-red-200"
                                                )}>
                                                    {proj.risk_level} Risk
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => startEditing(proj)}
                                                className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-blue-600 hover:border-blue-200 shadow-sm transition-all"
                                            >
                                                <Edit2 className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(proj.project_id, proj.project_name)}
                                                className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-red-500 hover:border-red-200 shadow-sm transition-all"
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
                    <div className="p-20 text-center bg-slate-50/30">
                        <Layers className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                        <h3 className="text-slate-900 font-bold mb-1">No Projects Found</h3>
                        <p className="text-slate-400 text-xs">Try adjusting your search or add a new project to the list.</p>
                    </div>
                )}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="glass-card p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
                            <Target className="w-4 h-4 text-white" />
                        </div>
                        <div>
                            <div className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Active Stack</div>
                            <div className="text-lg font-black text-slate-900 leading-none mt-0.5">
                                {Array.from(new Set(projects.flatMap(p => p ? normalizeTechStack(p.tech_stack) : []))).length}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
