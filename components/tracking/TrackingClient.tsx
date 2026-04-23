"use client";
import { TrackingTask, Project, Resource, Innovation, WorkspaceNote, TrackingWorkspace, User } from "@/types";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
    Plus, X, Check, Trash2, Edit2,
    Calendar, Tag, Clock,
    StickyNote, Timer, User as UserIcon, Pencil, FolderPlus, MoreHorizontal
} from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import { RichTextEditor } from "@/components/ui/RichTextEditor";

const COLUMNS = ["Backlog", "To Do", "In Progress", "Review", "Done"] as const;

const COLUMN_COLORS: Record<string, { bg: string; border: string; dot: string; headerBg: string }> = {
    Backlog: { bg: "bg-slate-50/50", border: "border-slate-200", dot: "bg-slate-400", headerBg: "bg-slate-100/80" },
    "To Do": { bg: "bg-blue-50/30", border: "border-blue-200", dot: "bg-blue-500", headerBg: "bg-blue-50/80" },
    "In Progress": { bg: "bg-amber-50/30", border: "border-amber-200", dot: "bg-amber-500", headerBg: "bg-amber-50/80" },
    Review: { bg: "bg-violet-50/30", border: "border-violet-200", dot: "bg-violet-500", headerBg: "bg-violet-50/80" },
    Done: { bg: "bg-emerald-50/30", border: "border-emerald-200", dot: "bg-emerald-500", headerBg: "bg-emerald-50/80" },
};

const PRIORITY_CONFIG: Record<string, { color: string }> = {
    Urgent: { color: "bg-red-100 text-red-700 border-red-200" },
    High: { color: "bg-orange-100 text-orange-700 border-orange-200" },
    Medium: { color: "bg-blue-100 text-blue-700 border-blue-200" },
    Low: { color: "bg-slate-100 text-slate-500 border-slate-200" },
};

const LABEL_COLORS = [
    "bg-sky-100 text-sky-700", "bg-rose-100 text-rose-700", "bg-emerald-100 text-emerald-700",
    "bg-amber-100 text-amber-700", "bg-violet-100 text-violet-700", "bg-pink-100 text-pink-700",
];

const WS_COLORS = [
    { value: "blue", bg: "bg-blue-100", text: "text-blue-600", ring: "ring-blue-200" },
    { value: "rose", bg: "bg-rose-100", text: "text-rose-600", ring: "ring-rose-200" },
    { value: "emerald", bg: "bg-emerald-100", text: "text-emerald-600", ring: "ring-emerald-200" },
    { value: "amber", bg: "bg-amber-100", text: "text-amber-600", ring: "ring-amber-200" },
    { value: "violet", bg: "bg-violet-100", text: "text-violet-600", ring: "ring-violet-200" },
    { value: "indigo", bg: "bg-indigo-100", text: "text-indigo-600", ring: "ring-indigo-200" },
];

const EMOJI_OPTIONS = ["📁", "🚀", "💡", "🎯", "🛠️", "📊", "🔬", "🤖", "🎨", "📋", "⚡", "🌐"];

// quillModules and quillFormats removed as they are now internal to RichTextEditor

interface TrackingClientProps {
    tasks: TrackingTask[];
    projects: Project[];
    resources: Resource[];
    innovations: Innovation[];
    workspaceNotes: WorkspaceNote[];
    workspaces: TrackingWorkspace[];
    currentUser: any;
    systemUsers: User[];
}

const DEFAULT_TASK = {
    id: "", title: "", description: "", status: "Backlog" as TrackingTask["status"],
    priority: "Medium" as TrackingTask["priority"], assignee: "", project_id: "",
    labels: [] as string[], due_date: "", effort: 0, order_index: 0,
};

function getWsColor(color?: string) {
    return WS_COLORS.find(c => c.value === color) || WS_COLORS[0];
}

