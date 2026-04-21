"use client";
import { Intern, InternStatus } from "@/types";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
    Plus, Search, Filter, MoreVertical, Edit2, Trash2,
    Calendar, User, Briefcase, GraduationCap, ArrowRight,
    CheckCircle2, Clock, PlayCircle, MessageSquare, X,
    Star, DollarSign, AlertTriangle
} from "lucide-react";
import { useRouter } from "next/navigation";
import { InternEvaluationForm } from "./InternEvaluationForm";
import toast from "react-hot-toast";

interface InternTrackerProps {
    initialData: Intern[];
    resources?: any[];
}

const statusConfig: Record<InternStatus, { color: string, colorHex: string, icon: any, bg: string, text: string }> = {
    Scheduled: { color: "slate", colorHex: "#64748b", icon: Calendar, bg: "bg-slate-50", text: "text-slate-600" },
    Interview: { color: "blue", icon: MessageSquare, colorHex: "#3b82f6", bg: "bg-blue-50", text: "text-blue-600" },
    Joined: { color: "purple", icon: User, colorHex: "#a855f7", bg: "bg-purple-50", text: "text-purple-600" },
    "In Progress": { color: "green", icon: PlayCircle, colorHex: "#22c55e", bg: "bg-green-50", text: "text-green-600" },
    Completed: { color: "red", icon: CheckCircle2, colorHex: "#ef4444", bg: "bg-red-50", text: "text-red-600" }
};

