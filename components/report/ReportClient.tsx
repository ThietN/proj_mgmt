"use client";
import { Resource, Project, Innovation, CSATRecord, ESATRecord, Candidate, TrackingTask, TrackingWorkspace, WeeklyReportData } from "@/types";
import { useState, useMemo, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
    Users, Briefcase, Lightbulb, Star, Smile, UserCheck,
    Copy, Check, Printer, Calendar, AlertTriangle, TrendingUp,
    ChevronDown, ChevronRight, Edit2, RefreshCw, Clock, Pencil,
    FileText
} from "lucide-react";
import dynamic from "next/dynamic";
import 'react-quill/dist/quill.snow.css';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

const quillModules = {
    toolbar: [
        ["bold", "italic", "underline", "strike", "blockquote"],
        [{ list: "ordered" }, { list: "bullet" }],
        ["link", "clean"],
    ],
};
const quillFormats = ["bold", "italic", "underline", "strike", "blockquote", "list", "bullet", "link"];

interface ReportClientProps {
    resources: Resource[];
    projects: Project[];
    innovations: Innovation[];
    csat: CSATRecord[];
    esat: ESATRecord[];
    hiring: Candidate[];
    trackingTasks: TrackingTask[];
    workspaces: TrackingWorkspace[];
    pastReports: WeeklyReportData[];
}

function getWeekNumber(d: Date): number {
    const start = new Date(d.getFullYear(), 0, 1);
    const diff = d.getTime() - start.getTime();
    return Math.ceil((diff / 86400000 + start.getDay() + 1) / 7);
}

function formatDate(d: Date): string {
    return d.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
}

