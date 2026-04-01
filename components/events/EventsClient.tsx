"use client";
import { useState } from "react";
import { OrgEvent, EventStatus } from "@/types";
import { useRouter } from "next/navigation";
import { Plus, X, Check, Trash2, Edit2, Calendar, MapPin, Video, Users, CheckCircle, Clock } from "lucide-react";

interface EventsClientProps {
    events: OrgEvent[];
}

const STATUSES: EventStatus[] = ["Upcoming", "Ongoing", "Completed", "Cancelled"];
const STATUS_COLORS: Record<EventStatus, string> = {
    Upcoming: "bg-blue-100 text-blue-700",
    Ongoing: "bg-emerald-100 text-emerald-700",
    Completed: "bg-slate-100 text-slate-700",
    Cancelled: "bg-red-100 text-red-700",
};

const DEFAULT_FORM = {
    title: "",
    description: "",
    event_date: "",
    end_date: "",
    location: "",
    meeting_link: "",
    organizer: "",
    capacity: "" as string | number,
    status: "Upcoming" as EventStatus,
    feedback_enabled: true,
};

export default function EventsClient({ events: initialEvents }: EventsClientProps) {
    const router = useRouter();
    const [events, setEvents] = useState<OrgEvent[]>(initialEvents);
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState(DEFAULT_FORM);
    const [isLoading, setIsLoading] = useState(false);
    const [filterStatus, setFilterStatus] = useState<EventStatus | "All">("All");

    const filtered = filterStatus === "All" ? events : events.filter(e => e.status === filterStatus);

    const kpis = {
        total: events.length,
        upcoming: events.filter(e => e.status === "Upcoming").length,
        ongoing: events.filter(e => e.status === "Ongoing").length,
        totalRSVPs: events.reduce((s, e) => s + (e.rsvp_count || 0), 0),
    };

    const startAdding = () => { setFormData({ ...DEFAULT_FORM }); setEditingId(null); setIsAdding(true); };
    const startEditing = (e: OrgEvent) => {
        setFormData({
            title: e.title,
            description: e.description || "",
            event_date: e.event_date,
            end_date: e.end_date || "",
            location: e.location || "",
            meeting_link: e.meeting_link || "",
            organizer: e.organizer,
            capacity: e.capacity || "",
            status: e.status,
            feedback_enabled: e.feedback_enabled,
        });
        setEditingId(e.id);
        setIsAdding(true);
    };
    const cancelForm = () => { setIsAdding(false); setEditingId(null); setFormData({ ...DEFAULT_FORM }); };

    const handleSave = async () => {
        if (!formData.title.trim() || !formData.event_date) return;
        setIsLoading(true);
        try {
            const payload = {
                title: formData.title,
                description: formData.description,
                event_date: formData.event_date,
                end_date: formData.end_date || null,
                location: formData.location,
                meeting_link: formData.meeting_link,
                organizer: formData.organizer,
                capacity: formData.capacity === "" ? null : Number(formData.capacity),
                status: formData.status,
                feedback_enabled: formData.feedback_enabled,
                ...(editingId ? { id: editingId } : {}),
            };
            const res = await fetch("/api/events", {
                method: editingId ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            if (!res.ok) { const e = await res.json(); throw new Error(e.error || "Save failed"); }
            cancelForm();
            const updated = await fetch("/api/events").then(r => r.json());
            if (updated.events) setEvents(updated.events);
            router.refresh();
        } catch (err: any) {
            alert("Error saving event: " + err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this event?")) return;
        setIsLoading(true);
        try {
            await fetch(`/api/events?id=${id}`, { method: "DELETE" });
            setEvents(prev => prev.filter(e => e.id !== id));
        } finally {
            setIsLoading(false);
        }
    };

    const formatDate = (d: string) => d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "";

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Events</h1>
                    <p className="text-slate-400 text-sm mt-1">Manage organization events and RSVPs</p>
                </div>
                <button onClick={startAdding} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg transition-colors">
                    <Plus size={16} /> New Event
                </button>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: "Total Events", value: kpis.total, icon: Calendar, color: "text-blue-400" },
                    { label: "Upcoming", value: kpis.upcoming, icon: Clock, color: "text-amber-400" },
                    { label: "Ongoing", value: kpis.ongoing, icon: CheckCircle, color: "text-emerald-400" },
                    { label: "Total RSVPs", value: kpis.totalRSVPs, icon: Users, color: "text-violet-400" },
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
                        <h2 className="text-slate-800 font-semibold">{editingId ? "Edit Event" : "New Event"}</h2>
                        <button onClick={cancelForm}><X size={18} className="text-slate-400 hover:text-slate-700" /></button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-xs text-slate-600 font-medium mb-1">Title *</label>
                            <input value={formData.title} onChange={e => setFormData(p => ({ ...p, title: e.target.value }))}
                                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" placeholder="Event title" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-xs text-slate-600 font-medium mb-1">Description</label>
                            <textarea value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
                                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-sm focus:outline-none focus:border-blue-500 resize-none h-20" placeholder="Event description" />
                        </div>
                        <div>
                            <label className="block text-xs text-slate-600 font-medium mb-1">Start Date *</label>
                            <input type="datetime-local" value={formData.event_date} onChange={e => setFormData(p => ({ ...p, event_date: e.target.value }))}
                                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-sm focus:outline-none focus:border-blue-500" />
                        </div>
                        <div>
                            <label className="block text-xs text-slate-600 font-medium mb-1">End Date</label>
                            <input type="datetime-local" value={formData.end_date} onChange={e => setFormData(p => ({ ...p, end_date: e.target.value }))}
                                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-sm focus:outline-none focus:border-blue-500" />
                        </div>
                        <div>
                            <label className="block text-xs text-slate-600 font-medium mb-1">Location</label>
                            <input value={formData.location} onChange={e => setFormData(p => ({ ...p, location: e.target.value }))}
                                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-sm focus:outline-none focus:border-blue-500" placeholder="Physical location" />
                        </div>
                        <div>
                            <label className="block text-xs text-slate-600 font-medium mb-1">Meeting Link</label>
                            <input value={formData.meeting_link} onChange={e => setFormData(p => ({ ...p, meeting_link: e.target.value }))}
                                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-sm focus:outline-none focus:border-blue-500" placeholder="https://meet.google.com/..." />
                        </div>
                        <div>
                            <label className="block text-xs text-slate-600 font-medium mb-1">Organizer</label>
                            <input value={formData.organizer} onChange={e => setFormData(p => ({ ...p, organizer: e.target.value }))}
                                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-sm focus:outline-none focus:border-blue-500" placeholder="Organizer name" />
                        </div>
                        <div>
                            <label className="block text-xs text-slate-600 font-medium mb-1">Capacity</label>
                            <input type="number" value={formData.capacity} onChange={e => setFormData(p => ({ ...p, capacity: e.target.value }))}
                                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-sm focus:outline-none focus:border-blue-500" placeholder="Max attendees (optional)" />
                        </div>
                        <div>
                            <label className="block text-xs text-slate-600 font-medium mb-1">Status</label>
                            <select value={formData.status} onChange={e => setFormData(p => ({ ...p, status: e.target.value as EventStatus }))}
                                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-sm focus:outline-none focus:border-blue-500">
                                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div className="flex items-center gap-2">
                            <input type="checkbox" id="feedback_enabled" checked={formData.feedback_enabled} onChange={e => setFormData(p => ({ ...p, feedback_enabled: e.target.checked }))} className="accent-blue-500" />
                            <label htmlFor="feedback_enabled" className="text-sm text-slate-700">Enable post-event feedback</label>
                        </div>
                    </div>
                    <div className="flex gap-2 pt-2">
                        <button onClick={handleSave} disabled={isLoading}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm px-4 py-2 rounded-lg transition-colors">
                            <Check size={14} /> {isLoading ? "Saving..." : "Save Event"}
                        </button>
                        <button onClick={cancelForm} className="text-sm text-slate-500 hover:text-slate-800 px-4 py-2">Cancel</button>
                    </div>
                </div>
            )}

            {/* Events Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filtered.length === 0 && <div className="col-span-full text-center py-12 text-slate-500">No events found.</div>}
                {filtered.map(event => (
                    <div key={event.id} className="glass-card p-5 flex flex-col gap-3 hover:border-blue-500/30 transition-colors border border-transparent">
                        <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[event.status]}`}>{event.status}</span>
                                <h3 className="text-slate-800 font-semibold mt-1 text-sm">{event.title}</h3>
                                {event.description && <p className="text-slate-400 text-xs mt-0.5 line-clamp-2">{event.description}</p>}
                            </div>
                            <div className="flex gap-1 shrink-0">
                                <button onClick={() => startEditing(event)} className="p-1.5 rounded hover:bg-white/10"><Edit2 size={13} className="text-slate-400" /></button>
                                <button onClick={() => handleDelete(event.id)} className="p-1.5 rounded hover:bg-white/10"><Trash2 size={13} className="text-rose-400" /></button>
                            </div>
                        </div>
                        <div className="space-y-1 text-xs text-slate-400">
                            <div className="flex items-center gap-1.5">
                                <Calendar size={11} />
                                {formatDate(event.event_date)}
                                {event.end_date && ` → ${formatDate(event.end_date)}`}
                            </div>
                            {event.location && <div className="flex items-center gap-1.5"><MapPin size={11} />{event.location}</div>}
                            {event.meeting_link && <div className="flex items-center gap-1.5"><Video size={11} /><a href={event.meeting_link} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline truncate">Join Online</a></div>}
                            <div className="flex items-center gap-1.5">
                                <Users size={11} />
                                {event.rsvp_count} RSVPs
                                {event.capacity && ` / ${event.capacity} capacity`}
                                {event.attended_count !== undefined && ` · ${event.attended_count} attended`}
                            </div>
                        </div>
                        <div className="text-xs text-slate-600">Organizer: {event.organizer}{event.feedback_enabled ? " · Feedback enabled" : ""}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}
