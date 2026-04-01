"use client";
import { useState } from "react";
import { Survey, SurveyStatus, QuestionType } from "@/types";
import { useRouter } from "next/navigation";
import { Plus, X, Check, Trash2, Edit2, ClipboardList, Users, CheckCircle, Clock } from "lucide-react";

interface SurveysClientProps {
    surveys: Survey[];
}

const STATUSES: SurveyStatus[] = ["Draft", "Scheduled", "Active", "Closed"];
const STATUS_COLORS: Record<SurveyStatus, string> = {
    Draft: "bg-slate-100 text-slate-700",
    Scheduled: "bg-blue-100 text-blue-700",
    Active: "bg-emerald-100 text-emerald-700",
    Closed: "bg-red-100 text-red-700",
};
const QUESTION_TYPES: { value: QuestionType; label: string }[] = [
    { value: "multiple_choice", label: "Multiple Choice" },
    { value: "rating", label: "Rating (1-5)" },
    { value: "nps", label: "NPS (0-10)" },
    { value: "text", label: "Open Text" },
    { value: "checkbox", label: "Checkboxes" },
];

const DEFAULT_FORM = {
    title: "",
    description: "",
    status: "Draft" as SurveyStatus,
    is_anonymous: true,
    audience: "All",
    start_date: "",
    end_date: "",
    questions: [{ id: "1", order_index: 0, type: "text" as QuestionType, question: "", required: true, options: [] as string[] }],
};

