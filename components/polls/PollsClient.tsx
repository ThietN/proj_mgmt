"use client";
import { useState } from "react";
import { Poll, PollOption, PollStatus } from "@/types";
import { useRouter } from "next/navigation";
import { Plus, X, Check, Trash2, Edit2, BarChart2, Users, Clock, CheckCircle } from "lucide-react";

interface PollsClientProps {
    polls: Poll[];
}

const STATUSES: PollStatus[] = ["Draft", "Active", "Closed"];
const STATUS_COLORS: Record<PollStatus, string> = {
    Draft: "bg-slate-100 text-slate-700",
    Active: "bg-emerald-100 text-emerald-700",
    Closed: "bg-red-100 text-red-700",
};

const DEFAULT_FORM = {
    title: "",
    question: "",
    options: [{ id: "1", label: "", votes: 0 }, { id: "2", label: "", votes: 0 }],
    status: "Draft" as PollStatus,
    is_anonymous: true,
    audience: "All",
    audience_value: "",
    deadline: "",
};

export default function PollsClient({ polls: initialPolls }: PollsClientProps) {
    const router = useRouter();
    const [polls, setPolls] = useState<Poll[]>(initialPolls);
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState(DEFAULT_FORM);
    const [isLoading, setIsLoading] = useState(false);
    const [filterStatus, setFilterStatus] = useState<PollStatus | "All">("All");
    const [votingPoll, setVotingPoll] = useState<string | null>(null);

    const filtered = filterStatus === "All" ? polls : polls.filter(p => p.status === filterStatus);

    const kpis = {
        total: polls.length,
        active: polls.filter(p => p.status === "Active").length,
        totalVotes: polls.reduce((s, p) => s + (p.total_votes || 0), 0),
        closed: polls.filter(p => p.status === "Closed").length,
    };

    const startAdding = () => {
        setFormData({ ...DEFAULT_FORM });
        setEditingId(null);
        setIsAdding(true);
    };

    const startEditing = (poll: Poll) => {
        setFormData({
            title: poll.title,
            question: poll.question,
            options: poll.options.map(o => ({ ...o })),
            status: poll.status,
            is_anonymous: poll.is_anonymous,
            audience: poll.audience,
            audience_value: poll.audience_value || "",
            deadline: poll.deadline || "",
        });
        setEditingId(poll.id);
        setIsAdding(true);
    };

    const cancelForm = () => {
        setIsAdding(false);
        setEditingId(null);
        setFormData({ ...DEFAULT_FORM });
    };

    const addOption = () => {
        setFormData(prev => ({
            ...prev,
            options: [...prev.options, { id: String(Date.now()), label: "", votes: 0 }],
        }));
    };

    const removeOption = (idx: number) => {
        setFormData(prev => ({
            ...prev,
            options: prev.options.filter((_, i) => i !== idx),
        }));
    };

    const updateOption = (idx: number, label: string) => {
        setFormData(prev => ({
            ...prev,
            options: prev.options.map((o, i) => i === idx ? { ...o, label } : o),
        }));
    };

    const handleSave = async () => {
        if (!formData.title.trim() || !formData.question.trim()) return;
        if (formData.options.filter(o => o.label.trim()).length < 2) return;
        setIsLoading(true);
        try {
            const payload = {
                title: formData.title,
                question: formData.question,
                options: formData.options.filter(o => o.label.trim()),
                status: formData.status,
                is_anonymous: formData.is_anonymous,
                audience: formData.audience,
                audience_value: formData.audience_value,
                deadline: formData.deadline,
                ...(editingId ? { id: editingId } : {}),
            };
            const res = await fetch("/api/polls", {
                method: editingId ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            if (!res.ok) { const e = await res.json(); throw new Error(e.error || "Save failed"); }
            cancelForm();
            const updated = await fetch("/api/polls").then(r => r.json());
            if (updated.polls) setPolls(updated.polls);
            router.refresh();
        } catch (err: any) {
            alert("Error saving poll: " + err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this poll?")) return;
        setIsLoading(true);
        try {
            await fetch(`/api/polls?id=${id}`, { method: "DELETE" });
            setPolls(prev => prev.filter(p => p.id !== id));
        } finally {
            setIsLoading(false);
        }
    };

    const handleVote = async (pollId: string, optionId: string) => {
        setIsLoading(true);
        try {
            await fetch("/api/polls", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: pollId, vote_option_id: optionId }),
            });
            setPolls(prev => prev.map(p => {
                if (p.id !== pollId) return p;
                return {
                    ...p,
                    total_votes: p.total_votes + 1,
                    options: p.options.map(o => o.id === optionId ? { ...o, votes: o.votes + 1 } : o),
                };
            }));
            setVotingPoll(null);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Polls</h1>
                    <p className="text-slate-400 text-sm mt-1">Create and manage employee polls</p>
                </div>
                <button
                    onClick={startAdding}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg transition-colors"
                >
                    <Plus size={16} /> New Poll
                </button>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: "Total Polls", value: kpis.total, icon: BarChart2, color: "text-blue-400" },
                    { label: "Active", value: kpis.active, icon: CheckCircle, color: "text-emerald-400" },
                    { label: "Total Votes", value: kpis.totalVotes, icon: Users, color: "text-violet-400" },
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

            {/* Filter Tabs */}
            <div className="flex gap-2">
                {(["All", "Draft", "Active", "Closed"] as const).map(s => (
                    <button
                        key={s}
                        onClick={() => setFilterStatus(s)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filterStatus === s ? "bg-blue-600 text-white" : "bg-white/5 text-slate-400 hover:bg-white/10"}`}
                    >
                        {s}
                    </button>
                ))}
            </div>

            {/* Add/Edit Form */}
            {isAdding && (
                <div className="glass-card p-6 space-y-4 border border-blue-200">
                    <div className="flex items-center justify-between">
                        <h2 className="text-slate-800 font-semibold">{editingId ? "Edit Poll" : "New Poll"}</h2>
                        <button onClick={cancelForm}><X size={18} className="text-slate-400 hover:text-slate-700" /></button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-xs text-slate-600 font-medium mb-1">Title *</label>
                            <input
                                value={formData.title}
                                onChange={e => setFormData(p => ({ ...p, title: e.target.value }))}
                                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                placeholder="Poll title"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-xs text-slate-600 font-medium mb-1">Question *</label>
                            <input
                                value={formData.question}
                                onChange={e => setFormData(p => ({ ...p, question: e.target.value }))}
                                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                placeholder="What do you want to ask?"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-slate-600 font-medium mb-1">Status</label>
                            <select
                                value={formData.status}
                                onChange={e => setFormData(p => ({ ...p, status: e.target.value as PollStatus }))}
                                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-sm focus:outline-none focus:border-blue-500"
                            >
                                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs text-slate-600 font-medium mb-1">Deadline</label>
                            <input
                                type="date"
                                value={formData.deadline}
                                onChange={e => setFormData(p => ({ ...p, deadline: e.target.value }))}
                                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-sm focus:outline-none focus:border-blue-500"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="poll_anon"
                                checked={formData.is_anonymous}
                                onChange={e => setFormData(p => ({ ...p, is_anonymous: e.target.checked }))}
                                className="accent-blue-500"
                            />
                            <label htmlFor="poll_anon" className="text-sm text-slate-700">Anonymous responses</label>
                        </div>
                    </div>

                    {/* Options */}
                    <div>
                        <label className="block text-xs text-slate-600 font-medium mb-2">Options (minimum 2) *</label>
                        <div className="space-y-2">
                            {formData.options.map((opt, idx) => (
                                <div key={opt.id} className="flex gap-2 items-center">
                                    <input
                                        value={opt.label}
                                        onChange={e => updateOption(idx, e.target.value)}
                                        className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                        placeholder={`Option ${idx + 1}`}
                                    />
                                    {formData.options.length > 2 && (
                                        <button onClick={() => removeOption(idx)}>
                                            <X size={16} className="text-slate-400 hover:text-red-500" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                        <button
                            onClick={addOption}
                            className="mt-2 text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                        >
                            <Plus size={12} /> Add option
                        </button>
                    </div>

                    <div className="flex gap-2 pt-2">
                        <button
                            onClick={handleSave}
                            disabled={isLoading}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm px-4 py-2 rounded-lg transition-colors"
                        >
                            <Check size={14} /> {isLoading ? "Saving..." : "Save Poll"}
                        </button>
                        <button onClick={cancelForm} className="text-sm text-slate-500 hover:text-slate-800 px-4 py-2">
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Polls Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filtered.length === 0 && (
                    <div className="col-span-full text-center py-12 text-slate-500">No polls found.</div>
                )}
                {filtered.map(poll => {
                    const maxVotes = Math.max(...poll.options.map(o => o.votes), 1);
                    const isVoting = votingPoll === poll.id;
                    return (
                        <div key={poll.id} className="glass-card p-5 flex flex-col gap-3 hover:border-blue-500/30 transition-colors border border-transparent">
                            {/* Header row */}
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex-1">
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[poll.status]}`}>
                                        {poll.status}
                                    </span>
                                    <h3 className="text-slate-800 font-semibold mt-1 text-sm leading-snug">{poll.title}</h3>
                                    <p className="text-slate-400 text-xs mt-0.5 line-clamp-2">{poll.question}</p>
                                </div>
                                <div className="flex gap-1 shrink-0">
                                    <button onClick={() => startEditing(poll)} className="p-1.5 rounded hover:bg-white/10">
                                        <Edit2 size={13} className="text-slate-400" />
                                    </button>
                                    <button onClick={() => handleDelete(poll.id)} className="p-1.5 rounded hover:bg-white/10">
                                        <Trash2 size={13} className="text-rose-400" />
                                    </button>
                                </div>
                            </div>

                            {/* Vote bars */}
                            <div className="space-y-1.5">
                                {poll.options.map(opt => {
                                    const pct = poll.total_votes > 0 ? Math.round((opt.votes / poll.total_votes) * 100) : 0;
                                    return (
                                        <div key={opt.id}>
                                            <div className="flex justify-between text-xs text-slate-400 mb-0.5">
                                                <span>{opt.label}</span>
                                                <span>{pct}%</span>
                                            </div>
                                            <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-blue-500 rounded-full transition-all"
                                                    style={{ width: `${pct}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Footer */}
                            <div className="flex items-center justify-between pt-1">
                                <span className="text-xs text-slate-500">
                                    <Users size={11} className="inline mr-1" />
                                    {poll.total_votes} votes
                                    {poll.is_anonymous && <span className="ml-2 text-slate-600">· anonymous</span>}
                                    {poll.deadline && <span className="ml-2">· due {poll.deadline}</span>}
                                </span>
                                {poll.status === "Active" && (
                                    isVoting ? (
                                        <div className="flex gap-1">
                                            {poll.options.map(opt => (
                                                <button
                                                    key={opt.id}
                                                    onClick={() => handleVote(poll.id, opt.id)}
                                                    className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded transition-colors truncate max-w-[80px]"
                                                >
                                                    {opt.label}
                                                </button>
                                            ))}
                                            <button onClick={() => setVotingPoll(null)} className="text-xs text-slate-500 hover:text-white px-1">✕</button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => setVotingPoll(poll.id)}
                                            className="text-xs bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 px-3 py-1 rounded-lg transition-colors"
                                        >
                                            Vote
                                        </button>
                                    )
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