export function TrackingClient({ 
    tasks: initialTasks, 
    projects, 
    resources, 
    innovations, 
    workspaceNotes: initialNotes, 
    workspaces: initialWorkspaces,
    currentUser,
    systemUsers
}: TrackingClientProps) {
    const router = useRouter();

    const [wsItems, setWsItems] = useState<TrackingWorkspace[]>(initialWorkspaces);
    const [tasks, setTasks] = useState<TrackingTask[]>(initialTasks);
    const [notes, setNotes] = useState<WorkspaceNote[]>(initialNotes);
    const [selectedWs, setSelectedWs] = useState<string>(wsItems[0]?.id || "");

    // Workspace CRUD state
    const [wsAdding, setWsAdding] = useState(false);
    const [wsEditingId, setWsEditingId] = useState<string | null>(null);
    const [wsForm, setWsForm] = useState({ name: "", icon: "📁", color: "blue" });

    // Task state
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState(DEFAULT_TASK);
    const [isLoading, setIsLoading] = useState(false);
    const [labelInput, setLabelInput] = useState("");
    const [expandedTask, setExpandedTask] = useState<string | null>(null);
    const draggedTaskRef = useRef<string | null>(null);

    // Notes state
    const [noteEditing, setNoteEditing] = useState(false);
    const [noteSaving, setNoteSaving] = useState(false);
    const [noteContent, setNoteContent] = useState("");

    // Sharing state
    const [sharingWsId, setSharingWsId] = useState<string | null>(null);

    const currentWs = wsItems.find(w => w.id === selectedWs);
    const filteredTasks = tasks.filter(t => t.project_id === selectedWs);
    const currentNote = notes.find(n => n.project_id === selectedWs);

    // Sync note content when switching workspace
    useEffect(() => {
        const note = notes.find(n => n.project_id === selectedWs);
        setNoteContent(note?.content || "");
        setNoteEditing(false);
    }, [selectedWs, notes]);

    // ─── Workspace handlers ──────────────────────────
    const startWsAdd = () => {
        setWsForm({ name: "", icon: "📁", color: "blue" });
        setWsAdding(true);
        setWsEditingId(null);
    };

    const startWsEdit = (ws: TrackingWorkspace) => {
        setWsForm({ name: ws.name, icon: ws.icon || "📁", color: ws.color || "blue" });
        setWsEditingId(ws.id);
        setWsAdding(true);
    };


    async function handleWsSubmit() {
        if (!wsForm.name.trim()) return;
        try {
            if (wsEditingId) {
                await fetch("/api/tracking/workspaces", {
                    method: "PUT", headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id: wsEditingId, name: wsForm.name, icon: wsForm.icon, color: wsForm.color }),
                });
                setWsItems(prev => prev.map(w => w.id === wsEditingId ? { ...w, name: wsForm.name, icon: wsForm.icon, color: wsForm.color } : w));
                toast.success("Workspace updated");
            } else {
                const res = await fetch("/api/tracking/workspaces", {
                    method: "POST", headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ ...wsForm, created_by: currentUser?.id }),
                });
                const data = await res.json();
                if (data.workspace) {
                    setWsItems(prev => [...prev, data.workspace]);
                    setSelectedWs(data.workspace.id);
                    toast.success("New workspace created");
                }
            }
        } catch (err) { toast.error("Failed to save workspace"); }
        setWsAdding(false);
        setWsEditingId(null);
        router.refresh();
    }

    async function handleWsDelete(id: string) {
        if (!confirm("Delete this workspace and all its tasks/notes?")) return;
        try {
            await fetch(`/api/tracking/workspaces?id=${id}`, { method: "DELETE" });
            setWsItems(prev => prev.filter(w => w.id !== id));
            setTasks(prev => prev.filter(t => t.project_id !== id));
            setNotes(prev => prev.filter(n => n.project_id !== id));
            if (selectedWs === id) setSelectedWs(wsItems.filter(w => w.id !== id)[0]?.id || "");
            toast.success("Workspace deleted");
            router.refresh();
        } catch (err) { toast.error("Failed to delete workspace"); }
    }

    async function handleShareToggle(userId: string) {
        if (!sharingWsId) return;
        const ws = wsItems.find(w => w.id === sharingWsId);
        if (!ws) return;

        const currentShared = ws.shared_with || [];
        const isShared = currentShared.includes(userId);
        const newShared = isShared 
            ? currentShared.filter(id => id !== userId)
            : [...currentShared, userId];

        try {
            await fetch("/api/tracking/workspaces", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: sharingWsId, shared_with: newShared }),
            });
            setWsItems(prev => prev.map(w => w.id === sharingWsId ? { ...w, shared_with: newShared } : w));
            toast.success(isShared ? "Access removed" : "Workspace shared");
        } catch (err) {
            toast.error("Failed to update sharing");
        }
    }

    // ─── Task handlers ──────────────────────────
    const startAdding = (status: TrackingTask["status"] = "Backlog") => {
        const maxOrder = filteredTasks.filter(t => t.status === status).reduce((max, t) => Math.max(max, t.order_index), 0);
        setFormData({ ...DEFAULT_TASK, status, project_id: selectedWs, id: `T${Date.now()}`, order_index: maxOrder + 1 });
        setEditingId(null);
        setIsAdding(true);
    };

    const startEditing = (t: TrackingTask) => {
        setFormData({
            id: t.id, title: t.title, description: t.description || "",
            status: t.status, priority: t.priority, assignee: t.assignee || "",
            project_id: t.project_id || selectedWs, labels: t.labels || [],
            due_date: t.due_date || "", effort: t.effort || 0, order_index: t.order_index,
        });
        setEditingId(t.id);
        setIsAdding(true);
    };

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setIsLoading(true);
        try {
            const method = editingId ? "PUT" : "POST";
            const payload = { ...formData, project_id: selectedWs };
            const res = await fetch("/api/tracking", {
                method, headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            if (res.ok) {
                const data = await res.json();
                if (editingId) {
                    setTasks(tasks.map(t => t.id === editingId ? { ...t, ...payload, updated_at: new Date().toISOString() } as TrackingTask : t));
                    toast.success("Task updated");
                } else {
                    if (data.task) {
                        setTasks([...tasks, data.task]);
                        toast.success("Task created");
                    }
                }
                setIsAdding(false);
                setFormData(DEFAULT_TASK);
                setEditingId(null);
                router.refresh();
            } else {
                toast.error("Failed to save task");
            }
        } catch (err) { toast.error("Network error saving task"); }
        setIsLoading(false);
    }

    async function handleDelete(id: string, title: string) {
        if (!confirm(`Delete "${title}"?`)) return;
        try {
            const res = await fetch(`/api/tracking?id=${id}`, { method: "DELETE" });
            if (res.ok) { 
                setTasks(tasks.filter(t => t.id !== id)); 
                toast.success("Task deleted");
                router.refresh(); 
            } else {
                toast.error("Failed to delete task");
            }
        } catch (err) { toast.error("Error deleting task"); }
    }

    async function handleDrop(taskId: string, newStatus: TrackingTask["status"]) {
        const task = tasks.find(t => t.id === taskId);
        if (!task || task.status === newStatus) return;

        try {
            const res = await fetch("/api/tracking", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: taskId, status: newStatus }),
            });

            if (res.ok) {
                setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus, updated_at: new Date().toISOString() } : t));
                toast.success(`Moved to ${newStatus}`);
                router.refresh();
            } else {
                toast.error("Failed to move task");
            }
        } catch (err) { toast.error("Error updating status"); }
    }

    // ─── Notes handler ──────────────────────────
    async function saveNote() {
        setNoteSaving(true);
        const noteId = currentNote?.id || `WN_${selectedWs}`;
        try {
            await fetch("/api/tracking/notes", {
                method: "PUT", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: noteId, project_id: selectedWs, content: noteContent }),
            });
            setNotes(prev => {
                const exists = prev.find(n => n.project_id === selectedWs);
                if (exists) return prev.map(n => n.project_id === selectedWs ? { ...n, content: noteContent, updated_at: new Date().toISOString() } : n);
                return [...prev, { id: noteId, project_id: selectedWs, content: noteContent, updated_at: new Date().toISOString() }];
            });
            toast.success("Notes saved");
            setNoteEditing(false);
        } catch (err) { toast.error("Failed to save notes"); }
        setNoteSaving(false);
    }

    const addLabel = () => {
        if (labelInput.trim() && !formData.labels.includes(labelInput.trim())) {
            setFormData({ ...formData, labels: [...formData.labels, labelInput.trim()] });
            setLabelInput("");
        }
    };

    // ════════════════════════════════════════════
    // RENDER
    // ════════════════════════════════════════════
    return (
        <div className="flex gap-4 min-h-[70vh]">
            {/* ╔══ LEFT PANEL: Workspace Sidebar ══╗ */}
            <div className="w-56 shrink-0 glass-card bg-white/50 border-slate-200 flex flex-col overflow-hidden">
                <div className="p-3 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Workspaces</h3>
                    <button onClick={startWsAdd} className="p-1.5 rounded-lg hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 transition-all" title="Add workspace">
                        <FolderPlus className="w-4 h-4" />
                    </button>
                </div>

                {/* Add/Edit Workspace Inline Form */}
                {wsAdding && (
                    <div className="p-3 border-b border-indigo-100 bg-indigo-50/30 space-y-2.5">
                        <input
                            autoFocus value={wsForm.name} onChange={e => setWsForm({ ...wsForm, name: e.target.value })}
                            className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold outline-none focus:border-indigo-400 shadow-sm"
                            placeholder="Workspace name"
                            onKeyDown={e => { if (e.key === "Enter") handleWsSubmit(); }}
                        />
                        <div className="flex flex-wrap gap-1">
                            {EMOJI_OPTIONS.map(em => (
                                <button key={em} type="button" onClick={() => setWsForm({ ...wsForm, icon: em })}
                                    className={cn("w-7 h-7 rounded-lg text-sm flex items-center justify-center hover:bg-white transition-colors",
                                        wsForm.icon === em ? "bg-white ring-2 ring-indigo-400 shadow-sm" : "bg-slate-100")}>
                                    {em}
                                </button>
                            ))}
                        </div>
                        <div className="flex flex-wrap gap-1">
                            {WS_COLORS.map(c => (
                                <button key={c.value} type="button" onClick={() => setWsForm({ ...wsForm, color: c.value })}
                                    className={cn("w-6 h-6 rounded-full", c.bg, wsForm.color === c.value && "ring-2 ring-offset-1 ring-indigo-500")} />
                            ))}
                        </div>
                        <div className="flex gap-1.5">
                            <button onClick={handleWsSubmit} className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-indigo-600 text-white text-[10px] font-bold rounded-lg hover:opacity-90">
                                <Check className="w-3 h-3" /> {wsEditingId ? "Update" : "Create"}
                            </button>
                            <button onClick={() => { setWsAdding(false); setWsEditingId(null); }} className="px-2 py-1.5 text-[10px] font-bold text-slate-500 hover:bg-slate-100 rounded-lg">
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Workspace List */}
                <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
                    {wsItems.map(w => {
                        const c = getWsColor(w.color);
                        const taskCount = tasks.filter(t => t.project_id === w.id).length;
                        const isOwner = w.created_by === currentUser?.id;
                        const isSharedWithMe = w.shared_with?.includes(currentUser?.id);

                        return (
                            <div key={w.id}
                                className={cn("group w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-2.5 transition-all cursor-pointer relative",
                                    selectedWs === w.id ? cn("border shadow-sm", c.bg, c.ring, "ring-1") : "text-slate-600 hover:bg-slate-50"
                                )}
                                onClick={() => setSelectedWs(w.id)}>
                                <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-sm", c.bg)}>
                                    {w.icon || "📁"}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-1.5">
                                        <div className="text-xs font-bold truncate">{w.name}</div>
                                        {isSharedWithMe && !isOwner && <div className="w-1.5 h-1.5 rounded-full bg-blue-400" title="Shared with you" />}
                                    </div>
                                    <div className="text-[8px] font-bold text-slate-400">
                                        {taskCount} tasks {isOwner ? "• Owner" : ""}
                                    </div>
                                </div>
                                {/* Actions on hover */}
                                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {isOwner && (
                                        <>
                                            <button onClick={e => { e.stopPropagation(); setSharingWsId(w.id); }} className="p-1 rounded text-slate-400 hover:text-emerald-600 hover:bg-white/80" title="Share"><UserIcon className="w-3 h-3" /></button>
                                            <button onClick={e => { e.stopPropagation(); startWsEdit(w); }} className="p-1 rounded text-slate-400 hover:text-indigo-600 hover:bg-white/80"><Edit2 className="w-3 h-3" /></button>
                                        </>
                                    )}
                                    {(isOwner || currentUser?.role === 'SuperAdmin') && (
                                        <button onClick={e => { e.stopPropagation(); handleWsDelete(w.id); }} className="p-1 rounded text-slate-400 hover:text-red-500 hover:bg-white/80"><Trash2 className="w-3 h-3" /></button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                    {wsItems.length === 0 && !wsAdding && (
                        <div className="text-center py-8">
                            <FolderPlus className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                            <p className="text-[10px] text-slate-400 font-bold">No workspaces yet</p>
                            <button onClick={startWsAdd} className="text-[10px] text-indigo-600 font-bold mt-1 hover:underline">Create your first</button>
                        </div>
                    )}
                </div>
            </div>

            {/* ╔══ RIGHT: Main Content ══╗ */}
            <div className="flex-1 min-w-0 space-y-4">
                {currentWs ? (
                    <>
                        {/* Workspace Header */}
                        <div className="glass-card p-4 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-sm", getWsColor(currentWs.color).bg)}>
                                    {currentWs.icon || "📁"}
                                </div>
                                <div>
                                    <h2 className="text-sm font-black text-slate-900">{currentWs.name}</h2>
                                    <span className="text-[10px] text-slate-400 font-bold">{filteredTasks.length} tasks</span>
                                </div>
                            </div>
                            <button onClick={() => isAdding ? setIsAdding(false) : startAdding()}
                                className={cn("flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-black transition-all shadow-sm ring-1 ring-inset",
                                    isAdding ? "bg-white ring-slate-200 text-slate-600" : "bg-gradient-to-r from-indigo-600 to-blue-600 ring-indigo-700 text-white")}>
                                {isAdding ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                                {isAdding ? "Cancel" : "New Task"}
                            </button>
                        </div>

                        {/* ═══ NOTES SECTION (above Kanban) ═══ */}
                        <div className="glass-card bg-white/50 border-slate-200 overflow-hidden">
                            {noteEditing ? (
                                /* Editing mode */
                                <div className="p-5">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <StickyNote className="w-4 h-4 text-indigo-500" />
                                            <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest">Workspace Notes</h3>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => { setNoteContent(currentNote?.content || ""); setNoteEditing(false); }}
                                                className="px-3 py-1 text-[10px] font-bold text-slate-500 hover:bg-slate-100 rounded-lg">Cancel</button>
                                            <button onClick={saveNote} disabled={noteSaving}
                                                className="flex items-center gap-1 px-4 py-1.5 bg-indigo-600 text-white text-[10px] font-black rounded-lg hover:opacity-95 disabled:opacity-50 shadow-sm">
                                                {noteSaving ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Check className="w-3 h-3" />}
                                                Save
                                            </button>
                                        </div>
                                    </div>
                                    <div className="bg-white rounded-xl overflow-hidden">
                                        <RichTextEditor 
                                            value={noteContent} 
                                            onChange={setNoteContent}
                                            placeholder="📝 Project description, architecture notes, meeting notes..." 
                                            height={400}
                                        />
                                    </div>
                                </div>
                            ) : (
                                /* Display mode */
                                <div className="group cursor-pointer hover:bg-white/70 transition-colors" onClick={() => setNoteEditing(true)}>
                                    <div className="flex items-center justify-between px-5 pt-4 pb-2">
                                        <div className="flex items-center gap-2">
                                            <StickyNote className="w-3.5 h-3.5 text-indigo-400" />
                                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Notes</h3>
                                        </div>
                                        <div className="flex items-center gap-1 text-[10px] text-slate-300 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Pencil className="w-3 h-3" /> Click to edit
                                        </div>
                                    </div>
                                    {(currentNote?.content && currentNote.content !== "<p><br></p>") ? (
                                        <div className="px-5 pb-4">
                                            <div className="rich-content text-xs leading-relaxed"
                                                dangerouslySetInnerHTML={{ __html: currentNote.content }} />
                                        </div>
                                    ) : (
                                        <div className="px-5 pb-4">
                                            <p className="text-xs text-slate-300 italic">Click to add project notes, architecture decisions, meeting notes...</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* ═══ ADD/EDIT TASK FORM ═══ */}
                        {isAdding && (
                            <div className="glass-card p-6 bg-indigo-50/20 border-indigo-200 animate-fadeInUp">
                                <form onSubmit={handleSubmit} className="space-y-4 max-w-6xl mx-auto">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="md:col-span-3">
                                            <label className="block text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1.5">Task Title</label>
                                            <input required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })}
                                                className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-sm font-bold text-slate-900 outline-none focus:border-indigo-500 shadow-sm"
                                                placeholder="e.g. Setup CI/CD pipeline" />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1.5">Status</label>
                                            <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                                                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold text-slate-900 outline-none focus:border-indigo-500 shadow-sm">
                                                {COLUMNS.map(c => <option key={c} value={c}>{c}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1.5">Priority</label>
                                            <select value={formData.priority} onChange={e => setFormData({ ...formData, priority: e.target.value as any })}
                                                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold text-slate-900 outline-none focus:border-indigo-500 shadow-sm">
                                                <option value="Low">⚪ Low</option>
                                                <option value="Medium">🔵 Medium</option>
                                                <option value="High">🟠 High</option>
                                                <option value="Urgent">🔴 Urgent</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1.5 flex items-center gap-1"><UserIcon className="w-3 h-3" /> Assignee</label>
                                            <select value={formData.assignee} onChange={e => setFormData({ ...formData, assignee: e.target.value })}
                                                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold text-slate-900 outline-none focus:border-indigo-500 shadow-sm">
                                                <option value="">-- Unassigned --</option>
                                                {resources.map(r => <option key={r.employee_id} value={r.name}>{r.name} ({r.role})</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1.5 flex items-center gap-1"><Calendar className="w-3 h-3" /> Due Date</label>
                                            <input type="date" value={formData.due_date} onChange={e => setFormData({ ...formData, due_date: e.target.value })}
                                                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold text-slate-900 outline-none focus:border-indigo-500 shadow-sm" />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1.5 flex items-center gap-1"><Timer className="w-3 h-3" /> Effort (hours)</label>
                                            <input type="number" min="0" step="0.5" value={formData.effort || ""} onChange={e => setFormData({ ...formData, effort: parseFloat(e.target.value) || 0 })}
                                                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold text-slate-900 outline-none focus:border-indigo-500 shadow-sm" placeholder="0" />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1.5 flex items-center gap-1"><Tag className="w-3 h-3" /> Labels</label>
                                            <div className="flex gap-2">
                                                <input value={labelInput} onChange={e => setLabelInput(e.target.value)}
                                                    onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addLabel(); } }}
                                                    className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500 shadow-sm" placeholder="Type & Enter" />
                                                <button type="button" onClick={addLabel} className="px-3 py-2 bg-indigo-100 text-indigo-600 rounded-lg text-xs font-bold hover:bg-indigo-200"><Tag className="w-3.5 h-3.5" /></button>
                                            </div>
                                            {formData.labels.length > 0 && (
                                                <div className="flex flex-wrap gap-1.5 mt-2">
                                                    {formData.labels.map((l, i) => (
                                                        <span key={l} className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1", LABEL_COLORS[i % LABEL_COLORS.length])}>
                                                            {l} <button type="button" onClick={() => setFormData({ ...formData, labels: formData.labels.filter(lb => lb !== l) })}><X className="w-3 h-3" /></button>
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1.5">Description / Notes</label>
                                        <RichTextEditor 
                                            value={formData.description} 
                                            onChange={content => setFormData({ ...formData, description: content })}
                                            placeholder="Detailed task instructions, acceptance criteria, notes..."
                                            height={250}
                                        />
                                    </div>
                                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                                        <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-lg">Cancel</button>
                                        <button type="submit" disabled={isLoading}
                                            className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-8 py-2 rounded-lg text-sm font-black hover:opacity-95 disabled:opacity-50 shadow-md active:scale-95 transition-all">
                                            {isLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Check className="w-4 h-4" />}
                                            {editingId ? "Update Task" : "Create Task"}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* ═══ KANBAN BOARD ═══ */}
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                            {COLUMNS.map(column => {
                                const colTasks = filteredTasks.filter(t => t.status === column);
                                const colors = COLUMN_COLORS[column];
                                return (
                                    <div key={column}
                                        className={cn("rounded-xl border-2 border-dashed p-3 flex flex-col transition-colors min-h-[35vh]", colors.bg, colors.border)}
                                        onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add("ring-2", "ring-indigo-400"); }}
                                        onDragLeave={e => { e.currentTarget.classList.remove("ring-2", "ring-indigo-400"); }}
                                        onDrop={e => {
                                            e.preventDefault(); e.currentTarget.classList.remove("ring-2", "ring-indigo-400");
                                            if (draggedTaskRef.current) { handleDrop(draggedTaskRef.current, column); draggedTaskRef.current = null; }
                                        }}>
                                        <div className={cn("flex items-center justify-between mb-3 px-2 py-2 rounded-lg", colors.headerBg)}>
                                            <div className="flex items-center gap-2">
                                                <div className={cn("w-2.5 h-2.5 rounded-full", colors.dot)} />
                                                <h3 className="text-[10px] font-black text-slate-700 uppercase tracking-wider">{column}</h3>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <span className="bg-white/80 text-[10px] font-black text-slate-500 px-1.5 py-0.5 rounded-full ring-1 ring-slate-200">{colTasks.length}</span>
                                                <button onClick={() => startAdding(column)} className="p-1 rounded-md hover:bg-white/50 text-slate-400 hover:text-indigo-600"><Plus className="w-3.5 h-3.5" /></button>
                                            </div>
                                        </div>
                                        <div className="flex-1 space-y-2 overflow-y-auto">
                                            {colTasks.map(task => {
                                                const priorityCfg = PRIORITY_CONFIG[task.priority];
                                                const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== "Done";
                                                const isExpanded = expandedTask === task.id;
                                                return (
                                                    <div key={task.id} draggable onDragStart={() => { draggedTaskRef.current = task.id; }}
                                                        className={cn("group bg-white rounded-xl border shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing relative",
                                                            isOverdue ? "border-red-300 ring-1 ring-red-100" : "border-slate-200 hover:border-indigo-300")}>
                                                        <div className={cn("h-1 rounded-t-xl", task.priority === "Urgent" ? "bg-red-500" : task.priority === "High" ? "bg-orange-400" : task.priority === "Medium" ? "bg-blue-400" : "bg-slate-200")} />
                                                        <div className="p-3">
                                                            <div className="absolute top-2 right-2 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                                                <button onClick={() => startEditing(task)} className="p-1 rounded bg-white/80 text-slate-400 hover:text-blue-600"><Edit2 className="w-3 h-3" /></button>
                                                                <button onClick={() => handleDelete(task.id, task.title)} className="p-1 rounded bg-white/80 text-slate-400 hover:text-red-500"><Trash2 className="w-3 h-3" /></button>
                                                            </div>
                                                            <h4 className={cn("text-xs font-bold text-slate-800 leading-snug pr-10 cursor-pointer hover:text-indigo-600", task.status === "Done" && "line-through text-slate-400")}
                                                                onClick={() => setExpandedTask(isExpanded ? null : task.id)}>
                                                                {task.title}
                                                            </h4>
                                                            {task.labels && task.labels.length > 0 && (
                                                                <div className="flex flex-wrap gap-1 mt-2">
                                                                    {task.labels.map((l, i) => <span key={l} className={cn("px-1.5 py-px rounded text-[8px] font-bold", LABEL_COLORS[i % LABEL_COLORS.length])}>{l}</span>)}
                                                                </div>
                                                            )}
                                                            {isExpanded && task.description && (
                                                                <div className="mt-3 pt-2 border-t border-slate-100">
                                                                    <div className="text-[11px] text-slate-600 leading-relaxed prose prose-slate prose-xs max-w-none" dangerouslySetInnerHTML={{ __html: task.description }} />
                                                                </div>
                                                            )}
                                                            <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-50">
                                                                <div className="flex items-center gap-1.5">
                                                                    {task.assignee && (
                                                                        <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center text-[8px] font-black text-indigo-600 ring-1 ring-indigo-200" title={task.assignee}>
                                                                            {task.assignee.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase()}
                                                                        </div>
                                                                    )}
                                                                    <span className={cn("px-1.5 py-px rounded text-[8px] font-bold border", priorityCfg.color)}>{task.priority}</span>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    {task.effort ? <span className="text-[8px] font-bold text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded flex items-center gap-0.5"><Timer className="w-2.5 h-2.5" />{task.effort}h</span> : null}
                                                                    {task.due_date && (
                                                                        <span className={cn("text-[9px] font-bold flex items-center gap-0.5", isOverdue ? "text-red-500" : "text-slate-400")}>
                                                                            <Clock className="w-3 h-3" />{new Date(task.due_date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                            {colTasks.length === 0 && (
                                                <div className="flex flex-col items-center justify-center py-8 text-slate-300">
                                                    <div className="w-10 h-10 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center mb-2"><Plus className="w-5 h-5" /></div>
                                                    <p className="text-[10px] font-bold text-slate-400">Drop or add</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                ) : (
                    /* Empty State */
                    <div className="glass-card p-20 text-center bg-slate-50/30 border-dashed border-2">
                        <FolderPlus className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                        <h3 className="text-slate-900 font-bold mb-1">Create a Workspace</h3>
                        <p className="text-slate-400 text-xs mb-4">Add a workspace from the left panel to get started.</p>
                        <button onClick={startWsAdd} className="px-6 py-2 bg-indigo-600 text-white text-xs font-black rounded-lg hover:opacity-90 shadow-md">
                            <Plus className="w-3.5 h-3.5 inline mr-1" /> New Workspace
                        </button>
                    </div>
                )}
            </div>

            {/* Sharing Modal */}
            {sharingWsId && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-springIn">
                        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-emerald-50/50">
                            <div>
                                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Share Workspace</h3>
                                <p className="text-[10px] text-slate-400 font-bold">Workspace: {wsItems.find(w => w.id === sharingWsId)?.name}</p>
                            </div>
                            <button onClick={() => setSharingWsId(null)} className="p-2 text-slate-400 hover:text-slate-900 rounded-xl transition-all">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-4 max-h-[60vh] overflow-y-auto space-y-1">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 mb-2">Members</p>
                            {systemUsers.filter(u => u.id !== currentUser?.id).map(user => {
                                const isShared = wsItems.find(w => w.id === sharingWsId)?.shared_with?.includes(user.id);
                                return (
                                    <div key={user.id} 
                                        onClick={() => handleShareToggle(user.id)}
                                        className={cn("flex items-center justify-between p-2.5 rounded-xl transition-all cursor-pointer",
                                            isShared ? "bg-emerald-50 text-emerald-700" : "hover:bg-slate-50 text-slate-600")}>
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-black">
                                                {user.name.split(" ").map(n => n[0]).join("")}
                                            </div>
                                            <div>
                                                <div className="text-xs font-black">{user.name}</div>
                                                <div className="text-[9px] font-bold opacity-60 text-slate-400">{user.role}</div>
                                            </div>
                                        </div>
                                        {isShared ? <Check className="w-4 h-4 text-emerald-500" /> : <div className="w-4 h-4 rounded-full border-2 border-slate-200" />}
                                    </div>
                                );
                            })}
                        </div>
                        <div className="p-4 bg-slate-50 border-t border-slate-100">
                            <button onClick={() => setSharingWsId(null)} className="w-full py-2.5 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-800 transition-all">
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