export default function SurveysClient({ surveys: initialSurveys }: SurveysClientProps) {
    const router = useRouter();
    const [surveys, setSurveys] = useState<Survey[]>(initialSurveys);
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState(DEFAULT_FORM);
    const [isLoading, setIsLoading] = useState(false);
    const [filterStatus, setFilterStatus] = useState<SurveyStatus | "All">("All");

    const filtered = filterStatus === "All" ? surveys : surveys.filter(s => s.status === filterStatus);

    const kpis = {
        total: surveys.length,
        active: surveys.filter(s => s.status === "Active").length,
        totalResponses: surveys.reduce((sum, s) => sum + (s.response_count || 0), 0),
        closed: surveys.filter(s => s.status === "Closed").length,
    };

    const startAdding = () => { setFormData({ ...DEFAULT_FORM }); setEditingId(null); setIsAdding(true); };
    const startEditing = (s: Survey) => {
        setFormData({
            title: s.title,
            description: s.description || "",
            status: s.status,
            is_anonymous: s.is_anonymous,
            audience: s.audience,
            start_date: s.start_date || "",
            end_date: s.end_date || "",
            questions: s.questions.map(q => ({ ...q, options: q.options || [] })),
        });
        setEditingId(s.id);
        setIsAdding(true);
    };
    const cancelForm = () => { setIsAdding(false); setEditingId(null); setFormData({ ...DEFAULT_FORM }); };

    const addQuestion = () => {
        setFormData(prev => ({
            ...prev,
            questions: [...prev.questions, {
                id: String(Date.now()),
                order_index: prev.questions.length,
                type: "text" as QuestionType,
                question: "",
                required: false,
                options: [],
            }],
        }));
    };

    const removeQuestion = (idx: number) => {
        setFormData(prev => ({ ...prev, questions: prev.questions.filter((_, i) => i !== idx) }));
    };

    const updateQuestion = (idx: number, field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            questions: prev.questions.map((q, i) => i === idx ? { ...q, [field]: value } : q),
        }));
    };

    const handleSave = async () => {
        if (!formData.title.trim()) return;
        setIsLoading(true);
        try {
            const payload = {
                title: formData.title,
                description: formData.description,
                questions: formData.questions,
                status: formData.status,
                is_anonymous: formData.is_anonymous,
                audience: formData.audience,
                start_date: formData.start_date,
                end_date: formData.end_date,
                ...(editingId ? { id: editingId } : {}),
            };
            const res = await fetch("/api/surveys", {
                method: editingId ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            if (!res.ok) { const e = await res.json(); throw new Error(e.error || "Save failed"); }
            cancelForm();
            const updated = await fetch("/api/surveys").then(r => r.json());
            if (updated.surveys) setSurveys(updated.surveys);
            router.refresh();
        } catch (err: any) {
            alert("Error saving survey: " + err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this survey?")) return;
        setIsLoading(true);
        try {
            await fetch(`/api/surveys?id=${id}`, { method: "DELETE" });
            setSurveys(prev => prev.filter(s => s.id !== id));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Surveys</h1>
                    <p className="text-slate-400 text-sm mt-1">Create and manage employee surveys</p>
                </div>
                <button onClick={startAdding} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg transition-colors">
                    <Plus size={16} /> New Survey
                </button>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: "Total Surveys", value: kpis.total, icon: ClipboardList, color: "text-blue-400" },
                    { label: "Active", value: kpis.active, icon: CheckCircle, color: "text-emerald-400" },
                    { label: "Total Responses", value: kpis.totalResponses, icon: Users, color: "text-violet-400" },
                    { label: "Closed", value: kpis.closed, icon: Clock, color: "text-rose-400" },
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

            {/* Filter */}
            <div className="flex gap-2">
                {(["All", ...STATUSES] as const).map(s => (
                    <button key={s} onClick={() => setFilterStatus(s as any)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filterStatus === s ? "bg-blue-600 text-white" : "bg-white/5 text-slate-400 hover:bg-white/10"}`}>
                        {s}
                    </button>
                ))}
            </div>

            {/* Form */}
            {isAdding && (
                <div className="glass-card p-6 space-y-4 border border-blue-200">
                    <div className="flex items-center justify-between">
                        <h2 className="text-slate-800 font-semibold">{editingId ? "Edit Survey" : "New Survey"}</h2>
                        <button onClick={cancelForm}><X size={18} className="text-slate-400 hover:text-slate-700" /></button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-xs text-slate-600 font-medium mb-1">Title *</label>
                            <input value={formData.title} onChange={e => setFormData(p => ({ ...p, title: e.target.value }))}
                                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" placeholder="Survey title" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-xs text-slate-600 font-medium mb-1">Description</label>
                            <textarea value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
                                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-sm focus:outline-none focus:border-blue-500 resize-none h-20" placeholder="Survey description" />
                        </div>
                        <div>
                            <label className="block text-xs text-slate-600 font-medium mb-1">Status</label>
                            <select value={formData.status} onChange={e => setFormData(p => ({ ...p, status: e.target.value as SurveyStatus }))}
                                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-sm focus:outline-none focus:border-blue-500">
                                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs text-slate-600 font-medium mb-1">Audience</label>
                            <select value={formData.audience} onChange={e => setFormData(p => ({ ...p, audience: e.target.value }))}
                                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-sm focus:outline-none focus:border-blue-500">
                                {["All", "Department", "Team", "Role"].map(a => <option key={a} value={a}>{a}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs text-slate-600 font-medium mb-1">Start Date</label>
                            <input type="date" value={formData.start_date} onChange={e => setFormData(p => ({ ...p, start_date: e.target.value }))}
                                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-sm focus:outline-none focus:border-blue-500" />
                        </div>
                        <div>
                            <label className="block text-xs text-slate-600 font-medium mb-1">End Date</label>
                            <input type="date" value={formData.end_date} onChange={e => setFormData(p => ({ ...p, end_date: e.target.value }))}
                                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-sm focus:outline-none focus:border-blue-500" />
                        </div>
                        <div className="flex items-center gap-2">
                            <input type="checkbox" id="survey_anon" checked={formData.is_anonymous} onChange={e => setFormData(p => ({ ...p, is_anonymous: e.target.checked }))} className="accent-blue-500" />
                            <label htmlFor="survey_anon" className="text-sm text-slate-700">Anonymous responses</label>
                        </div>
                    </div>

                    {/* Questions */}
                    <div>
                        <label className="block text-xs text-slate-600 font-medium mb-2">Questions</label>
                        <div className="space-y-3">
                            {formData.questions.map((q, idx) => (
                                <div key={q.id} className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-2">
                                    <div className="flex gap-2 items-center">
                                        <span className="text-xs text-slate-500 w-5">{idx + 1}.</span>
                                        <input value={q.question} onChange={e => updateQuestion(idx, "question", e.target.value)}
                                            className="flex-1 bg-white text-slate-900 text-sm border border-slate-300 rounded px-2 py-1 focus:outline-none focus:border-blue-500" placeholder="Question text" />
                                        <select value={q.type} onChange={e => updateQuestion(idx, "type", e.target.value)}
                                            className="bg-white border border-slate-300 rounded px-2 py-1 text-xs text-slate-700 focus:outline-none">
                                            {QUESTION_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                        </select>
                                        {formData.questions.length > 1 && (
                                            <button onClick={() => removeQuestion(idx)}><X size={14} className="text-slate-400 hover:text-red-500" /></button>
                                        )}
                                    </div>
                                    {(q.type === "multiple_choice" || q.type === "checkbox") && (
                                        <div className="pl-5">
                                            <input value={(q.options || []).join(", ")} onChange={e => updateQuestion(idx, "options", e.target.value.split(",").map(s => s.trim()).filter(Boolean))}
                                                className="w-full bg-white text-xs text-slate-700 border border-slate-200 rounded px-2 py-1 focus:outline-none" placeholder="Options (comma separated)" />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                        <button onClick={addQuestion} className="mt-2 text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1">
                            <Plus size={12} /> Add question
                        </button>
                    </div>

                    <div className="flex gap-2 pt-2">
                        <button onClick={handleSave} disabled={isLoading}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm px-4 py-2 rounded-lg transition-colors">
                            <Check size={14} /> {isLoading ? "Saving..." : "Save Survey"}
                        </button>
                        <button onClick={cancelForm} className="text-sm text-slate-500 hover:text-slate-800 px-4 py-2">Cancel</button>
                    </div>
                </div>
            )}

            {/* Survey Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filtered.length === 0 && <div className="col-span-full text-center py-12 text-slate-500">No surveys found.</div>}
                {filtered.map(survey => (
                    <div key={survey.id} className="glass-card p-5 flex flex-col gap-3 hover:border-blue-500/30 transition-colors border border-transparent">
                        <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[survey.status]}`}>{survey.status}</span>
                                <h3 className="text-slate-800 font-semibold mt-1 text-sm">{survey.title}</h3>
                                {survey.description && <p className="text-slate-400 text-xs mt-0.5 line-clamp-2">{survey.description}</p>}
                            </div>
                            <div className="flex gap-1 shrink-0">
                                <button onClick={() => startEditing(survey)} className="p-1.5 rounded hover:bg-white/10"><Edit2 size={13} className="text-slate-400" /></button>
                                <button onClick={() => handleDelete(survey.id)} className="p-1.5 rounded hover:bg-white/10"><Trash2 size={13} className="text-rose-400" /></button>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                            <span className="flex items-center gap-1"><ClipboardList size={11} />{survey.questions.length} questions</span>
                            <span className="flex items-center gap-1"><Users size={11} />{survey.response_count || 0} responses</span>
                            {survey.end_date && <span className="flex items-center gap-1"><Clock size={11} />due {survey.end_date}</span>}
                        </div>
                        {survey.participation_rate !== undefined && (
                            <div>
                                <div className="flex justify-between text-xs text-slate-500 mb-0.5">
                                    <span>Participation</span>
                                    <span>{survey.participation_rate}%</span>
                                </div>
                                <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                    <div className="h-full bg-violet-500 rounded-full" style={{ width: `${survey.participation_rate}%` }} />
                                </div>
                            </div>
                        )}
                        <div className="text-xs text-slate-600">{survey.is_anonymous ? "Anonymous" : "Identified"} · {survey.audience}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}
