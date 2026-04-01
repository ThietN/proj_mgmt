"use client";
import { Poll, Survey, OrgEvent, Feedback, ESATHubStats, PollStatus, SurveyStatus, EventStatus, FeedbackStatus } from "@/types";
import Link from "next/link";
import {
    BarChart2, ClipboardList, Calendar, MessageSquare,
    TrendingUp, Users, CheckCircle, Clock, ArrowRight, Activity
} from "lucide-react";

interface ESATHubClientProps {
    stats: ESATHubStats;
    polls: Poll[];
    surveys: Survey[];
    events: OrgEvent[];
    feedback: Feedback[];
}

const POLL_STATUS_COLORS: Record<PollStatus, string> = {
    Draft: "bg-slate-100 text-slate-600",
    Active: "bg-emerald-100 text-emerald-700",
    Closed: "bg-red-100 text-red-700",
};
const SURVEY_STATUS_COLORS: Record<SurveyStatus, string> = {
    Draft: "bg-slate-100 text-slate-600",
    Scheduled: "bg-blue-100 text-blue-700",
    Active: "bg-emerald-100 text-emerald-700",
    Closed: "bg-red-100 text-red-700",
};
const EVENT_STATUS_COLORS: Record<EventStatus, string> = {
    Upcoming: "bg-blue-100 text-blue-700",
    Ongoing: "bg-emerald-100 text-emerald-700",
    Completed: "bg-slate-100 text-slate-600",
    Cancelled: "bg-red-100 text-red-700",
};
const FEEDBACK_STATUS_COLORS: Record<FeedbackStatus, string> = {
    New: "bg-blue-100 text-blue-700",
    "In Review": "bg-amber-100 text-amber-700",
    Resolved: "bg-emerald-100 text-emerald-700",
    Closed: "bg-slate-100 text-slate-600",
};

