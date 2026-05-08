"use client";
import { Resource, Project, Innovation, CSATRecord, ESATRecord, Candidate, TrackingTask, TrackingWorkspace, WeeklyReportData } from "@/types";
import { useState, useMemo, useRef, useEffect, ReactNode } from "react";
import { cn } from "@/lib/utils";
import {
    Users, Briefcase, Lightbulb, Star, Smile, UserCheck,
    Copy, Check, Printer, Calendar, AlertTriangle, TrendingUp,
    ChevronDown, ChevronRight, Edit2, RefreshCw, Clock, Pencil,
    FileText, GraduationCap, Layout
} from "lucide-react";
import { RichTextEditor } from "@/components/ui/RichTextEditor";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

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
    attendanceStats: any;
    lateRankings: any[];
    notAccessRankings: any[];
    interns: any[];
}

function getWeekNumber(d: Date): number {
    const start = new Date(d.getFullYear(), 0, 1);
    const diff = d.getTime() - start.getTime();
    return Math.ceil((diff / 86400000 + start.getDay() + 1) / 7);
}

function formatDate(d: Date): string {
    return d.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
}

export function ReportClient({
    resources, projects, innovations, csat, esat, hiring,
    trackingTasks, workspaces, pastReports,
    attendanceStats, lateRankings, notAccessRankings, interns
}: ReportClientProps) {
    const router = useRouter();
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentWeekNum = getWeekNumber(now);
    const [selectedWeek, setSelectedWeek] = useState(currentWeekNum);
    const [selectedYear, setSelectedYear] = useState(currentYear);
    const reportRef = useRef<HTMLDivElement>(null);
    const [copied, setCopied] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Filter available weeks
    const availableWeeks = useMemo(() => {
        const weeks = [];
        const startWeek = Math.max(1, currentWeekNum - 12);
        const endWeek = Math.min(52, currentWeekNum + 12);
        for (let w = endWeek; w >= startWeek; w--) weeks.push({ week: w, year: currentYear });
        if (currentWeekNum <= 12) {
            for (let w = 52; w >= 52 - (12 - currentWeekNum); w--) weeks.push({ week: w, year: currentYear - 1 });
        }
        return weeks;
    }, [currentWeekNum, currentYear]);

    // Data Extraction
    // Data Extraction (Synchronized with Projects)
    const totalHC = projects.reduce((s, p) => s + (p.headcount || 0), 0);
    const totalEffort = projects.reduce((s, p) => s + (p.effort || 0), 0);
    const totalBillable = projects.reduce((s, p) => s + (p.billable || 0), 0);
    const totalNonBillable = totalEffort - totalBillable;
    const nbrPercentage = totalEffort > 0 ? (totalNonBillable / totalEffort) * 100 : 0;

    const available = resources.filter(r => r.status === "Available").length;
    const backup = resources.filter(r => r.status === "Backup").length;

    const resigning = resources.filter(r => r.status === "Resigning");
    const riskResources = resources.filter(r => r.risk_flag);
    const recentJoiners = resources.filter(r => r.is_ramp_up);
    const activeCandidates = hiring.filter(c => c.type === "Candidate" && c.interview_status !== "Rejected" && c.interview_status !== "Joined");
    const activeInterns = interns.filter(i => i.status !== "Completed");
    const joinedRecent = hiring.filter(c => c.interview_status === "Joined" && c.type !== "Intern");

    const activeProjects = projects.filter(p => p.delivery_status !== "Completed");
    const atRiskProjects = projects.filter(p => p.delivery_status === "At Risk" || p.delivery_status === "Critical");
    const totalBillableEffort = projects.reduce((s, p) => s + p.billable, 0);

    const activeInnovations = innovations.filter(i => i.status === "In Progress" || i.status === "Planning");
    const completedInnovations = innovations.filter(i => i.status === "Completed");

    const inProgressTasks = trackingTasks.filter(t => t.status === "In Progress");
    const reviewTasks = trackingTasks.filter(t => t.status === "Review");
    const doneTasks = trackingTasks.filter(t => t.status === "Done");
    const overdueTasks = trackingTasks.filter(t => t.due_date && new Date(t.due_date) < now && t.status !== "Done");

    const avgCSAT = csat.length > 0 ? (csat.reduce((s, c) => s + c.survey_score, 0) / csat.length).toFixed(1) : "N/A";
    const avgESAT = esat.length > 0 ? (esat.reduce((s, e) => s + e.score, 0) / esat.length).toFixed(1) : "N/A";
    const lowCSAT = csat.filter(c => c.survey_score < 7);

    // Editable sections
    const [customNotes, setCustomNotes] = useState({
        resourceExtra: "",
        programExtra: "",
        innovationExtra: "",
        activitiesExtra: "",
        hiringExtra: "",
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
                hiringExtra: saved.hiring_notes || "",
                otherUpdates: saved.other_notes || "",
            });
        } else {
            setCustomNotes({ resourceExtra: "", programExtra: "", innovationExtra: "", activitiesExtra: "", hiringExtra: "", otherUpdates: "" });
        }
    }, [selectedWeek, selectedYear, pastReports]);

    async function saveAllData(updates?: Partial<typeof customNotes>) {
        setIsSaving(true);
        const notesToSave = updates || customNotes;

        try {
            const res = await fetch("/api/report", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    week_number: selectedWeek,
                    year: selectedYear,
                    resource_notes: notesToSave.resourceExtra,
                    program_notes: notesToSave.programExtra,
                    innovation_notes: notesToSave.innovationExtra,
                    activities_notes: notesToSave.activitiesExtra,
                    hiring_notes: notesToSave.hiringExtra,
                    other_notes: notesToSave.otherUpdates,
                    effort_override: null,
                })
            });
            
            if (res.ok) {
                toast.success("Progress saved successfully!");
                router.refresh();
                return true;
            } else {
                const data = await res.json();
                toast.error(data.error || "Failed to save progress.");
                return false;
            }
        } catch (e) {
            console.error(e);
            toast.error("An error occurred while saving.");
            return false;
        }
        setIsSaving(false);
    }

    // ═══ COPY TO CLIPBOARD ═══
    const stripHtml = (html: string) => {
        if (!html) return "";
        const tmp = typeof document !== 'undefined' ? document.createElement("DIV") : { innerHTML: "", textContent: "", insertAdjacentHTML: () => { }, querySelectorAll: () => [] };
        tmp.innerHTML = html;
        if ('querySelectorAll' in tmp) {
            tmp.querySelectorAll('p, div, li, br').forEach(el => (el as any).insertAdjacentHTML('afterend', '\n'));
        }
        return (tmp.textContent || "").replace(/\n\s*\n/g, '\n').trim();
    };

    async function copyReport() {
        let text = `Weekly Program Update — W${selectedWeek}-${selectedYear}\n`;
        text += `Date: ${formatDate(now)}\n\n`;

        text += `1. Resource Update\n`;
        text += `   • Headcount: ${totalHC} | Total Effort: ${totalEffort.toFixed(1)} | Billable: ${totalBillable.toFixed(1)} | Non-Billable: ${totalNonBillable.toFixed(1)} | NBR: ${nbrPercentage.toFixed(2)}%\n`;
        if (recentJoiners.length > 0) {
            text += `   • Ramp-up:\n`;
            recentJoiners.forEach(r => {
                const isIntern = r.notes?.toLowerCase().includes("converted from intern");
                text += `     - ${r.name} (${r.role})${isIntern ? " (converted from Internship)" : ""} — Joined: ${r.join_date}\n`;
            });
        }
        if (customNotes.resourceExtra) text += `   ${stripHtml(customNotes.resourceExtra).replace(/\n/g, '\n   ')}\n`;

        text += `\n2. Program Status\n`;
        text += `   • Overall: ${activeProjects.length} active projects | Effort: ${totalEffort.toFixed(1)} | Billable: ${totalBillableEffort.toFixed(1)}\n`;
        activeProjects.forEach(p => { text += `   • ${p.project_name} (${p.customer}): ${p.delivery_status}, Progress: ${p.milestone_progress}%\n`; });
        if (customNotes.programExtra) text += `   ${stripHtml(customNotes.programExtra).replace(/\n/g, '\n   ')}\n`;

        text += `\n3. Innovation & S+\n`;
        activeInnovations.forEach(i => { text += `   • ${i.initiative_name} (${i.owner}): ${i.status}\n`; });
        if (customNotes.innovationExtra) text += `   ${stripHtml(customNotes.innovationExtra).replace(/\n/g, '\n   ')}\n`;

        text += `\n4. Hiring & Internships\n`;
        if (activeCandidates.length > 0) text += `   • Hiring Pipeline: ${activeCandidates.length} active candidates\n`;
        if (activeInterns.length > 0) {
            text += `   • Active Internships: ${activeInterns.length} members\n`;
            activeInterns.forEach(i => {
                let progressStr = "";
                if (i.start_date && i.end_date) {
                    const start = new Date(i.start_date).getTime();
                    const end = new Date(i.end_date).getTime();
                    const current = new Date().getTime();
                    if (end > start) {
                        const progress = Math.min(100, Math.max(0, ((current - start) / (end - start)) * 100));
                        progressStr = ` (Progress: ${Math.round(progress)}%, ${i.start_date} to ${i.end_date})`;
                    }
                }
                let academicStr = "";
                if (i.university) academicStr += ` | ${i.university}`;
                if (i.gpa) academicStr += ` | GPA: ${i.gpa}`;
                if (i.english_score) academicStr += ` | English: ${i.english_score}`;
                
                text += `     - ${i.full_name}${progressStr}${academicStr}\n`;
            });
        }
        if (customNotes.hiringExtra) text += `   ${stripHtml(customNotes.hiringExtra).replace(/\n/g, '\n   ')}\n`;

        text += `\n5. Work Tracker\n`;
        text += `   • Lateness: ${attendanceStats.late || 0} records | Not Access: ${attendanceStats.notAccess || 0}\n`;
        if (lateRankings.length > 0) {
            text += `   • Top Lateness Issues:\n`;
            lateRankings.slice(0, 5).forEach(m => { text += `     - ${m.name}: ${m.count} lates\n`; });
        }

        text += `\n6. Feedback & Governance\n`;
        text += `   • CSAT Average: ${avgCSAT}/10 | ESAT Average: ${avgESAT}/10\n`;
        if (customNotes.otherUpdates) text += `   ${stripHtml(customNotes.otherUpdates).replace(/\n/g, '\n   ')}\n`;

        text += `\n7. Activities & Best Practices\n`;
        if (doneTasks.length > 0) text += `   • Completed this period: ${doneTasks.length} tasks finished\n`;
        if (customNotes.activitiesExtra) text += `   ${stripHtml(customNotes.activitiesExtra).replace(/\n/g, '\n   ')}\n`;

        text += `\nBest regards,\n`;

        await navigator.clipboard.writeText(text);
        toast.success("Report copied to clipboard!");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    const SectionHeader = ({ num, title, icon: Icon, color }: { num: number; title: string; icon: any; color: string }) => (
        <div className="flex items-center gap-3 mb-4">
            <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center text-white text-sm font-black shadow-sm", color)}>{num}</div>
            <div className="flex items-center gap-2">
                <Icon className="w-4 h-4 text-slate-400" />
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">{title}</h3>
            </div>
        </div>
    );

    const renderEditableNote = (field: keyof typeof customNotes, placeholder: string) => (
        <div className="mt-3">
            {editingSection === field ? (
                <div className="bg-white rounded-xl overflow-hidden mb-2">
                    <RichTextEditor
                        value={customNotes[field]}
                        onChange={val => setCustomNotes({ ...customNotes, [field]: val })}
                        placeholder={placeholder}
                        height={120}
                    />
                    <div className="flex justify-end p-2 border-t border-slate-100 bg-slate-50 gap-2">
                        <button onClick={() => setEditingSection(null)} className="px-4 py-1.5 text-xs font-bold text-slate-500 hover:bg-slate-200 rounded-lg">Cancel</button>
                        <button 
                            onClick={async () => { 
                                const success = await saveAllData({ ...customNotes, [field]: customNotes[field] }); 
                                if (success) setEditingSection(null); 
                            }} 
                            disabled={isSaving}
                            className="flex items-center gap-1.5 px-4 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-all"
                        >
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
                        <div className="text-xs rich-content max-w-none" dangerouslySetInnerHTML={{ __html: customNotes[field] }} />
                    ) : (
                        <span className="text-xs text-slate-300 italic pt-0.5">{placeholder}</span>
                    )}
                </button>
            )}
        </div>
    );

    const Bullet = ({ children, indent, warn }: { children: ReactNode; indent?: boolean; warn?: boolean }) => (
        <div className={cn("flex items-start gap-2 py-0.5", indent && "ml-5")}>
            <span className={cn("w-1.5 h-1.5 rounded-full shrink-0 mt-1.5", warn ? "bg-red-400" : "bg-slate-300")} />
            <span className="text-xs text-slate-600 leading-relaxed">{children}</span>
        </div>
    );

    return (
        <div className="space-y-4">
            <div className="glass-card p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 border-slate-200">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/25">
                        <FileText className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-sm font-black text-slate-900">Program 3 — Weekly Update</h2>
                            <div className="flex items-center gap-1.5">
                                <select value={selectedWeek} onChange={e => setSelectedWeek(Number(e.target.value))} className="text-xs bg-indigo-50 border border-indigo-100 rounded-md px-2 py-0.5 font-black text-indigo-700 outline-none">
                                    {availableWeeks.filter(w => w.year === selectedYear).map(w => <option key={`${w.year}-${w.week}`} value={w.week}>W{w.week}</option>)}
                                </select>
                                <select value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))} className="text-xs bg-indigo-50 border border-indigo-100 rounded-md px-2 py-0.5 font-black text-indigo-700 outline-none">
                                    {[currentYear - 1, currentYear, currentYear + 1].map(year => <option key={year} value={year}>{year}</option>)}
                                </select>
                            </div>
                        </div>
                        <p className="text-[10px] text-slate-400 font-bold mt-0.5">{formatDate(now)} • Multi-team Lead Governance</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={copyReport} className={cn("flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-black transition-all shadow-sm ring-1 ring-inset", copied ? "bg-emerald-50 ring-emerald-200 text-emerald-600" : "bg-gradient-to-r from-indigo-600 to-blue-600 ring-indigo-700 text-white hover:opacity-95")}>
                        {copied ? <><Check className="w-3.5 h-3.5" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Copy Report</>}
                    </button>
                    <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold text-slate-600 bg-white ring-1 ring-slate-200 hover:bg-slate-50 shadow-sm"><Printer className="w-3.5 h-3.5" /> Print</button>
                    <button onClick={() => saveAllData()} disabled={isSaving} className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold text-white bg-slate-800 hover:bg-slate-900 shadow-sm disabled:opacity-50">
                        {isSaving ? "Saving..." : <><Check className="w-3.5 h-3.5" /> Save Section</>}
                    </button>
                </div>
            </div>

            <div ref={reportRef} className="space-y-4 print:space-y-6">
                {/* ═══ 1. RESOURCE UPDATE ═══ */}
                <div className="glass-card p-6 bg-white/60 border-slate-200">
                    <SectionHeader num={1} title="Resource Update" icon={Users} color="bg-blue-600" />
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
                        {[
                            { label: "Headcount", value: totalHC.toString(), color: "text-slate-800" },
                            { label: "Total Effort", value: totalEffort.toFixed(1), color: "text-indigo-600" },
                            { label: "Billable", value: totalBillable.toFixed(1), color: "text-emerald-600" },
                            { label: "Non-Billable", value: totalNonBillable.toFixed(1), color: "text-amber-600" },
                            { label: "NBR (%)", value: `${nbrPercentage.toFixed(2)}%`, color: "text-rose-600" },
                        ].map(item => (
                            <div key={item.label} className="bg-slate-50/70 rounded-xl p-3 border border-slate-100 flex flex-col justify-between">
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{item.label}</span>
                                <div className={cn("text-lg font-black mt-1", item.color)}>{item.value}</div>
                            </div>
                        ))}
                    </div>

                    {recentJoiners.length > 0 && (
                        <div className="mb-3">
                            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-1 mb-1.5"><TrendingUp className="w-3 h-3" /> Ramp-up</span>
                            {recentJoiners.map(r => {
                                const isIntern = r.notes?.toLowerCase().includes("converted from intern");
                                return <Bullet key={r.employee_id}><strong>{r.name}</strong> ({r.role}){isIntern && <span className="text-indigo-600 font-bold ml-1">(converted from Internship)</span>} — Joined {r.join_date}</Bullet>
                            })}
                        </div>
                    )}

                    {resigning.length > 0 && (
                        <div className="mb-3">
                            <span className="text-[10px] font-black text-red-500 uppercase tracking-widest flex items-center gap-1 mb-1.5"><AlertTriangle className="w-3 h-3" /> Ramp-down</span>
                            {resigning.map(r => <Bullet key={r.employee_id} warn><strong>{r.name}</strong> ({r.role}) — Resigning</Bullet>)}
                        </div>
                    )}
                    {renderEditableNote("resourceExtra", "✏️ Add resource planning notes...")}
                </div>

                {/* ═══ 2. PROGRAM STATUS ═══ */}
                <div className="glass-card p-6 bg-white/60 border-slate-200">
                    <SectionHeader num={2} title="Program Status" icon={Briefcase} color="bg-violet-600" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                        {activeProjects.map(p => (
                            <div key={p.project_id} className="bg-slate-50/60 rounded-xl p-4 border border-slate-100 shadow-sm">
                                <div className="flex items-center justify-between mb-3">
                                    <div>
                                        <div className="text-xs font-bold text-slate-800">{p.project_name}</div>
                                        <div className="text-[10px] text-slate-400 font-bold">{p.customer} • HC: {p.headcount}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className={cn("text-[10px] font-black px-2 py-0.5 rounded-full border",
                                            p.delivery_status === "On Track" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                                p.delivery_status === "At Risk" ? "bg-amber-50 text-amber-600 border-amber-100" :
                                                    "bg-red-50 text-red-600 border-red-100")}>
                                            {p.delivery_status}
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex justify-between text-[9px] font-black text-slate-400">
                                        <span>PROGRESS</span>
                                        <span>{p.milestone_progress}%</span>
                                    </div>
                                    <div className="w-full bg-slate-200 rounded-full h-1 overflow-hidden">
                                        <div
                                            className={cn("h-full transition-all duration-1000",
                                                p.milestone_progress >= 80 ? "bg-emerald-500" :
                                                    p.milestone_progress >= 50 ? "bg-blue-600" :
                                                        p.milestone_progress >= 30 ? "bg-amber-500" : "bg-red-500")}
                                            style={{ width: `${p.milestone_progress}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    {renderEditableNote("programExtra", "✏️ Add project delivery updates...")}
                </div>

                {/* ═══ 3. INNOVATION ═══ */}
                <div className="glass-card p-6 bg-white/60 border-slate-200">
                    <SectionHeader num={3} title="Innovation & S+" icon={Lightbulb} color="bg-rose-500" />
                    <div className="space-y-2">
                        {activeInnovations.length > 0 ? activeInnovations.map(i => (
                            <div key={i.initiative_id} className="flex items-center justify-between bg-slate-50/60 rounded-xl p-3 border border-slate-100">
                                <div><div className="text-xs font-bold text-slate-800">{i.initiative_name}</div></div>
                                <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[9px] font-bold rounded-lg">{i.status}</span>
                            </div>
                        )) : <Bullet>No major innovation updates this period.</Bullet>}
                    </div>
                    {renderEditableNote("innovationExtra", "✏️ Add innovation details...")}
                </div>

                {/* ═══ 4. HIRING & INTERNS ═══ */}
                <div className="glass-card p-6 bg-white/60 border-slate-200">
                    <SectionHeader num={4} title="Hiring & Internships" icon={GraduationCap} color="bg-indigo-600" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1 block">Recruitment</span>
                            {activeCandidates.length > 0 ? activeCandidates.map(c => <Bullet key={c.candidate_id}><strong>{c.candidate_name}</strong> — {c.interview_status}</Bullet>) : <Bullet>No active recruitment.</Bullet>}
                        </div>
                        <div className="space-y-2">
                            <span className="text-[10px] font-black text-violet-600 uppercase tracking-widest mb-1 block">Interns</span>
                            {activeInterns.map(i => {
                                let progress = 0;
                                let progressStr = "";
                                if (i.start_date && i.end_date) {
                                    const start = new Date(i.start_date).getTime();
                                    const end = new Date(i.end_date).getTime();
                                    const current = new Date().getTime();
                                    if (end > start) {
                                        progress = Math.min(100, Math.max(0, ((current - start) / (end - start)) * 100));
                                        progressStr = ` — Progress: ${Math.round(progress)}% (${i.start_date} to ${i.end_date})`;
                                    }
                                } else if (i.start_date) {
                                    progressStr = ` — Started: ${i.start_date}`;
                                }
                                
                                // New Filtering Logic:
                                // Include if progress < 100
                                // OR if progress is 100 but the end_date is in the selected report week/year
                                let shouldShow = progress < 100;
                                if (!shouldShow && i.end_date) {
                                    const endD = new Date(i.end_date);
                                    const endWeek = getWeekNumber(endD);
                                    const endYear = endD.getFullYear();
                                    if (endWeek === selectedWeek && endYear === selectedYear) {
                                        shouldShow = true;
                                    }
                                }

                                if (!shouldShow) return null;

                                return (
                                    <Bullet key={i.id}>
                                        <strong>{i.full_name}</strong>{progressStr}
                                        {i.university && <> | <span className="text-emerald-600 font-bold">{i.university}</span></>}
                                        {i.gpa && <> | GPA: <span className="text-rose-600 font-bold">{i.gpa}</span></>}
                                        {i.english_score && <> | English: <span className="text-rose-600 font-bold">{i.english_score}</span></>}
                                    </Bullet>
                                );
                            }).filter(Boolean)}
                            {activeInterns.length === 0 && <Bullet>No active interns.</Bullet>}
                        </div>
                    </div>
                    {renderEditableNote("hiringExtra", "✏️ Add hiring updates...")}
                </div>

                {/* ═══ 5. WORK TRACKER ═══ */}
                <div className="glass-card p-6 bg-white/60 border-slate-200">
                    <SectionHeader num={5} title="Work Tracker" icon={Clock} color="bg-amber-500" />
                    <div className="flex items-center gap-6 mb-4 px-1">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Lateness:</span>
                            <span className="text-sm font-black text-red-600">{attendanceStats.late || 0}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Not Access:</span>
                            <span className="text-sm font-black text-orange-600">{attendanceStats.notAccess || 0}</span>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-red-50/50 rounded-xl border border-red-100">
                            <span className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-2 block">Top Lateness</span>
                            {lateRankings.slice(0, 5).map(m => (
                                <div key={m.username} className="flex justify-between items-center py-1 border-b border-red-100/50 last:border-0">
                                    <span className="text-xs font-bold text-slate-700">{m.name}</span>
                                    <span className="text-xs font-black text-red-600">{m.count}</span>
                                </div>
                            ))}
                        </div>
                        <div className="p-4 bg-orange-50/50 rounded-xl border border-orange-100">
                            <span className="text-[10px] font-black text-orange-600 uppercase tracking-widest mb-2 block">Top Not Access</span>
                            {notAccessRankings.slice(0, 5).map(m => (
                                <div key={m.username} className="flex justify-between items-center py-1 border-b border-orange-100/50 last:border-0">
                                    <span className="text-xs font-bold text-slate-700">{m.name}</span>
                                    <span className="text-xs font-black text-orange-600">{m.count}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ═══ 6. FEEDBACK & GOVERNANCE ═══ */}
                <div className="glass-card p-6 bg-white/60 border-slate-200">
                    <SectionHeader num={6} title="Feedback & Governance" icon={Star} color="bg-emerald-600" />
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-slate-50/60 rounded-xl p-3 border border-slate-100">
                            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">CSAT Average</div>
                            <div className="text-lg font-black text-amber-500">{avgCSAT}<span className="text-xs text-slate-400">/10</span></div>
                        </div>
                        <div className="bg-slate-50/60 rounded-xl p-3 border border-slate-100">
                            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">ESAT Average</div>
                            <div className="text-lg font-black text-emerald-500">{avgESAT}<span className="text-xs text-slate-400">/10</span></div>
                        </div>
                    </div>
                </div>

                {/* ═══ 7. ACTIVITIES & BEST PRACTICES ═══ */}
                <div className="glass-card p-6 bg-white/60 border-slate-200">
                    <SectionHeader num={7} title="Activities & Best Practices" icon={Clock} color="bg-cyan-600" />
                    {doneTasks.length > 0 && <Bullet>Completed: <strong>{doneTasks.length} tasks</strong> finished this period.</Bullet>}
                    {renderEditableNote("activitiesExtra", "✏️ Training, CI/CD, specific task updates...")}
                </div>

                {/* ═══ 8. OTHER UPDATES ═══ */}
                <div className="glass-card p-6 bg-white/60 border-slate-200">
                    <SectionHeader num={8} title="Other Updates (Notes)" icon={Layout} color="bg-slate-800" />
                    {renderEditableNote("otherUpdates", "✏️ Lead updates, proposals, risks, cybersecurity...")}
                </div>

            </div>
        </div>
    );
}