export function InternTracker({ initialData, resources = [] }: InternTrackerProps) {
    const router = useRouter();
    const [interns, setInterns] = useState<Intern[]>(initialData || []);
    const [search, setSearch] = useState("");
    const [tab, setTab] = useState<"active" | "completed">("active");

    // Modals
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingIntern, setEditingIntern] = useState<Intern | null>(null);
    const [evaluatingIntern, setEvaluatingIntern] = useState<Intern | null>(null);
    const [convertingIntern, setConvertingIntern] = useState<Intern | null>(null);

    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<Partial<Intern>>({
        full_name: "",
        email: "",
        role: "",
        project: "",
        mentor: "",
        start_date: "",
        end_date: "",
        university: "",
        gpa: undefined,
        english_score: undefined,
        status: "Scheduled"
    });
    const [filterYear, setFilterYear] = useState<string>("all");
    const [billingRate, setBillingRate] = useState("500");
    const [conversionNote, setConversionNote] = useState("");

    const filtered = interns.filter((i: Intern) => {
        const matchesSearch = i.full_name?.toLowerCase().includes(search.toLowerCase()) ||
            i.email?.toLowerCase().includes(search.toLowerCase()) ||
            i.project?.toLowerCase()?.includes(search.toLowerCase()) ||
            i.university?.toLowerCase()?.includes(search.toLowerCase());
        const matchesTab = tab === "active" ? i.status !== "Completed" : i.status === "Completed";

        let matchesYear = true;
        if (filterYear !== "all") {
            const year = i.start_date ? new Date(i.start_date).getFullYear().toString() : "";
            matchesYear = year === filterYear;
        }

        return matchesSearch && matchesTab && matchesYear;
    });

    const years = Array.from(new Set((interns || [])
        .map(i => i.start_date ? new Date(i.start_date).getFullYear().toString() : null)
        .filter((y): y is string => y !== null && y !== "NaN")
    )).sort().reverse();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const url = editingIntern ? `/api/interns?id=${editingIntern.id}` : "/api/interns";
            const method = editingIntern ? "PUT" : "POST";
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                toast.success(editingIntern ? "Intern record updated" : "Intern onboarding successful");
                setIsModalOpen(false);
                setEditingIntern(null);
                const fresh = await fetch("/api/interns").then(r => r.json());
                setInterns(fresh);
                router.refresh();
            } else {
                toast.error("Failed to save intern record");
            }
        } catch (err: any) {
            console.error(err);
            toast.error(err?.message || "An error occurred");
        }
        setLoading(false);
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Are you sure you want to purge this record from the system?")) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/interns?id=${id}`, { method: "DELETE" });
            if (res.ok) {
                toast.success("Intern deleted successfully.");
                const fresh = await fetch("/api/interns").then(r => r.json());
                setInterns(fresh);
                router.refresh();
            }
        } catch (err) { console.error(err); }
        setLoading(false);
    };

    const handleConvertToBillable = async () => {
        if (!convertingIntern) return;

        // Frontend defensive check: Ensure evaluation exists
        if (!convertingIntern.evaluation) {
            toast.error("Should evaluate before converting to billable");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("/api/interns/billable", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    intern_id: convertingIntern.id,
                    project: convertingIntern.project || "Internal",
                    billing_rate: 500,
                    notes: conversionNote
                })
            });
            if (res.ok) {
                toast.success(`Success! ${convertingIntern.full_name} is now a billable resource.`);
                const fresh = await fetch("/api/interns").then(r => r.json());
                setInterns(fresh);
                setConvertingIntern(null);
                setConversionNote("");
                router.refresh();
                router.push("/resources");
            } else {
                const errData = await res.json();
                toast.error(`Conversion failed: ${errData.error || 'Server error'}`);
            }
        } catch (err) { console.error(err); }
        setLoading(false);
    };

    const handleEdit = (intern: Intern) => {
        setEditingIntern(intern);
        setFormData({
            full_name: intern.full_name,
            email: intern.email,
            role: intern.role,
            project: intern.project,
            mentor: intern.mentor,
            start_date: intern.start_date,
            end_date: intern.end_date,
            university: intern.university || "",
            gpa: intern.gpa,
            english_score: intern.english_score,
            status: intern.status
        });
        setIsModalOpen(true);
    };

    const getStatusColorClass = (status: InternStatus) => {
        switch (status) {
            case "Scheduled": return "bg-slate-50 border-slate-200 text-slate-600";
            case "Interview": return "bg-blue-50 border-blue-200 text-blue-600";
            case "Joined": return "bg-purple-50 border-purple-200 text-purple-600";
            case "In Progress": return "bg-green-50 border-green-200 text-green-600";
            case "Completed": return "bg-red-50 border-red-200 text-red-600";
            default: return "bg-slate-50";
        }
    };

    const getGradeColor = (grade?: string) => {
        switch (grade) {
            case "Excellent": return "bg-emerald-100 text-emerald-700";
            case "Good": return "bg-blue-100 text-blue-700";
            case "Fair": return "bg-amber-100 text-amber-700";
            case "Average": return "bg-slate-100 text-slate-700";
            case "Poor": return "bg-red-100 text-red-700";
            default: return "bg-slate-50 text-slate-400";
        }
    };

    const calculateProgress = (start?: string, end?: string) => {
        if (!start || !end) return 0;
        const s = new Date(start).getTime();
        const e = new Date(end).getTime();
        const now = new Date().getTime();
        if (now < s) return 0;
        if (now > e) return 100;
        return Math.round(((now - s) / (e - s)) * 100);
    };

    return (
        <div className="space-y-4">
            {/* Control Bar */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between glass-card p-3 bg-white/50 backdrop-blur-md">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-inner">
                        <button
                            onClick={() => setTab("active")}
                            className={cn(
                                "px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all",
                                tab === "active" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            Active Pipeline
                        </button>
                        <button
                            onClick={() => setTab("completed")}
                            className={cn(
                                "px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all",
                                tab === "completed" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            Completed Internships
                        </button>
                    </div>

                    <div className="relative w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search interns or university..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-sm outline-none focus:border-indigo-400 focus:bg-white transition-all shadow-sm"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-slate-400" />
                        <select
                            value={filterYear}
                            onChange={e => setFilterYear(e.target.value)}
                            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold outline-none focus:border-indigo-400 transition-all shadow-sm"
                        >
                            <option value="all">All Years</option>
                            {years.map(y => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <button
                    onClick={() => {
                        setEditingIntern(null);
                        setFormData({
                            full_name: "", email: "", role: "", project: "", mentor: "",
                            start_date: "", end_date: "", university: "", gpa: undefined,
                            english_score: undefined, status: "Scheduled"
                        });
                        setIsModalOpen(true);
                    }}
                    className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-black uppercase tracking-widest hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all active:scale-95"
                >
                    <Plus className="w-4 h-4" /> Add
                </button>
            </div>

            {/* Table Tracker */}
            <div className="glass-card overflow-hidden bg-white/50 border-slate-100 shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Intern Profile</th>
                                <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Academic</th>
                                <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Management</th>
                                <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Enrollment Cycle</th>
                                <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status / Grading</th>
                                <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filtered.length > 0 ? filtered.map((intern) => {
                                const config = statusConfig[intern.status];
                                const StatusIcon = config.icon;

                                return (
                                    <tr key={intern.id} className="group hover:bg-indigo-50/30 transition-all duration-300">
                                        <td className="p-4">
                                            <div className="flex items-center gap-4">
                                                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-base font-black border shadow-sm transition-transform group-hover:scale-110", config.bg, config.text, "border-" + config.color + "-100")}>
                                                    {(intern.full_name || "??").split(" ").filter(Boolean).map(n => n[0]).slice(0, 2).join("")}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-black text-slate-900 leading-tight group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{intern.full_name}</div>
                                                    <div className="flex flex-col gap-0.5 mt-1">
                                                        <div className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                                                            <MessageSquare className="w-2.5 h-2.5" /> {intern.email}
                                                        </div>
                                                        {intern.university && (
                                                            <div className="text-[10px] font-black text-indigo-500 flex items-center gap-1 uppercase tracking-tighter">
                                                                <GraduationCap className="w-3 h-3" /> {intern.university}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="space-y-1.5">
                                                <div className="flex items-center gap-4">
                                                    <div>
                                                        <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">GPA</div>
                                                        <div className="text-xs font-black text-slate-700">{intern.gpa || "--"}</div>
                                                    </div>
                                                    <div className="w-px h-6 bg-slate-100" />
                                                    <div>
                                                        <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">English</div>
                                                        <div className="text-xs font-black text-indigo-600">{intern.english_score ? `${intern.english_score}` : "--"} <span className="text-[8px] text-slate-400">TOEIC</span></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="space-y-1.5">
                                                <div className="flex items-center gap-2">
                                                    <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                                                    <span className="text-xs font-black text-slate-700 uppercase tracking-tight">{intern.project || "No Project"}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                                    <User className="w-3 h-3 text-indigo-400" /> {intern.mentor || "No Mentor"}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="space-y-2">
                                                <div className="text-[10px] font-black text-slate-500 flex items-center gap-2 uppercase tracking-wide">
                                                    <Calendar className="w-3 h-3" />
                                                    <span>{intern.start_date ? new Date(intern.start_date).toLocaleDateString() : "--"}</span>
                                                    <span className="text-slate-300 px-1">/</span>
                                                    <span>{intern.end_date ? new Date(intern.end_date).toLocaleDateString() : "--"}</span>
                                                </div>
                                                <div className="w-full max-w-[120px] bg-slate-200/50 rounded-full h-1.5 overflow-hidden ring-1 ring-slate-100 shadow-inner">
                                                    <div
                                                        className="h-full bg-emerald-500 transition-all duration-1000 shadow-[0_0_8px_rgba(16,185,129,0.3)]"
                                                        style={{ width: `${calculateProgress(intern.start_date, intern.end_date)}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            {tab === "active" ? (
                                                <div className={cn("inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-widest shadow-sm", getStatusColorClass(intern.status))}>
                                                    <StatusIcon className="w-3 h-3" />
                                                    {intern.status}
                                                </div>
                                            ) : (
                                                <div className="flex flex-col gap-1.5">
                                                    <div className={cn("inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-widest shadow-sm", getGradeColor(intern.evaluation?.final_grade))}>
                                                        <Star className="w-3 h-3" />
                                                        {intern.evaluation?.final_grade || "Pending Evaluation"}
                                                    </div>
                                                    {intern.is_billable && (
                                                        <div className="inline-flex items-center gap-1 text-[9px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md w-fit border border-blue-100">
                                                            <DollarSign className="w-2.5 h-2.5" /> Turned Bill
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {tab === "active" ? (
                                                    <>
                                                        <button
                                                            onClick={() => handleEdit(intern)}
                                                            className="p-2.5 bg-white text-slate-400 hover:text-indigo-600 rounded-xl border border-slate-200 hover:border-indigo-200 transition-all shadow-sm hover:shadow-indigo-100"
                                                            title="Edit Profile"
                                                        >
                                                            <Edit2 className="w-3.5 h-3.5" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(intern.id)}
                                                            className="p-2.5 bg-white text-slate-400 hover:text-red-600 rounded-xl border border-slate-200 hover:border-red-200 transition-all shadow-sm"
                                                            title="Delete Record"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                        <button
                                                            className="p-2.5 bg-white text-slate-400 hover:text-indigo-600 rounded-xl border border-slate-200 hover:border-indigo-200 transition-all shadow-sm"
                                                            title="More Options"
                                                        >
                                                            <MoreVertical className="w-3.5 h-3.5" />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => setEvaluatingIntern(intern)}
                                                            className="flex items-center gap-2 px-3 py-2 bg-white text-indigo-600 text-[10px] font-black uppercase tracking-widest rounded-xl border border-slate-200 hover:border-indigo-400 transition-all shadow-sm"
                                                            title="Assess Performance"
                                                        >
                                                            <Star className="w-3.5 h-3.5" /> Evaluation
                                                        </button>
                                                        {!intern.is_billable && (
                                                            <button
                                                                onClick={() => setConvertingIntern(intern)}
                                                                className="flex items-center gap-2 px-3 py-2 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                                                                title="Convert to Employee"
                                                            >
                                                                <DollarSign className="w-3.5 h-3.5" /> Billable
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => handleEdit(intern)}
                                                            className="p-2.5 bg-white text-slate-400 hover:text-indigo-600 rounded-xl border border-slate-200 hover:border-indigo-200 transition-all shadow-sm hover:shadow-indigo-100"
                                                            title="Edit Record"
                                                        >
                                                            <Edit2 className="w-3.5 h-3.5" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(intern.id)}
                                                            className="p-2.5 bg-white text-slate-400 hover:text-red-600 rounded-xl border border-slate-200 hover:border-red-200 transition-all shadow-sm"
                                                            title="Delete Record"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            }) : (
                                <tr>
                                    <td colSpan={6} className="p-24 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center">
                                                <Search className="w-8 h-8 text-slate-200" />
                                            </div>
                                            <p className="text-slate-300 font-black italic uppercase tracking-widest text-xs">
                                                No records discoverable in {tab} view
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal: Add/Edit */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-springIn">
                        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-indigo-50/50">
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">{editingIntern ? "Update Intern" : "New Intern"}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-900 rounded-xl transition-all">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Full Name</label>
                                    <input required value={formData.full_name} onChange={e => setFormData({ ...formData, full_name: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm outline-none focus:border-indigo-400 font-bold" />
                                </div>
                                <div className="col-span-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Email Address</label>
                                    <input required type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm outline-none focus:border-indigo-400 font-bold" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Project Allocation (Optional)</label>
                                    <input value={formData.project} onChange={e => setFormData({ ...formData, project: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm outline-none focus:border-indigo-400" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Assigned Mentor</label>
                                    <select value={formData.mentor} onChange={e => setFormData({ ...formData, mentor: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm outline-none focus:border-indigo-400 font-bold">
                                        <option value="">No Mentor Assigned</option>
                                        {resources.map(res => (
                                            <option key={res.employee_id || res.id || res.name} value={res.name}>{res.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Start Date</label>
                                    <input required type="date" value={formData.start_date} onChange={e => setFormData({ ...formData, start_date: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm outline-none focus:border-indigo-400" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">End Date (Target)</label>
                                    <input required type="date" value={formData.end_date} onChange={e => setFormData({ ...formData, end_date: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm outline-none focus:border-indigo-400" />
                                </div>
                                <div className="col-span-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">University (Optional)</label>
                                    <input value={formData.university} onChange={e => setFormData({ ...formData, university: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm outline-none focus:border-indigo-400" placeholder="e.g. HUST, UEH..." />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">GPA (Optional)</label>
                                    <input type="number" step="0.01" min="0" max="10" value={formData.gpa || ""} onChange={e => setFormData({ ...formData, gpa: parseFloat(e.target.value) || undefined })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm outline-none focus:border-indigo-400" placeholder="e.g. 3.5" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">English Score (TOEIC)</label>
                                    <input type="number" min="0" max="990" value={formData.english_score || ""} onChange={e => setFormData({ ...formData, english_score: parseInt(e.target.value) || undefined })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm outline-none focus:border-indigo-400" placeholder="e.g. 750" />
                                </div>
                                <div className="col-span-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">State</label>
                                    <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value as InternStatus })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm outline-none focus:border-indigo-400 font-bold">
                                        <option value="Scheduled">Scheduled</option>
                                        <option value="Interview">Interview</option>
                                        <option value="Joined">Joined</option>
                                        <option value="In Progress">In Progress</option>
                                        <option value="Completed">Completed</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 text-xs font-black text-slate-500 uppercase tracking-widest hover:bg-slate-100 rounded-xl transition-all">Cancel</button>
                                <button type="submit" disabled={loading} className="flex-1 py-3 bg-indigo-600 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all active:scale-95 disabled:opacity-50">
                                    {loading ? "Processing..." : (editingIntern ? "Update" : "Add")}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Evaluation Modal */}
            {evaluatingIntern && (
                <InternEvaluationForm
                    intern={evaluatingIntern}
                    onClose={() => setEvaluatingIntern(null)}
                    onSuccess={async () => {
                        setEvaluatingIntern(null);
                        const fresh = await fetch("/api/interns").then(r => r.json());
                        setInterns(fresh);
                        router.refresh();
                    }}
                />
            )}

            {/* Conversion Modal */}
            {convertingIntern && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-springIn">
                        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-indigo-50/50">
                            <div>
                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Resourcing Conversion</h3>
                                <p className="text-[10px] text-slate-400 font-bold">Talent: {convertingIntern.full_name}</p>
                            </div>
                            <button onClick={() => setConvertingIntern(null)} className="p-2 text-slate-400 hover:text-slate-900 rounded-xl transition-all">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Notes</label>
                                <textarea
                                    value={conversionNote}
                                    onChange={e => setConversionNote(e.target.value)}
                                    placeholder="Add notes about project allocation, performance highlights, or handover instructions..."
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs outline-none focus:border-indigo-400 min-h-[120px] resize-none"
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => setConvertingIntern(null)}
                                    className="flex-1 py-3 text-xs font-black text-slate-500 uppercase tracking-widest hover:bg-slate-100 rounded-xl transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleConvertToBillable}
                                    disabled={loading || !conversionNote}
                                    className="flex-1 py-3 bg-indigo-600 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-indigo-700 shadow-xl shadow-indigo-200 transition-all active:scale-95 disabled:opacity-50"
                                >
                                    {loading ? "Generating Badge ID..." : "Confirm"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