export default function ESATHubClient({ stats, polls, surveys, events, feedback }: ESATHubClientProps) {
    const scoreColor = stats.overall_score >= 8 ? "text-emerald-400" : stats.overall_score >= 6 ? "text-amber-400" : "text-rose-400";

    const recentPolls = polls.slice(0, 4);
    const recentSurveys = surveys.slice(0, 4);
    const upcomingEvents = events
        .filter(e => e.status === "Upcoming" || e.status === "Ongoing")
        .sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime())
        .slice(0, 4);
    const openFeedback = feedback
        .filter(f => f.status === "New" || f.status === "In Review")
        .slice(0, 4);

    return (
        <div className="p-6 space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-white">ESAT Hub</h1>
                <p className="text-slate-400 text-sm mt-1">Employee Satisfaction & Engagement Platform</p>
            </div>

            {/* Score + KPI row */}
            <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-4">
                {/* Overall score - spans 2 cols */}
                <div className="col-span-2 glass-card p-5 flex flex-col items-center justify-center text-center">
                    <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Overall ESAT Score</p>
                    <p className={`text-5xl font-bold ${scoreColor}`}>{stats.overall_score.toFixed(1)}</p>
                    <p className="text-xs text-slate-500 mt-1">out of 10</p>
                    <div className="mt-3 w-full h-2 bg-white/10 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${scoreColor.replace("text", "bg")}`} style={{ width: `${stats.overall_score * 10}%` }} />
                    </div>
                </div>

                {[
                    { label: "Active Polls", value: stats.active_polls, icon: BarChart2, color: "text-blue-400", href: "/polls" },
                    { label: "Active Surveys", value: stats.active_surveys, icon: ClipboardList, color: "text-violet-400", href: "/surveys" },
                    { label: "Upcoming Events", value: stats.upcoming_events, icon: Calendar, color: "text-amber-400", href: "/events" },
                    { label: "Open Feedback", value: stats.open_feedback, icon: MessageSquare, color: "text-orange-400", href: "/feedback" },
                    { label: "Resolved", value: stats.resolved_feedback, icon: CheckCircle, color: "text-emerald-400", href: "/feedback" },
                    { label: "Avg Response", value: `${stats.avg_response_time_days}d`, icon: Clock, color: "text-slate-400", href: "/feedback" },
                ].map(k => (
                    <Link key={k.label} href={k.href} className="glass-card p-4 flex flex-col gap-2 hover:border-blue-500/30 transition-colors border border-transparent group">
                        <k.icon size={20} className={k.color} />
                        <p className="text-xs text-slate-400">{k.label}</p>
                        <p className="text-2xl font-bold text-white">{k.value}</p>
                        <ArrowRight size={12} className="text-slate-600 group-hover:text-blue-400 transition-colors" />
                    </Link>
                ))}
            </div>

            {/* 4-module quick-view grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Active Polls */}
                <div className="glass-card p-5 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <BarChart2 size={16} className="text-blue-400" />
                            <h2 className="text-white font-semibold text-sm">Recent Polls</h2>
                        </div>
                        <Link href="/polls" className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
                            View all <ArrowRight size={11} />
                        </Link>
                    </div>
                    {recentPolls.length === 0 ? (
                        <p className="text-slate-500 text-xs py-4 text-center">No polls yet.</p>
                    ) : (
                        <div className="space-y-2">
                            {recentPolls.map(poll => (
                                <div key={poll.id} className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-2">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-white text-xs font-medium truncate">{poll.title}</p>
                                        <p className="text-slate-500 text-xs">{poll.total_votes} votes</p>
                                    </div>
                                    <span className={`text-xs px-1.5 py-0.5 rounded-full shrink-0 ${POLL_STATUS_COLORS[poll.status]}`}>{poll.status}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Surveys */}
                <div className="glass-card p-5 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <ClipboardList size={16} className="text-violet-400" />
                            <h2 className="text-white font-semibold text-sm">Recent Surveys</h2>
                        </div>
                        <Link href="/surveys" className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1">
                            View all <ArrowRight size={11} />
                        </Link>
                    </div>
                    {recentSurveys.length === 0 ? (
                        <p className="text-slate-500 text-xs py-4 text-center">No surveys yet.</p>
                    ) : (
                        <div className="space-y-2">
                            {recentSurveys.map(s => (
                                <div key={s.id} className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-2">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-white text-xs font-medium truncate">{s.title}</p>
                                        <p className="text-slate-500 text-xs">{s.questions.length} questions · {s.response_count} responses</p>
                                    </div>
                                    <span className={`text-xs px-1.5 py-0.5 rounded-full shrink-0 ${SURVEY_STATUS_COLORS[s.status]}`}>{s.status}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Upcoming Events */}
                <div className="glass-card p-5 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Calendar size={16} className="text-amber-400" />
                            <h2 className="text-white font-semibold text-sm">Upcoming Events</h2>
                        </div>
                        <Link href="/events" className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1">
                            View all <ArrowRight size={11} />
                        </Link>
                    </div>
                    {upcomingEvents.length === 0 ? (
                        <p className="text-slate-500 text-xs py-4 text-center">No upcoming events.</p>
                    ) : (
                        <div className="space-y-2">
                            {upcomingEvents.map(e => (
                                <div key={e.id} className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-2">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-white text-xs font-medium truncate">{e.title}</p>
                                        <p className="text-slate-500 text-xs">
                                            {new Date(e.event_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })} · {e.rsvp_count} RSVPs
                                        </p>
                                    </div>
                                    <span className={`text-xs px-1.5 py-0.5 rounded-full shrink-0 ${EVENT_STATUS_COLORS[e.status]}`}>{e.status}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Open Feedback */}
                <div className="glass-card p-5 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <MessageSquare size={16} className="text-orange-400" />
                            <h2 className="text-white font-semibold text-sm">Open Feedback</h2>
                        </div>
                        <Link href="/feedback" className="text-xs text-orange-400 hover:text-orange-300 flex items-center gap-1">
                            View all <ArrowRight size={11} />
                        </Link>
                    </div>
                    {openFeedback.length === 0 ? (
                        <p className="text-slate-500 text-xs py-4 text-center">No open feedback.</p>
                    ) : (
                        <div className="space-y-2">
                            {openFeedback.map(f => (
                                <div key={f.id} className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-2">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-white text-xs font-medium truncate">{f.title}</p>
                                        <p className="text-slate-500 text-xs">{f.category} · {f.priority} priority</p>
                                    </div>
                                    <span className={`text-xs px-1.5 py-0.5 rounded-full shrink-0 ${FEEDBACK_STATUS_COLORS[f.status]}`}>{f.status}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>

            {/* Module nav cards */}
            <div>
                <h2 className="text-slate-400 text-xs uppercase tracking-wider mb-3">Quick Navigation</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                        { href: "/polls", label: "Polls", desc: "Quick opinion polls", icon: BarChart2, color: "from-blue-600/20 to-blue-600/5 border-blue-500/20" },
                        { href: "/surveys", label: "Surveys", desc: "In-depth surveys", icon: ClipboardList, color: "from-violet-600/20 to-violet-600/5 border-violet-500/20" },
                        { href: "/events", label: "Events", desc: "Team events & RSVPs", icon: Calendar, color: "from-amber-600/20 to-amber-600/5 border-amber-500/20" },
                        { href: "/feedback", label: "Feedback", desc: "Suggestions & issues", icon: MessageSquare, color: "from-orange-600/20 to-orange-600/5 border-orange-500/20" },
                    ].map(m => (
                        <Link key={m.href} href={m.href}
                            className={`bg-gradient-to-br ${m.color} border rounded-xl p-4 flex flex-col gap-2 hover:scale-[1.02] transition-transform`}>
                            <m.icon size={22} className="text-white/70" />
                            <p className="text-white font-semibold text-sm">{m.label}</p>
                            <p className="text-slate-400 text-xs">{m.desc}</p>
                            <div className="flex items-center gap-1 text-xs text-slate-500 mt-auto">
                                Go to {m.label} <ArrowRight size={11} />
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
