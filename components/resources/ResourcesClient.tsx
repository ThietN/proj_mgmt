"use client";
import { useState } from "react";
import { Resource, Project } from "@/types";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Search, Filter, AlertTriangle, Plus, Trash2, X, Check, Edit2, Briefcase, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface ResourcesClientProps {
    initialData: Resource[];
    projects: Project[];
}

const DEFAULT_FORM = {
    employee_id: "",
    name: "",
    role: "",
    team: "",
    grade: "",
    skills: "",
    status: "Billable" as Resource["status"],
    location: "lab3" as Resource["location"],
    notes: "",
    project_id: "",
    is_ramp_up: false
};

export function ResourcesClient({ initialData, projects }: ResourcesClientProps) {
    const router = useRouter();
    const [resources, setResources] = useState<Resource[]>(initialData);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [teamFilter, setTeamFilter] = useState<string>("all");
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<typeof DEFAULT_FORM>(DEFAULT_FORM);
    const [isLoading, setIsLoading] = useState(false);

    const teams = Array.from(new Set((resources || []).filter(r => r && typeof r.team !== 'undefined').map((r) => r.team || "")));

    const filtered = (resources || []).filter((r) => {
        if (!r || typeof r.name === 'undefined') return false;
        const matchesSearch =
            r.name.toLowerCase().includes(search.toLowerCase()) ||
            r.role.toLowerCase().includes(search.toLowerCase()) ||
            r.employee_id.toLowerCase().includes(search.toLowerCase()) ||
            (Array.isArray(r.skills) && r.skills.some((s) => s.toLowerCase().includes(search.toLowerCase())));
        const matchesStatus = statusFilter === "all" || r.status === statusFilter;
        const matchesTeam = teamFilter === "all" || r.team === teamFilter;
        return matchesSearch && matchesStatus && matchesTeam;
    });

    const startAdding = () => {
        setFormData({ ...DEFAULT_FORM, employee_id: "" });
        setEditingId(null);
        setIsAdding(true);
    };

    const startEditing = (r: Resource) => {
        setFormData({
            employee_id: r.employee_id,
            name: r.name,
            role: r.role,
            team: r.team,
            grade: r.grade,
            skills: r.skills.join(", "),
            status: r.status,
            location: r.location,
            notes: r.notes || "",
            project_id: r.project_id || "",
            is_ramp_up: r.is_ramp_up || false
        });
        setEditingId(r.employee_id);
        setIsAdding(true);
    };

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setIsLoading(true);
        try {
            const method = editingId ? "PUT" : "POST";
            const res = await fetch("/api/resources", {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                const data = await res.json();
                if (editingId) {
                    setResources(resources.map(r => r.employee_id === editingId ? { ...r, ...formData, skills: typeof formData.skills === 'string' ? formData.skills.split(',').map(s=>s.trim()).filter(Boolean) : formData.skills } as Resource : r));
                } else {
                    if (data.resource) {
                        setResources([...resources, data.resource]);
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

    async function handleDeleteResource(id: string, name: string) {
        if (!confirm(`Are you sure you want to delete ${name}?`)) return;
        try {
            const res = await fetch(`/api/resources?id=${id}`, {
                method: "DELETE"
            });
            if (res.ok) {
                setResources(resources.filter(r => r.employee_id !== id));
                router.refresh();
            }
        } catch (err) { }
    }

    return (
        <div className="glass-card overflow-hidden">
            {/* Header + Actions */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-white/50">
                <div className="flex items-center gap-4 flex-1">
                    <div className="flex items-center gap-2 flex-1 max-w-sm bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-sm focus-within:border-blue-500 transition-all">
                        <Search className="w-3.5 h-3.5 text-slate-500" />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by ID, name, role..."
                            className="bg-transparent text-sm text-slate-700 placeholder-slate-400 outline-none w-full"
                        />
                    </div>
                </div>
                <button
                    onClick={() => isAdding ? setIsAdding(false) : startAdding()}
                    className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-sm",
                        isAdding ? "bg-slate-100 text-slate-600 hover:bg-slate-200" : "bg-blue-600 text-white hover:bg-blue-700 active:scale-95"
                    )}
                >
                    {isAdding ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    {isAdding ? "Cancel" : "Add Resource"}
                </button>
            </div>

            {isAdding && (
                <div className="p-6 bg-slate-50 border-b border-slate-200 animate-fadeInUp">
                    <form onSubmit={handleSubmit} className="space-y-4 max-w-4xl mx-auto">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                                    Badge ID <span className="text-red-500">*</span>
                                </label>
                                <input
                                    required
                                    value={formData.employee_id}
                                    onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 shadow-sm"
                                    placeholder="E001"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                                    Full Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 shadow-sm"
                                    placeholder="Nguyen Van A"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Role</label>
                                <select
                                    required
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 shadow-sm"
                                >
                                    <option value="">Select Role</option>
                                    <option value="SM">SM</option>
                                    <option value="PM">PM</option>
                                    <option value="TL">TL</option>
                                    <option value="SE">SE</option>
                                    <option value="E">E</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Grade</label>
                                <select
                                    value={formData.grade}
                                    onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 shadow-sm"
                                >
                                    <option value="">Select Grade</option>
                                    {Array.from({ length: 15 }, (_, i) => `L${i + 1}`).map((g) => (
                                        <option key={g} value={g}>{g}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                                    Status <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 shadow-sm"
                                >
                                    <option value="Billable">Billable</option>
                                    <option value="Backup">Backup</option>
                                    <option value="Available">Available</option>
                                    <option value="Maternity Leave">Maternity Leave</option>
                                    <option value="Resigning">Resigning</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                                    Location <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value as any })}
                                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 shadow-sm"
                                >
                                    <option value="lab3">Lab 3</option>
                                    <option value="lab6">Lab 6</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 text-blue-600">Assign to Project</label>
                                <select
                                    value={formData.project_id}
                                    onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
                                    className="w-full bg-white border border-blue-100 rounded-lg px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 shadow-sm font-medium"
                                >
                                    <option value="">-- No Project --</option>
                                    {projects.map(p => (
                                        <option key={p.project_id} value={p.project_id}>
                                            {p.project_name} ({p.customer})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 px-1">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    checked={formData.is_ramp_up}
                                    onChange={(e) => setFormData({ ...formData, is_ramp_up: e.target.checked })}
                                    className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                                />
                                <span className="flex items-center gap-1.5 text-xs font-bold text-slate-600 group-hover:text-emerald-600 transition-colors">
                                    <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                                    Ramp-up (new onboarding — will appear in Weekly Report)
                                </span>
                            </label>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Skills (comma separated)</label>
                                <textarea
                                    value={formData.skills}
                                    onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 shadow-sm min-h-[80px]"
                                    placeholder="React, Next.js, TypeScript"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Notes</label>
                                <textarea
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 shadow-sm min-h-[80px]"
                                    placeholder="Any additional info..."
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
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
                                className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 shadow-md active:scale-95 transition-all"
                            >
                                {isLoading ? (
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <Check className="w-4 h-4" />
                                )}
                                {editingId ? "Update" : "Add"}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Filters */}
            <div className="p-4 border-b border-slate-200 flex flex-wrap gap-3 items-center bg-slate-50/30">
                <div className="flex items-center gap-2">
                    <Filter className="w-3.5 h-3.5 text-slate-500" />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="bg-white border border-slate-200 text-slate-700 text-xs rounded-md px-3 py-1.5 shadow-sm outline-none hover:border-blue-400 transition-colors"
                    >
                        <option value="all">All Status</option>
                        <option value="Billable">Billable</option>
                        <option value="Backup">Backup</option>
                        <option value="Available">Available</option>
                        <option value="Maternity Leave">Maternity Leave</option>
                        <option value="Resigning">Resigning</option>
                    </select>
                    <select
                        value={teamFilter}
                        onChange={(e) => setTeamFilter(e.target.value)}
                        className="bg-white border border-slate-200 text-slate-700 text-xs rounded-md px-3 py-1.5 shadow-sm outline-none hover:border-blue-400 transition-colors"
                    >
                        <option value="all">All Teams</option>
                        {teams.filter(Boolean).map((team) => (
                            <option key={team} value={team}>{team}</option>
                        ))}
                    </select>
                </div>
                <div className="text-[11px] font-medium text-slate-400 ml-auto">
                    Found {filtered.length} engineers
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-200">
                            {[
                                "BadgeID", "Fullname", "Project", "Role", "Grade", "Skills", "Status", "Location", "Notes", "Actions"
                            ].map((h) => (
                                <th key={h} className="text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest px-4 py-3 whitespace-nowrap">
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                        {filtered.map((r) => (
                            <tr key={r.employee_id} className={cn(
                                "hover:bg-blue-50/30 transition-colors group",
                                r.status === "Maternity Leave" && "text-emerald-700 bg-emerald-50 font-medium",
                                r.status === "Resigning" && "text-orange-700 bg-orange-50 font-medium"
                            )}>
                                <td className="px-4 py-3 whitespace-nowrap font-mono text-[11px] opacity-70">
                                    {r.employee_id}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            "w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold border shadow-sm",
                                            r.status === "Maternity Leave" ? "bg-emerald-100 text-emerald-700 border-emerald-200" :
                                                r.status === "Resigning" ? "bg-orange-100 text-orange-700 border-orange-200" :
                                                    "bg-blue-100 text-blue-700 border-blue-200"
                                        )}>
                                            {r.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()}
                                        </div>
                                        <div className="font-semibold">{r.name}</div>
                                    </div>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                    {r.project_id ? (
                                        <div className={cn(
                                            "flex items-center gap-1.5 px-2 py-1 rounded border w-fit",
                                            r.status === "Maternity Leave" ? "bg-emerald-100/50 text-emerald-800 border-emerald-200" :
                                                r.status === "Resigning" ? "bg-orange-100/50 text-orange-800 border-orange-200" :
                                                    "bg-blue-50 text-blue-700 border-blue-100"
                                        )}>
                                            <Briefcase className="w-3 h-3" />
                                            <span className="text-[10px] font-bold uppercase truncate max-w-[120px]">
                                                {projects.find(p => p.project_id === r.project_id)?.project_name || r.project_id}
                                            </span>
                                        </div>
                                    ) : (
                                        <span className="opacity-30 text-[10px] font-medium italic">Unassigned</span>
                                    )}
                                </td>
                                <td className="px-4 py-3 text-xs">
                                    {r.role}
                                </td>
                                <td className="px-4 py-3">
                                    <span className={cn(
                                        "text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase",
                                        r.status === "Maternity Leave" ? "bg-emerald-100/50 text-emerald-700 border-emerald-200" :
                                            r.status === "Resigning" ? "bg-orange-100/50 text-orange-700 border-orange-200" :
                                                "bg-slate-100 text-slate-600 border-slate-200"
                                    )}>
                                        {r.grade}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex flex-wrap gap-1 max-w-[180px]">
                                        {r.skills.slice(0, 3).map((skill) => (
                                            <span key={skill} className={cn(
                                                "text-[9px] font-medium border px-1.5 py-0.5 rounded shadow-sm",
                                                r.status === "Maternity Leave" ? "bg-emerald-100 text-emerald-700 border-emerald-200" :
                                                    r.status === "Resigning" ? "bg-orange-100 text-orange-700 border-orange-200" :
                                                        "bg-blue-50 text-blue-600 border-blue-100"
                                            )}>
                                                {skill}
                                            </span>
                                        ))}
                                        {r.skills.length > 3 && (
                                            <span className="text-[9px] font-medium opacity-50">+{r.skills.length - 3}</span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <StatusBadge status={r.status} size="sm" />
                                </td>
                                <td className="px-4 py-3 text-[10px] font-bold">
                                    <span className={cn(
                                        "px-2 py-0.5 rounded-full border shadow-sm uppercase",
                                        r.status === "Maternity Leave" ? "bg-emerald-100/50 text-emerald-700 border-emerald-200" :
                                            r.status === "Resigning" ? "bg-orange-100/50 text-orange-700 border-orange-200" :
                                                r.location === "lab3" ? "bg-purple-50 text-purple-600 border-purple-100" : "bg-cyan-50 text-cyan-600 border-cyan-100"
                                    )}>
                                        {r.location}
                                    </span>
                                </td>
                                <td className="px-4 py-3 italic text-[11px] max-w-[150px] truncate opacity-80" title={r.notes}>
                                    {r.notes || "-"}
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => startEditing(r)}
                                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                                            title="Modify"
                                        >
                                            <Edit2 className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteResource(r.employee_id, r.name)}
                                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filtered.length === 0 && (
                    <div className="text-center py-16 bg-slate-50/30">
                        <AlertTriangle className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                        <div className="text-slate-500 text-sm font-medium">
                            No match found for your current filters.
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