export function ReportClient({ resources, projects, innovations, csat, esat, hiring, trackingTasks, workspaces, pastReports }: ReportClientProps) {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentWeekNum = getWeekNumber(now);
    const [selectedWeek, setSelectedWeek] = useState(currentWeekNum);
    const [selectedYear, setSelectedYear] = useState(currentYear);
    const reportRef = useRef<HTMLDivElement>(null);
    const [copied, setCopied] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Calculate available weeks (showing 12 weeks back and 12 weeks forward from current week)
    const availableWeeks = useMemo(() => {
        const weeks = [];
        const startWeek = Math.max(1, currentWeekNum - 12);
        const endWeek = Math.min(52, currentWeekNum + 12);
        
        for (let w = endWeek; w >= startWeek; w--) {
            weeks.push({ week: w, year: currentYear });
        }
        
        // Add previous year's last weeks if we're in early weeks of current year
        if (currentWeekNum <= 12) {
            for (let w = 52; w >= 52 - (12 - currentWeekNum); w--) {
                weeks.push({ week: w, year: currentYear - 1 });
            }
        }
        
        return weeks;
    }, [currentWeekNum, currentYear]);

    // Editable sections
    const [customNotes, setCustomNotes] = useState({
        resourceExtra: "",
        programExtra: "",
        innovationExtra: "",
        activitiesExtra: "",
        otherUpdates: "",
    });
    const [editingSection, setEditingSection] = useState<string | null>(null);

    // Sync saved notes based on the selected week
    useEffect(() => {
        const saved = pastReports.find(r => r.week_number === selectedWeek && r.year === selectedYear);
        if (saved) {
            setCustomNotes({
                resourceExtra: saved.resource_notes || "",
                programExtra: saved.program_notes || "",
                innovationExtra: saved.innovation_notes || "",
                activitiesExtra: saved.activities_notes || "",
                otherUpdates: saved.other_notes || "",
            });
        } else {
            setCustomNotes({ resourceExtra: "", programExtra: "", innovationExtra: "", activitiesExtra: "", otherUpdates: "" });
        }
    }, [selectedWeek, selectedYear, pastReports]);

    async function saveNotes(field: string, val: string) {
        setIsSaving(true);
        const newNotes = { ...customNotes, [field]: val };
        setCustomNotes(newNotes);
        try {
            await fetch("/api/report", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    week_number: selectedWeek,
                    year: selectedYear,
                    resource_notes: newNotes.resourceExtra,
                    program_notes: newNotes.programExtra,
                    innovation_notes: newNotes.innovationExtra,
                    activities_notes: newNotes.activitiesExtra,
                    other_notes: newNotes.otherUpdates,
                })
            });
        } catch (e) { console.error(e) }
        setIsSaving(false);
    }

    // ═══ DATA EXTRACTION ═══

    // 1. Resource Update
    const totalHC = resources.length;
    const billable = resources.filter(r => r.status === "Billable");
    const available = resources.filter(r => r.status === "Available");
    const backup = resources.filter(r => r.status === "Backup");
    const resigning = resources.filter(r => r.status === "Resigning");
    const maternity = resources.filter(r => r.status === "Maternity Leave");
    const riskResources = resources.filter(r => r.risk_flag);
    const billableRate = totalHC > 0 ? ((billable.length / totalHC) * 100).toFixed(1) : "0";

    const recentJoiners = resources.filter(r => r.is_ramp_up);

    // Hiring pipeline
    const activeCandidates = hiring.filter(c => c.type === "Candidate" && c.interview_status !== "Rejected" && c.interview_status !== "Joined");
    const activeInterns = hiring.filter(c => c.type === "Intern");
    const joinedRecent = hiring.filter(c => c.interview_status === "Joined" && c.type !== "Intern");
    const totalNBR = projects.reduce((s, p) => s + p.nbr, 0);

    // 2. Program Status
    const activeProjects = projects.filter(p => p.delivery_status !== "Completed");
    const atRiskProjects = projects.filter(p => p.delivery_status === "At Risk" || p.delivery_status === "Critical");
    const onTrackProjects = projects.filter(p => p.delivery_status === "On Track");
    const totalEffort = projects.reduce((s, p) => s + p.effort, 0);
    const totalBillable = projects.reduce((s, p) => s + p.billable, 0);

    // 3. Innovation
    const activeInnovations = innovations.filter(i => i.status === "In Progress" || i.status === "Planning");
    const completedInnovations = innovations.filter(i => i.status === "Completed");

    // 4. Activities from Tracking
    const inProgressTasks = trackingTasks.filter(t => t.status === "In Progress");
    const reviewTasks = trackingTasks.filter(t => t.status === "Review");
    const doneTasks = trackingTasks.filter(t => t.status === "Done");
    const overdueTasks = trackingTasks.filter(t => t.due_date && new Date(t.due_date) < now && t.status !== "Done");

    // 5. CSAT / ESAT
    const avgCSAT = csat.length > 0 ? (csat.reduce((s, c) => s + c.survey_score, 0) / csat.length).toFixed(1) : "N/A";
    const avgESAT = esat.length > 0 ? (esat.reduce((s, e) => s + e.score, 0) / esat.length).toFixed(1) : "N/A";
    const lowCSAT = csat.filter(c => c.survey_score < 7);

    // ═══ COPY TO CLIPBOARD (plain text) ═══
    const stripHtml = (html: string) => {
        if (!html) return "";
        const tmp = document.createElement("DIV");
        tmp.innerHTML = html;
        tmp.querySelectorAll('p, div, li, br').forEach(el => el.insertAdjacentHTML('afterend', '\n'));
        return (tmp.textContent || tmp.innerText || "").replace(/\n\s*\n/g, '\n').trim();
    };

    async function copyReport() {
        if (!reportRef.current) return;
        // Build plain text version
        let text = `Weekly Program Update — W${selectedWeek}-${selectedYear}\n`;
        text += `Date: ${formatDate(now)}\n\n`;

        text += `1. Resource Update\n`;
        text += `   • Headcount: ${totalHC} | Effort: ${totalEffort.toFixed(1)} | Billable: ${totalBillable.toFixed(1)} | NBR: ${totalNBR.toFixed(1)} | Available (non-bill): ${available.length + backup.length}\n`;
        if (resigning.length > 0) text += `   • Ramp-down:\n${resigning.map(r => `     - ${r.name} (${r.role})`).join("\n")}\n`;
        if (recentJoiners.length > 0) text += `   • Ramp-up:\n${recentJoiners.map(r => `     - ${r.name} (${r.role}) — Joined: ${r.join_date}`).join("\n")}\n`;
        if (activeCandidates.length > 0) text += `   • Hiring Pipeline: ${activeCandidates.length} active candidates\n`;
        if (activeInterns.length > 0) text += `   • Interns: ${activeInterns.length} active\n`;
        if (riskResources.length > 0) text += `   • Performance Monitoring:\n${riskResources.map(r => `     - ${r.name}: ${r.risk_flag}`).join("\n")}\n`;
        if (customNotes.resourceExtra) text += `   ${stripHtml(customNotes.resourceExtra).replace(/\n/g, '\n   ')}\n`;

        text += `\n2. Program Status\n`;
        text += `   • Overall: ${activeProjects.length} active projects | ${onTrackProjects.length} on-track | ${atRiskProjects.length} at-risk\n`;
        text += `   • Total Effort: ${totalEffort} | Total Billable: ${totalBillable}\n`;
        if (atRiskProjects.length > 0) text += `   • At-Risk Projects:\n${atRiskProjects.map(p => `     - ${p.project_name} (${p.customer}): ${p.delivery_status}`).join("\n")}\n`;
        activeProjects.forEach(p => { text += `   • ${p.project_name} (${p.customer}): ${p.delivery_status}, Progress: ${p.milestone_progress}%\n`; });
        if (customNotes.programExtra) text += `   ${stripHtml(customNotes.programExtra).replace(/\n/g, '\n   ')}\n`;

        text += `\n3. Innovation & S+ Initiatives\n`;
        activeInnovations.forEach(i => { text += `   • ${i.initiative_name} (${i.owner}): ${i.status}\n`; });
        if (completedInnovations.length > 0) text += `   • Completed: ${completedInnovations.map(i => i.initiative_name).join(", ")}\n`;
        if (customNotes.innovationExtra) text += `   ${stripHtml(customNotes.innovationExtra).replace(/\n/g, '\n   ')}\n`;

        text += `\n4. Activities & Best Practices\n`;
        if (inProgressTasks.length > 0) { text += `   In Progress:\n`; inProgressTasks.forEach(t => { text += `   • ${t.title}${t.assignee ? ` (${t.assignee})` : ""}\n`; }); }
        if (reviewTasks.length > 0) { text += `   In Review:\n`; reviewTasks.forEach(t => { text += `   • ${t.title}\n`; }); }
        if (doneTasks.length > 0) text += `   • Completed this period: ${doneTasks.length} tasks\n`;
        if (overdueTasks.length > 0) text += `   ⚠ Overdue: ${overdueTasks.map(t => t.title).join(", ")}\n`;
        if (customNotes.activitiesExtra) text += `   ${stripHtml(customNotes.activitiesExtra).replace(/\n/g, '\n   ')}\n`;

        text += `\n5. Other Updates\n`;
        if (avgCSAT !== "N/A") text += `   • CSAT Average: ${avgCSAT}/10\n`;
        if (avgESAT !== "N/A") text += `   • ESAT Average: ${avgESAT}/10\n`;
        if (lowCSAT.length > 0) text += `   • CSAT Alerts: ${lowCSAT.length} records below 7\n`;
        if (customNotes.otherUpdates) text += `   ${stripHtml(customNotes.otherUpdates).replace(/\n/g, '\n   ')}\n`;

        text += `\nPlease let me know if you need any further details.\nKind regards`;

        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    // ═══ SECTION COMPONENT ═══
    const SectionHeader = ({ num, title, icon: Icon, color }: { num: number; title: string; icon: any; color: string }) => (
        <div className="flex items-center gap-3 mb-4">
            <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center text-white text-sm font-black shadow-sm", color)}>{num}</div>
            <div className="flex items-center gap-2">
                <Icon className="w-4 h-4 text-slate-400" />
                <h3 className="text-sm font-black text-slate-900">{title}</h3>
            </div>
        </div>
    );

    const renderEditableNote = (field: keyof typeof customNotes, placeholder: string) => (
        <div className="mt-3">
            {editingSection === field ? (
                <div className="bg-white rounded-lg border border-indigo-200 shadow-sm overflow-hidden mb-2">
                    <ReactQuill theme="snow" value={customNotes[field]} onChange={val => setCustomNotes({ ...customNotes, [field]: val })}
                        modules={quillModules} formats={quillFormats} className="min-h-[100px]" placeholder={placeholder} />
                    <div className="flex justify-end p-2 border-t border-slate-100 bg-slate-50 gap-2">
                        <button onClick={() => setEditingSection(null)} className="px-4 py-1.5 text-xs font-bold text-slate-500 hover:bg-slate-200 rounded-lg">Cancel</button>
                        <button onClick={() => { saveNotes(field, customNotes[field]); setEditingSection(null); }} disabled={isSaving}
                            className="flex items-center gap-1.5 px-4 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-all">
                            {isSaving ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Check className="w-3.5 h-3.5" />} Done
                        </button>
                    </div>
                </div>
            ) : (
                <button
                    onClick={() => setEditingSection(field)}
                    className="w-full text-left flex items-start gap-2 px-3 py-2 rounded-lg border border-dashed border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all group"
                >
                    <Pencil className="w-3 h-3 text-slate-300 group-hover:text-indigo-400 mt-1 shrink-0" />
                    {customNotes[field] && customNotes[field] !== "<p><br></p>" ? (
                        <div className="text-xs text-slate-600 prose prose-slate prose-xs max-w-none prose-p:my-1 prose-ul:my-1" dangerouslySetInnerHTML={{ __html: customNotes[field] }} />
                    ) : (
                        <span className="text-xs text-slate-300 italic pt-0.5">{placeholder}</span>
                    )}
                </button>
            )}
        </div>
    );

    const Bullet = ({ children, indent, warn }: { children: React.ReactNode; indent?: boolean; warn?: boolean }) => (
        <div className={cn("flex items-start gap-2 py-0.5", indent && "ml-5")}>
            <span className={cn("w-1.5 h-1.5 rounded-full shrink-0 mt-1.5", warn ? "bg-red-400" : "bg-slate-300")} />
            <span className="text-xs text-slate-600 leading-relaxed">{children}</span>
        </div>
    );

    // ═══ RENDER ═══
    return (
        <div className="space-y-4">
            {/* Control Bar */}
            <div className="glass-card p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 border-slate-200">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/25">
                        <FileText className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-sm font-black text-slate-900">Program 3 — Weekly Update</h2>
                            <div className="flex items-center gap-1.5">
                                <select
                                    value={selectedWeek}
                                    onChange={e => setSelectedWeek(Number(e.target.value))}
                                    className="text-xs bg-indigo-50 border border-indigo-100 rounded-md px-2 py-0.5 font-black text-indigo-700 outline-none"
                                >
                                    {availableWeeks
                                        .filter(w => w.year === selectedYear)
                                        .map(w => (
                                            <option key={`${w.year}-${w.week}`} value={w.week}>
                                                W{w.week}
                                            </option>
                                        ))
                                    }
                                </select>
                                <select
                                    value={selectedYear}
                                    onChange={e => setSelectedYear(Number(e.target.value))}
                                    className="text-xs bg-indigo-50 border border-indigo-100 rounded-md px-2 py-0.5 font-black text-indigo-700 outline-none"
                                >
                                    {[currentYear - 1, currentYear, currentYear + 1].map(year => (
                                        <option key={year} value={year}>{year}</option>
                                    ))}
                                </select>
                                {selectedWeek === currentWeekNum && selectedYear === currentYear && (
                                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[9px] font-black rounded-full border border-emerald-200">
                                        CURRENT
                                    </span>
                                )}
                            </div>
                        </div>
                        <p className="text-[10px] text-slate-400 font-bold mt-0.5">{formatDate(now)} • Auto-generated from all modules</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={copyReport}
                        className={cn(
                            "flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-black transition-all shadow-sm ring-1 ring-inset",
                            copied
                                ? "bg-emerald-50 ring-emerald-200 text-emerald-600"
                                : "bg-gradient-to-r from-indigo-600 to-blue-600 ring-indigo-700 text-white hover:opacity-95"
                        )}
                    >
                        {copied ? <><Check className="w-3.5 h-3.5" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Copy Report</>}
                    </button>
                    <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold text-slate-600 bg-white ring-1 ring-slate-200 hover:bg-slate-50 shadow-sm">
                        <Printer className="w-3.5 h-3.5" /> Print
                    </button>
                </div>
            </div>

            {/* Report Body */}
            <div ref={reportRef} className="space-y-4 print:space-y-6">

                {/* ═══ 1. RESOURCE UPDATE ═══ */}
                <div className="glass-card p-6 bg-white/60 border-slate-200">
                    <SectionHeader num={1} title="Resource Update" icon={Users} color="bg-blue-600" />

                    {/* Summary Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
                        {[
                            { label: "Headcount", value: totalHC, color: "text-slate-800" },
                            { label: "Total Effort", value: totalEffort.toFixed(1), color: "text-indigo-600" },
                            { label: "Billable HC", value: totalBillable.toFixed(1), color: "text-emerald-600" },
                            { label: "Total NBR", value: totalNBR.toFixed(1), color: "text-rose-600" },
                            { label: "Available (Non-bill)", value: available.length + backup.length, color: "text-blue-600" },
                        ].map(item => (
                            <div key={item.label} className="bg-slate-50/70 rounded-xl p-3 border border-slate-100">
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{item.label}</span>
                                <div className={cn("text-lg font-black mt-0.5", item.color)}>{item.value}</div>
                            </div>
                        ))}
                    </div>

                    {/* Ramp-up */}
                    {(recentJoiners.length > 0 || joinedRecent.length > 0) && (
                        <div className="mb-3">
                            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-1 mb-1.5"><TrendingUp className="w-3 h-3" /> Ramp-up</span>
                            {recentJoiners.map(r => <Bullet key={r.employee_id}><strong>{r.name}</strong> ({r.role}) — Joined {r.join_date}</Bullet>)}
                            {joinedRecent.map(c => <Bullet key={c.candidate_id}><strong>{c.candidate_name}</strong> ({c.role_applied}) — Recently joined</Bullet>)}
                        </div>
                    )}

                    {/* Ramp-down */}
                    {resigning.length > 0 && (
                        <div className="mb-3">
                            <span className="text-[10px] font-black text-red-500 uppercase tracking-widest flex items-center gap-1 mb-1.5"><AlertTriangle className="w-3 h-3" /> Ramp-down</span>
                            {resigning.map(r => <Bullet key={r.employee_id} warn><strong>{r.name}</strong> ({r.role}){r.notes ? ` — ${r.notes}` : ""}</Bullet>)}
                        </div>
                    )}

                    {/* Hiring Pipeline */}
                    {activeCandidates.length > 0 && (
                        <div className="mb-3">
                            <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-1 mb-1.5"><UserCheck className="w-3 h-3" /> Hiring Pipeline</span>
                            {activeCandidates.map(c => <Bullet key={c.candidate_id}><strong>{c.candidate_name}</strong> — {c.role_applied} ({c.interview_status})</Bullet>)}
                        </div>
                    )}

                    {/* Performance Monitoring */}
                    {riskResources.length > 0 && (
                        <div className="mb-3">
                            <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest flex items-center gap-1 mb-1.5"><AlertTriangle className="w-3 h-3" /> Performance Monitoring</span>
                            {riskResources.map(r => <Bullet key={r.employee_id} warn><strong>{r.name}</strong>: {r.risk_flag}</Bullet>)}
                        </div>
                    )}

                    {renderEditableNote("resourceExtra", "✏️ Add extra resource notes (e.g., replacement plans, interview schedules)...")}
                </div>

                {/* ═══ 2. PROGRAM STATUS ═══ */}
                <div className="glass-card p-6 bg-white/60 border-slate-200">
                    <SectionHeader num={2} title="Program Status" icon={Briefcase} color="bg-violet-600" />

                    <Bullet>Overall: the program continues to maintain <strong>{atRiskProjects.length === 0 ? "stable progress" : `progress with ${atRiskProjects.length} project(s) at risk`}</strong>.</Bullet>

                    {/* Project Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                        {activeProjects.map(p => {
                            const statusColor = p.delivery_status === "On Track" ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                                : p.delivery_status === "Critical" ? "bg-red-100 text-red-700 border-red-200"
                                    : "bg-amber-100 text-amber-700 border-amber-200";
                            return (
                                <div key={p.project_id} className="bg-slate-50/60 rounded-xl p-4 border border-slate-100 flex items-center justify-between">
                                    <div>
                                        <div className="text-xs font-bold text-slate-800">{p.project_name}</div>
                                        <div className="text-[10px] text-slate-400 font-bold">{p.customer} • HC: {p.headcount} • Effort: {p.effort}</div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="text-right">
                                            <div className="text-[10px] font-bold text-slate-400">Progress</div>
                                            <div className="text-sm font-black text-indigo-600">{p.milestone_progress}%</div>
                                        </div>
                                        <span className={cn("px-2 py-0.5 rounded-lg text-[9px] font-bold border", statusColor)}>{p.delivery_status}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {renderEditableNote("programExtra", "✏️ Add notes about specific project situations, overtime, performance observations...")}
                </div>

                {/* ═══ 3. INNOVATION ═══ */}
                <div className="glass-card p-6 bg-white/60 border-slate-200">
                    <SectionHeader num={3} title="Innovation & Productivity Improvement" icon={Lightbulb} color="bg-rose-500" />

                    {activeInnovations.length > 0 ? (
                        <div className="space-y-2">
                            {activeInnovations.map(i => (
                                <div key={i.initiative_id} className="flex items-center justify-between bg-slate-50/60 rounded-xl p-3 border border-slate-100">
                                    <div>
                                        <div className="text-xs font-bold text-slate-800">{i.initiative_name}</div>
                                        <div className="text-[10px] text-slate-400 font-bold">Owner: {i.owner} • Type: {i.type}</div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-bold text-indigo-500">Impact: {i.impact_score}/10</span>
                                        <span className={cn("px-2 py-0.5 rounded-lg text-[9px] font-bold border",
                                            i.status === "In Progress" ? "bg-amber-100 text-amber-700 border-amber-200" : "bg-blue-100 text-blue-700 border-blue-200"
                                        )}>{i.status}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <Bullet>Encourage members to apply AI tools to improve effectiveness.</Bullet>
                    )}

                    {completedInnovations.length > 0 && (
                        <div className="mt-3">
                            <Bullet>Completed: <strong>{completedInnovations.map(i => i.initiative_name).join(", ")}</strong></Bullet>
                        </div>
                    )}

                    {renderEditableNote("innovationExtra", "✏️ Add specific innovation updates, AI adoption notes...")}
                </div>

                {/* ═══ 4. ACTIVITIES ═══ */}
                <div className="glass-card p-6 bg-white/60 border-slate-200">
                    <SectionHeader num={4} title="Activities & Best Practices" icon={Clock} color="bg-amber-500" />

                    {inProgressTasks.length > 0 && (
                        <div className="mb-3">
                            <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1.5 block">In Progress</span>
                            {inProgressTasks.map(t => (
                                <Bullet key={t.id}>
                                    <strong>{t.title}</strong>
                                    {t.assignee && <span className="text-slate-400"> ({t.assignee})</span>}
                                    {t.due_date && <span className="text-slate-400"> — Due: {new Date(t.due_date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>}
                                </Bullet>
                            ))}
                        </div>
                    )}

                    {reviewTasks.length > 0 && (
                        <div className="mb-3">
                            <span className="text-[10px] font-black text-violet-600 uppercase tracking-widest mb-1.5 block">In Review</span>
                            {reviewTasks.map(t => <Bullet key={t.id}><strong>{t.title}</strong></Bullet>)}
                        </div>
                    )}

                    {doneTasks.length > 0 && <Bullet>Completed: <strong>{doneTasks.length} tasks</strong> finished this period.</Bullet>}

                    {overdueTasks.length > 0 && (
                        <div className="mt-2 bg-red-50/50 rounded-lg p-3 border border-red-100">
                            <span className="text-[10px] font-black text-red-500 uppercase tracking-widest flex items-center gap-1 mb-1">
                                <AlertTriangle className="w-3 h-3" /> Overdue Tasks
                            </span>
                            {overdueTasks.map(t => <Bullet key={t.id} warn>{t.title}{t.assignee ? ` (${t.assignee})` : ""}</Bullet>)}
                        </div>
                    )}

                    {renderEditableNote("activitiesExtra", "✏️ Add S+ initiatives, CI/CD updates, training activities...")}
                </div>

                {/* ═══ 5. OTHER UPDATES ═══ */}
                <div className="glass-card p-6 bg-white/60 border-slate-200">
                    <SectionHeader num={5} title="Other Updates" icon={Star} color="bg-emerald-600" />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                        {avgCSAT !== "N/A" && (
                            <div className="bg-slate-50/60 rounded-xl p-3 border border-slate-100 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center"><Star className="w-5 h-5 text-amber-500" /></div>
                                <div>
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">CSAT Average</span>
                                    <div className="text-lg font-black text-slate-800">{avgCSAT}<span className="text-sm text-slate-400">/10</span></div>
                                </div>
                                {lowCSAT.length > 0 && <span className="ml-auto text-[9px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded">{lowCSAT.length} alert(s)</span>}
                            </div>
                        )}
                        {avgESAT !== "N/A" && (
                            <div className="bg-slate-50/60 rounded-xl p-3 border border-slate-100 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center"><Smile className="w-5 h-5 text-emerald-500" /></div>
                                <div>
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">ESAT Average</span>
                                    <div className="text-lg font-black text-slate-800">{avgESAT}<span className="text-sm text-slate-400">/10</span></div>
                                </div>
                            </div>
                        )}
                    </div>

                    {activeInterns.length > 0 && (
                        <div className="mb-3">
                            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1.5 block">Active Interns</span>
                            {activeInterns.map(i => <Bullet key={i.candidate_id}><strong>{i.candidate_name}</strong> — {i.role_applied}{i.mentor ? `, Mentor: ${i.mentor}` : ""}</Bullet>)}
                        </div>
                    )}

                    {renderEditableNote("otherUpdates", "✏️ Add proposals, training plans, certifications, cybersecurity updates...")}
                </div>

            </div>
        </div>
    );
}
