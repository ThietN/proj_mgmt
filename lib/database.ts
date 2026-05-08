import { unstable_noStore as noStore } from 'next/cache';
import { supabase } from "./supabase";
import {
    Resource,
    Project,
    Candidate,
    SkillEntry,
    ESATRecord,
    CSATRecord,
    Innovation,
    User,
    AuditLog,
    TrackingTask,
    WorkspaceNote,
    TrackingWorkspace,
    WeeklyReportData,
    Poll,
    Survey,
    OrgEvent,
    Feedback,
    Intern,
    InternEvaluation,
    InternStatusHistory,
    InternMetrics,
    BillableResource,
    SkillDefinition,
    SkillMatrixEntry,
    Certification,
    MemberCertification
} from "@/types";

// ==========================================
// RESOURCES
// ==========================================
export async function getResources(): Promise<Resource[]> {
    noStore(); // Prevent Next.js from caching this database call
    const { data, error } = await supabase
        .from('resources')
        .select('*')
        .order('name', { ascending: true });
    if (error) throw new Error(error.message);
    return (data || []).map((r: Resource) => ({
        ...r,
        skills: r.skills || [],
        allocation_percentage: Number(r.allocation_percentage),
        join_date: typeof r.join_date === 'object' && r.join_date !== null && 'toISOString' in r.join_date
            ? (r.join_date as Date).toISOString().split('T')[0]
            : r.join_date
    }));
}

export async function createResource(r: Resource): Promise<void> {
    const { error } = await supabase.from('resources').insert([r]);
    if (error) throw new Error(error.message);
}

export async function updateResource(employee_id: string, updates: Partial<Resource>): Promise<void> {
    // ...existing code...
    const { error } = await supabase
        .from('resources')
        .update(updates)
        .eq('employee_id', employee_id);
    if (error) throw new Error(error.message);
}

export async function deleteResource(id: string): Promise<void> {
    const { error } = await supabase
        .from('resources')
        .delete()
        .eq('employee_id', id);
    if (error) throw new Error(error.message);
}

// ==========================================
// PROJECTS
// ==========================================
export async function getProjects(): Promise<Project[]> {
    noStore(); // Prevent Next.js from caching this database call
    const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('project_name', { ascending: true });
    if (error) throw new Error(error.message);
    return (data || []).map((p: Project) => ({
        ...p,
        headcount: Number(p.headcount),
        effort: Number(p.effort),
        billable: Number(p.billable),
        nbr: Number(p.nbr),
        milestone_progress: Number(p.milestone_progress),
        tech_stack: p.tech_stack || [],
        start_date: typeof p.start_date === 'object' && p.start_date !== null && 'toISOString' in p.start_date
            ? (p.start_date as Date).toISOString().split('T')[0]
            : p.start_date,
        end_date: typeof p.end_date === 'object' && p.end_date !== null && 'toISOString' in p.end_date
            ? (p.end_date as Date).toISOString().split('T')[0]
            : p.end_date
    }));
}

export async function createProject(p: Project): Promise<void> {
    const { error } = await supabase.from('projects').insert([p]);
    if (error) throw new Error(error.message);
}

export async function updateProject(id: string, updates: any) {
    // Use upsert so that if the project doesn't exist in Supabase yet
    // (e.g. was only in projects.json but not yet migrated), it gets inserted.
    // onConflict: 'project_id' → updates existing row, inserts if not found.
    const payload = { ...updates, project_id: id };
    const { data, error } = await supabase
        .from("projects")
        .upsert(payload, { onConflict: "project_id" })
        .select();

    if (error) {
        console.error("[updateProject] Supabase upsert error:", error);
        throw error;
    }
    return data;
}

export async function deleteProject(id: string): Promise<void> {
    const { error } = await supabase
        .from('projects')
        .delete()
        .eq('project_id', id);
    if (error) throw new Error(error.message);
}

// ==========================================
// AUDIT LOGS
// ==========================================
export async function getAuditLogs(): Promise<AuditLog[]> {
    const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(500);
    if (error) throw new Error(error.message);
    return (data || []) as AuditLog[];
}

export async function logAudit(user_id: string, action: string, target_type: string, target_id: string, details: string): Promise<void> {
    const log: AuditLog = {
        id: `A${Date.now()}`,
        user_id,
        action,
        target_type,
        target_id,
        details,
        timestamp: new Date().toISOString()
    };
    const { error } = await supabase.from('audit_logs').insert([log]);
    if (error) throw new Error(error.message);
}

// ==========================================
// ESAT & CSAT
// ==========================================
export async function getESAT(): Promise<ESATRecord[]> {
    const { data, error } = await supabase
        .from('esat_records')
        .select('*');
    if (error) throw new Error(error.message);
    return (data || []).map((e: ESATRecord) => ({ ...e, score: Number(e.score), respondents: Number(e.respondents) }));
}

export async function createESAT(e: ESATRecord): Promise<void> {
    const { error } = await supabase.from('esat_records').insert([e]);
    if (error) throw new Error(error.message);
}

export async function updateESAT(id: string, updates: Partial<ESATRecord>): Promise<void> {
    const { error } = await supabase
        .from('esat_records')
        .update(updates)
        .eq('id', id);
    if (error) throw new Error(error.message);
}

export async function deleteESAT(id: string): Promise<void> {
    const { error } = await supabase
        .from('esat_records')
        .delete()
        .eq('id', id);
    if (error) throw new Error(error.message);
}

export async function getCSAT(): Promise<CSATRecord[]> {
    const { data, error } = await supabase
        .from('csat_records')
        .select('*');
    if (error) throw new Error(error.message);
    return (data || []).map((c: CSATRecord) => ({
        ...c,
        survey_score: Number(c.survey_score),
        survey_date: typeof c.survey_date === 'object' && c.survey_date !== null && 'toISOString' in c.survey_date
            ? (c.survey_date as Date).toISOString().split('T')[0]
            : c.survey_date
    }));
}

export async function createCSAT(c: CSATRecord): Promise<void> {
    const { error } = await supabase.from('csat_records').insert([c]);
    if (error) throw new Error(error.message);
}

export async function updateCSAT(id: string, updates: Partial<CSATRecord>): Promise<void> {
    const { error } = await supabase
        .from('csat_records')
        .update(updates)
        .eq('id', id);
    if (error) throw new Error(error.message);
}

export async function deleteCSAT(id: string): Promise<void> {
    const { error } = await supabase
        .from('csat_records')
        .delete()
        .eq('id', id);
    if (error) throw new Error(error.message);
}

// ==========================================
// INNOVATIONS
// ==========================================
export async function getInnovations(): Promise<Innovation[]> {
    const { data, error } = await supabase
        .from('innovations')
        .select('*');
    if (error) throw new Error(error.message);
    return (data || []).map((i: Innovation) => ({
        ...i,
        impact_score: Number(i.impact_score),
        start_date: typeof i.start_date === 'object' && i.start_date !== null && 'toISOString' in i.start_date
            ? (i.start_date as Date).toISOString().split('T')[0]
            : i.start_date
    }));
}

export async function createInnovation(i: Innovation): Promise<void> {
    const { error } = await supabase.from('innovations').insert([i]);
    if (error) throw new Error(error.message);
}

export async function updateInnovation(id: string, updates: Partial<Innovation>): Promise<void> {
    const { error } = await supabase
        .from('innovations')
        .update(updates)
        .eq('initiative_id', id);
    if (error) throw new Error(error.message);
}

export async function deleteInnovation(id: string): Promise<void> {
    const { error } = await supabase
        .from('innovations')
        .delete()
        .eq('initiative_id', id);
    if (error) throw new Error(error.message);
}

// ==========================================
// HIRING
// ==========================================
export async function getHiring(): Promise<Candidate[]> {
    noStore();
    const { data, error } = await supabase
        .from('candidates')
        .select('*');
    if (error) throw new Error(error.message);
    return (data || []).map((h: Candidate) => ({
        ...h,
        internship_progress: Number(h.internship_progress || 0),
        expected_join_date: typeof h.expected_join_date === 'object' && h.expected_join_date !== null && 'toISOString' in h.expected_join_date
            ? (h.expected_join_date as Date).toISOString().split('T')[0]
            : h.expected_join_date,
        start_date: typeof h.start_date === 'object' && h.start_date !== null && 'toISOString' in h.start_date
            ? (h.start_date as Date).toISOString().split('T')[0]
            : h.start_date,
        end_date: typeof h.end_date === 'object' && h.end_date !== null && 'toISOString' in h.end_date
            ? (h.end_date as Date).toISOString().split('T')[0]
            : h.end_date
    }));
}

export async function createCandidate(h: Candidate): Promise<void> {
    const { error } = await supabase.from('candidates').insert([h]);
    if (error) throw new Error(error.message);
}

export async function updateCandidate(id: string, updates: Partial<Candidate>): Promise<void> {
    const payload = { ...updates, candidate_id: id };
    const { data, error } = await supabase
        .from('candidates')
        .upsert(payload, { onConflict: 'candidate_id' })
        .select();
    if (error) {
        console.error("[updateCandidate] Supabase upsert error:", error);
        throw new Error(error.message);
    }
}

export async function deleteCandidate(id: string): Promise<void> {
    const { error } = await supabase
        .from('candidates')
        .delete()
        .eq('candidate_id', id);
    if (error) throw new Error(error.message);
}

// ==========================================
// SKILLS
// ==========================================
export async function getSkills(): Promise<SkillEntry[]> {
    const { data, error } = await supabase
        .from('skill_entries')
        .select('*');
    if (error) throw new Error(error.message);
    return (data || []) as SkillEntry[];
}

export async function createSkillEntry(s: SkillEntry): Promise<void> {
    const { error } = await supabase.from('skill_entries').insert([s]);
    if (error) throw new Error(error.message);
}

export async function updateSkillEntry(id: string, updates: Partial<SkillEntry>): Promise<void> {
    const { error } = await supabase
        .from('skill_entries')
        .update(updates)
        .eq('id', id);
    if (error) throw new Error(error.message);
}

export async function deleteSkillEntry(id: string): Promise<void> {
    const { error } = await supabase
        .from('skill_entries')
        .delete()
        .eq('id', id);
    if (error) throw new Error(error.message);
}

// ==========================================
// USERS & AUTH
// ==========================================
export async function getUsers(): Promise<User[]> {
    const { data, error } = await supabase
        .from('users')
        .select('*');
    if (error) throw new Error(error.message);
    return (data || []).map((u: any) => ({
        ...u,
        passwordHash: u.password_hash,
        createdAt: typeof u.created_at === 'object' && u.created_at !== null && 'toISOString' in u.created_at
            ? (u.created_at as Date).toISOString()
            : u.created_at
    }));
}

export async function getUserByEmail(email: string): Promise<User | null> {
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email);
    if (error) throw new Error(error.message);
    if (!data || data.length === 0) return null;
    const u = data[0];
    return {
        ...u,
        passwordHash: u.password_hash,
        createdAt: typeof u.created_at === 'object' && u.created_at !== null && 'toISOString' in u.created_at
            ? (u.created_at as Date).toISOString()
            : u.created_at
    } as User;
}

export async function saveUser(u: User): Promise<void> {
    const { passwordHash, createdAt, ...rest } = u;
    const { error } = await supabase.from('users').upsert([{
        ...rest,
        password_hash: passwordHash,
        created_at: createdAt
    }], { onConflict: 'id' });
    if (error) throw new Error(error.message);
}

export async function deleteUser(id: string): Promise<void> {
    const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id);
    if (error) throw new Error(error.message);
}

// ==========================================
// TRACKING TASKS (Kanban)
// ==========================================
export async function getTrackingTasks(): Promise<TrackingTask[]> {
    noStore();
    const { data, error } = await supabase
        .from('tracking_tasks')
        .select('*')
        .order('order_index', { ascending: true });
    if (error) throw new Error(error.message);
    return (data || []).map((t: any) => ({
        ...t,
        order_index: Number(t.order_index || 0),
        labels: t.labels || [],
        due_date: typeof t.due_date === 'object' && t.due_date !== null && 'toISOString' in t.due_date
            ? (t.due_date as Date).toISOString().split('T')[0]
            : t.due_date
    }));
}

export async function createTrackingTask(t: TrackingTask): Promise<void> {
    const { error } = await supabase.from('tracking_tasks').insert([t]);
    if (error) throw new Error(error.message);
}

export async function updateTrackingTask(id: string, updates: Partial<TrackingTask>): Promise<void> {
    const { error } = await supabase
        .from('tracking_tasks')
        .update(updates)
        .eq('id', id);
    if (error) {
        console.error("[updateTrackingTask] Supabase update error:", error);
        throw new Error(error.message);
    }
}

export async function deleteTrackingTask(id: string): Promise<void> {
    const { error } = await supabase
        .from('tracking_tasks')
        .delete()
        .eq('id', id);
    if (error) throw new Error(error.message);
}

// ==========================================
// WORKSPACE NOTES
// ==========================================
export async function getWorkspaceNotes(): Promise<WorkspaceNote[]> {
    noStore();
    const { data, error } = await supabase
        .from('workspace_notes')
        .select('*');
    if (error) throw new Error(error.message);
    return (data || []) as WorkspaceNote[];
}

export async function upsertWorkspaceNote(note: WorkspaceNote): Promise<void> {
    const { error } = await supabase
        .from('workspace_notes')
        .upsert([note], { onConflict: 'id' });
    if (error) throw new Error(error.message);
}

// ==========================================
// TRACKING WORKSPACES
// ==========================================
export async function getTrackingWorkspaces(userId?: string, role?: string): Promise<TrackingWorkspace[]> {
    noStore();
    let query = supabase
        .from('tracking_workspaces')
        .select('*');

    // Visibility logic:
    // 1. SuperAdmin sees all
    // 2. Others see only what they created or what is shared with them
    if (userId && role !== 'SuperAdmin') {
        query = query.or(`created_by.eq.${userId},shared_with.cs.{${userId}}`);
    }

    const { data, error } = await query.order('created_at', { ascending: true });
    if (error) throw new Error(error.message);
    return (data || []) as TrackingWorkspace[];
}

export async function createTrackingWorkspace(ws: Partial<TrackingWorkspace>): Promise<void> {
    const { error } = await supabase.from('tracking_workspaces').insert([ws]);
    if (error) throw new Error(error.message);
}

export async function updateTrackingWorkspace(id: string, updates: Partial<TrackingWorkspace>): Promise<void> {
    const { error } = await supabase
        .from('tracking_workspaces')
        .update(updates)
        .eq('id', id);
    if (error) throw new Error(error.message);
}

export async function deleteTrackingWorkspace(id: string): Promise<void> {
    // Also delete related tasks and notes
    await supabase.from('tracking_tasks').delete().eq('project_id', id);
    await supabase.from('workspace_notes').delete().eq('project_id', id);
    const { error } = await supabase.from('tracking_workspaces').delete().eq('id', id);
    if (error) throw new Error(error.message);
}

// ==========================================
// WEEKLY REPORTS
// ==========================================
export async function getWeeklyReports(): Promise<WeeklyReportData[]> {
    noStore();
    const { data, error } = await supabase
        .from('weekly_reports')
        .select('*')
        .order('year', { ascending: false })
        .order('week_number', { ascending: false });
    if (error) {
        if (error.message.includes('Could not find the table')) {
            console.warn("Table 'weekly_reports' is missing. Please create it in Supabase.");
            return [];
        }
        throw new Error(error.message);
    }
    return (data || []) as WeeklyReportData[];
}

export async function upsertWeeklyReport(report: WeeklyReportData): Promise<void> {
    const { error } = await supabase
        .from('weekly_reports')
        .upsert([report], { onConflict: 'id' });
    if (error) throw new Error(error.message);
}

// ==========================================
// POLLS
// ==========================================
export async function getPolls(): Promise<Poll[]> {
    noStore();
    const { data, error } = await supabase
        .from('polls')
        .select('*')
        .order('created_at', { ascending: false });
    if (error) {
        if (error.message.includes('Could not find the table') || error.code === '42P01') return [];
        throw new Error(error.message);
    }
    return (data || []) as Poll[];
}

export async function createPoll(poll: Omit<Poll, 'id' | 'created_at' | 'updated_at' | 'total_votes'>): Promise<Poll> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { created_at, updated_at, ...cleanPoll } = poll as any;
    const { data, error } = await supabase.from('polls').insert([{ ...cleanPoll, total_votes: 0 }]).select().single();
    if (error) throw new Error(error.message);
    return data as Poll;
}

export async function updatePoll(id: string, updates: Partial<Poll>): Promise<void> {
    // Strip auto-managed / read-only fields before sending to Supabase
    const { id: _id, created_at, updated_at, total_votes, ...safeUpdates } = updates as any;
    const { error } = await supabase.from('polls').update(safeUpdates).eq('id', id);
    if (error) throw new Error(error.message);
}

export async function deletePoll(id: string): Promise<void> {
    const { error } = await supabase.from('polls').delete().eq('id', id);
    if (error) throw new Error(error.message);
}

export async function votePoll(pollId: string, optionId: string): Promise<void> {
    const { data: poll } = await supabase.from('polls').select('*').eq('id', pollId).single();
    if (!poll) throw new Error('Poll not found');
    const options = (poll.options as Poll['options']).map(o =>
        o.id === optionId ? { ...o, votes: (o.votes || 0) + 1 } : o
    );
    const totalVotes = options.reduce((s, o) => s + o.votes, 0);
    const { error } = await supabase.from('polls').update({ options, total_votes: totalVotes }).eq('id', pollId);
    if (error) throw new Error(error.message);
}

// ==========================================
// SURVEYS
// ==========================================
export async function getSurveys(): Promise<Survey[]> {
    noStore();
    const { data, error } = await supabase
        .from('surveys')
        .select('*')
        .order('created_at', { ascending: false });
    if (error) {
        if (error.message.includes('Could not find the table') || error.code === '42P01') return [];
        throw new Error(error.message);
    }
    return (data || []) as Survey[];
}

export async function createSurvey(survey: Omit<Survey, 'id' | 'created_at' | 'updated_at' | 'response_count'>): Promise<Survey> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { created_at, updated_at, ...cleanSurvey } = survey as any;
    const { data, error } = await supabase.from('surveys').insert([{ ...cleanSurvey, response_count: 0 }]).select().single();
    if (error) throw new Error(error.message);
    return data as Survey;
}

export async function updateSurvey(id: string, updates: Partial<Survey>): Promise<void> {
    const { id: _id, created_at, updated_at, response_count, participation_rate, ...safeUpdates } = updates as any;
    const { error } = await supabase.from('surveys').update(safeUpdates).eq('id', id);
    if (error) throw new Error(error.message);
}

export async function deleteSurvey(id: string): Promise<void> {
    const { error } = await supabase.from('surveys').delete().eq('id', id);
    if (error) throw new Error(error.message);
}

// ==========================================
// EVENTS
// ==========================================
export async function getEvents(): Promise<OrgEvent[]> {
    noStore();
    const { data, error } = await supabase
        .from('org_events')
        .select('*')
        .order('event_date', { ascending: true });
    if (error) {
        if (error.message.includes('Could not find the table') || error.code === '42P01') return [];
        throw new Error(error.message);
    }
    return (data || []) as OrgEvent[];
}

export async function createEvent(event: Omit<OrgEvent, 'id' | 'created_at' | 'updated_at' | 'rsvp_count'>): Promise<OrgEvent> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { created_at, updated_at, ...cleanEvent } = event as any;
    const { data, error } = await supabase.from('org_events').insert([{ ...cleanEvent, rsvp_count: 0 }]).select().single();
    if (error) throw new Error(error.message);
    return data as OrgEvent;
}

export async function updateEvent(id: string, updates: Partial<OrgEvent>): Promise<void> {
    const { id: _id, created_at, updated_at, rsvp_count, attended_count, ...safeUpdates } = updates as any;
    const { error } = await supabase.from('org_events').update(safeUpdates).eq('id', id);
    if (error) throw new Error(error.message);
}

export async function deleteEvent(id: string): Promise<void> {
    const { error } = await supabase.from('org_events').delete().eq('id', id);
    if (error) throw new Error(error.message);
}

// ==========================================
// FEEDBACK
// ==========================================
export async function getFeedback(): Promise<Feedback[]> {
    noStore();
    const { data, error } = await supabase
        .from('feedback')
        .select('*')
        .order('created_at', { ascending: false });
    if (error) {
        if (error.message.includes('Could not find the table') || error.code === '42P01') return [];
        throw new Error(error.message);
    }
    return (data || []) as Feedback[];
}

export async function createFeedback(fb: Omit<Feedback, 'id' | 'created_at' | 'updated_at'>): Promise<Feedback> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { created_at, updated_at, ...cleanFb } = fb as any;
    const { data, error } = await supabase.from('feedback').insert([cleanFb]).select().single();
    if (error) throw new Error(error.message);
    return data as Feedback;
}

export async function updateFeedback(id: string, updates: Partial<Feedback>): Promise<void> {
    const { id: _id, created_at, updated_at, submitted_by, ...safeUpdates } = updates as any;
    const { error } = await supabase.from('feedback').update(safeUpdates).eq('id', id);
    if (error) throw new Error(error.message);
}

export async function deleteFeedback(id: string): Promise<void> {
    const { error } = await supabase.from('feedback').delete().eq('id', id);
    if (error) throw new Error(error.message);
}

// ==========================================
// ATTENDANCE / WORK TRACKER
// ==========================================

export async function batchInsertAttendance(records: any[]) {
    const { data, error } = await supabase
        .from('attendance_records')
        .insert(records);
    if (error) throw error;
    return data;
}

export async function clearAttendanceRecords() {
    const { error } = await supabase
        .from('attendance_records')
        .delete()
        .neq('username', 'DUMMY_NEVER_MATCH'); // use text column to avoid enum error
    if (error) {
        console.error("Error clearing attendance records:", error);
        throw error;
    }
}

export async function logAttendanceUpload(log: any) {
    const { error } = await supabase
        .from('attendance_uploads')
        .insert([log]);
    if (error) throw error;
}

export async function getAttendanceStats(filters: any = {}): Promise<any> {
    noStore();
    let query = supabase.from('attendance_records').select('status, tracking_date', { count: 'exact' });

    if (filters.startDate && filters.endDate) {
        query = query.gte('tracking_date', filters.startDate).lte('tracking_date', filters.endDate);
    }
    if (filters.project) query = query.eq('project', filters.project);
    if (filters.status) query = query.eq('status', filters.status);

    const { data, count, error } = await query;
    if (error) throw error;

    const dates = data?.map((r: any) => r.tracking_date).filter(Boolean) || [];
    const minDate = dates.length > 0 ? dates.reduce((a: string, b: string) => a < b ? a : b) : null;
    const maxDate = dates.length > 0 ? dates.reduce((a: string, b: string) => a > b ? a : b) : null;

    const stats = {
        total: count || 0,
        late: data?.filter((r: any) => r.status === 'LATE').length || 0,
        notAccess: data?.filter((r: any) => r.status === 'NOT_ACCESS').length || 0,
        onTime: data?.filter((r: any) => r.status === 'ON_TIME').length || 0,
        invalid: data?.filter((r: any) => r.status === 'INVALID').length || 0,
        startDate: minDate,
        endDate: maxDate
    };

    return stats;
}

export async function getTopLateMembers(limit: number = 10, filters: any = {}) {
    noStore();
    let query = supabase
        .from('attendance_records')
        .select('username, badge_id, employee_name, status, tracking_date, check_in_time, dc_name')
        .eq('status', 'LATE');

    if (filters.startDate && filters.endDate) {
        query = query.gte('tracking_date', filters.startDate).lte('tracking_date', filters.endDate);
    }

    const { data, error } = await query;
    if (error) throw error;

    // Fetch resource locations for mapping
    const { data: resources } = await supabase.from('resources').select('employee_id, location');
    const locationMap: Record<string, string> = {};
    resources?.forEach(r => {
        if (r.employee_id && r.location) {
            const cleanId = r.employee_id.toString().trim();
            locationMap[cleanId] = r.location.toString().replace('lab', 'Lab ');
        }
    });

    const map: Record<string, { name: string, details: { date: string, time: string, lab: string }[] }> = {};
    data?.forEach((r: any) => {
        if (!map[r.username]) map[r.username] = { name: r.employee_name, details: [] };
        const bId = r.badge_id?.toString().trim();
        const uName = r.username?.toString().trim();
        const lab = (bId && locationMap[bId]) || (uName && locationMap[uName]) || r.dc_name || 'N/A';
        map[r.username].details.push({ date: r.tracking_date, time: r.check_in_time, lab });
    });

    return Object.entries(map)
        .map(([username, val]) => ({
            username,
            name: val.name,
            count: val.details.length,
            details: val.details.sort((a, b) => b.date.localeCompare(a.date))
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, limit);
}

export async function getTopNotAccessMembers(limit: number = 10, filters: any = {}) {
    noStore();
    let query = supabase
        .from('attendance_records')
        .select('username, badge_id, employee_name, status, tracking_date, check_in_time, dc_name')
        .eq('status', 'NOT_ACCESS');

    if (filters.startDate && filters.endDate) {
        query = query.gte('tracking_date', filters.startDate).lte('tracking_date', filters.endDate);
    }

    const { data, error } = await query;
    if (error) throw error;

    // Fetch resource locations for mapping
    const { data: resources } = await supabase.from('resources').select('employee_id, location');
    const locationMap: Record<string, string> = {};
    resources?.forEach(r => {
        if (r.employee_id && r.location) {
            const cleanId = r.employee_id.toString().trim();
            locationMap[cleanId] = r.location.toString().replace('lab', 'Lab ');
        }
    });

    const map: Record<string, { name: string, details: { date: string, time: string, lab: string }[] }> = {};
    data?.forEach((r: any) => {
        if (!map[r.username]) map[r.username] = { name: r.employee_name, details: [] };
        const bId = r.badge_id?.toString().trim();
        const uName = r.username?.toString().trim();
        const lab = (bId && locationMap[bId]) || (uName && locationMap[uName]) || r.dc_name || 'N/A';
        map[r.username].details.push({ date: r.tracking_date, time: r.check_in_time || "Not Access", lab });
    });

    return Object.entries(map)
        .map(([username, val]) => ({
            username,
            name: val.name,
            count: val.details.length,
            details: val.details.sort((a, b) => b.date.localeCompare(a.date))
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, limit);
}

export async function getAttendanceTrend(days: number = 7) {
    noStore();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
        .from('attendance_records')
        .select('tracking_date, status')
        .gte('tracking_date', startDate.toISOString().split('T')[0]);

    if (error) throw error;

    const trend: Record<string, { date: string, late: number, notAccess: number }> = {};
    data?.forEach((r: any) => {
        const d = r.tracking_date;
        if (!trend[d]) trend[d] = { date: d, late: 0, notAccess: 0 };
        if (r.status === 'LATE') trend[d].late++;
        if (r.status === 'NOT_ACCESS') trend[d].notAccess++;
    });

    return Object.values(trend).sort((a, b) => a.date.localeCompare(b.date));
}

// ==========================================
// INTERN MANAGEMENT
// ==========================================

export async function getInterns(filters: any = {}): Promise<Intern[]> {
    noStore();
    let query = supabase.from('interns').select('*, evaluation:intern_evaluations(*)');

    if (filters.status) query = query.eq('status', filters.status);
    if (filters.project) query = query.eq('project', filters.project);
    if (filters.mentor) query = query.eq('mentor', filters.mentor);
    if (filters.is_billable !== undefined) query = query.eq('is_billable', filters.is_billable);

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;

    let results = (data || []) as Intern[];

    if (filters.final_grade) {
        results = results.filter((i: Intern) => i.evaluation?.final_grade === filters.final_grade);
    }

    return results;
}

export async function getInternMetrics(): Promise<InternMetrics> {
    noStore();
    const { data, error } = await supabase.from('interns').select('status, is_billable');
    if (error) throw error;

    const total = data.length;
    const completed = data.filter((i: any) => i.status === 'Completed').length;
    const inProgress = data.filter((i: any) => i.status === 'In Progress').length;
    const billable = data.filter((i: any) => i.is_billable).length;

    return {
        totalInterns: total,
        inProgress,
        completed,
        convertedToBillable: billable,
        completionRate: total > 0 ? (completed / total) * 100 : 0
    };
}

export async function createIntern(intern: Partial<Intern>) {
    const { error } = await supabase.from('interns').insert([intern]);
    if (error) throw error;
}

export async function updateIntern(id: string, updates: Partial<Intern>) {
    const { error } = await supabase.from('interns').update(updates).eq('id', id);
    if (error) throw error;
}

export async function evaluateIntern(evaluation: Partial<InternEvaluation>) {
    const { error } = await supabase.from('intern_evaluations').upsert([evaluation], { onConflict: 'intern_id' });
    if (error) throw error;
}

export async function convertToBillable(internId: string, project: string, billingRate: number, note?: string): Promise<void> {
    const now = new Date().toISOString();

    try {
        // 1. Get Intern Info & Evaluation
        const { data: intern, error: fetchErr } = await supabase.from('interns').select('*, evaluation:intern_evaluations(*)').eq('id', internId).single();
        if (fetchErr || !intern) throw new Error(`Intern not found: ${fetchErr?.message}`);

        // Check if evaluation exists
        if (!intern.evaluation || (Array.isArray(intern.evaluation) && intern.evaluation.length === 0)) {
            throw new Error("Should evaluate before converting to billable");
        }

        // 2. Update Intern
        const { error: internErr } = await supabase.from('interns').update({
            is_billable: true,
            billable_date: now,
            status: 'Completed',     // Auto-complete the internship
            project: project,        // Sync the final project assignment
        }).eq('id', internId);
        if (internErr) throw new Error(`Failed to update intern: ${internErr.message}`);

        // 3. Create Billable Tracking Record (Exclude 'notes' column as it doesn't exist in this table)
        const { error: billableErr } = await supabase.from('billable_resources').insert({
            intern_id: internId,
            project: project || "Internal",
            billing_rate: billingRate || 500,
            start_billable_date: now
        });
        if (billableErr) throw new Error(`Failed to create billable tracking: ${billableErr.message}`);

        // 4. Automatically create record in core Resource table
        const randomSuffix = Math.floor(Math.random() * 900) + 100; // 100-999
        const badgeId = `Intern0${randomSuffix}`;

        const { error: resourceErr } = await supabase.from('resources').insert({
            employee_id: badgeId,
            name: intern.full_name,
            role: "E",
            team: "mac dinh",
            grade: "L1",
            skills: [],
            english_level: "Intermediate",
            status: "Billable",
            allocation_percentage: 100,
            join_date: now.split('T')[0],
            location: "lab6",
            notes: note || `Converted from intern on ${now.split('T')[0]}`,
            is_ramp_up: true
        });

        if (resourceErr) throw new Error(`Failed to create resource entry: ${resourceErr.message}`);
    } catch (error: any) {
        console.error("Conversion Error:", error);
        throw error;
    }
}

export async function deleteIntern(id: string): Promise<void> {
    const { error } = await supabase.from('interns').delete().eq('id', id);
    if (error) throw error;
}

export async function getInternHistory(intern_id: string): Promise<InternStatusHistory[]> {
    noStore();
    const { data, error } = await supabase
        .from('intern_status_history')
        .select('*')
        .eq('intern_id', intern_id)
        .order('changed_at', { ascending: false });
    if (error) throw error;
    return data as InternStatusHistory[];
}

export async function autoApproveInterns() {
    // This function will be called by a cron/api job
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
        .from('interns')
        .update({ status: 'Completed', completed_date: today })
        .lte('end_date', today)
        .neq('status', 'Completed')
        .select();

    if (error) throw error;
    return data;
}

// ==========================================
// SKILL MATRIX
// ==========================================

export async function getSkillDefinitions(): Promise<SkillDefinition[]> {
    noStore();
    const { data, error } = await supabase
        .from('skill_definitions')
        .select('*')
        .order('name', { ascending: true });
    if (error) throw error;
    return data || [];
}

export async function createSkillDefinition(name: string, category?: string): Promise<void> {
    const { error } = await supabase.from('skill_definitions').insert([{ name, category }]);
    if (error) throw error;
}

export async function deleteSkillDefinition(id: string): Promise<void> {
    const { error } = await supabase.from('skill_definitions').delete().eq('id', id);
    if (error) throw error;
}

export async function getSkillMatrix(): Promise<SkillMatrixEntry[]> {
    noStore();
    const { data, error } = await supabase.from('skill_matrix').select('*');
    if (error) throw error;
    return data || [];
}

export async function updateSkillLevel(employeeId: string, skillId: string, level: string): Promise<void> {
    const { error } = await supabase
        .from('skill_matrix')
        .upsert([{
            employee_id: employeeId,
            skill_id: skillId,
            level,
            updated_at: new Date().toISOString()
        }], { onConflict: 'employee_id,skill_id' });
    if (error) throw error;
}

export async function upsertSkillMatrixBatch(entries: any[]): Promise<void> {
    const { error } = await supabase
        .from('skill_matrix')
        .upsert(entries, { onConflict: 'employee_id,skill_id' });
    if (error) throw error;
}

export async function deleteSkillMatrixEntry(employeeId: string, skillId: string): Promise<void> {
    const { error } = await supabase
        .from('skill_matrix')
        .delete()
        .match({ employee_id: employeeId, skill_id: skillId });
    if (error) throw error;
}

// ==========================================
// CERTIFICATIONS
// ==========================================

export async function getCertifications(): Promise<Certification[]> {
    noStore();
    const { data, error } = await supabase
        .from('certifications')
        .select('*')
        .eq('is_active', true)
        .order('name', { ascending: true });
    if (error) {
        if (error.code === '42P01') return []; // Table doesn't exist yet
        throw new Error(error.message);
    }
    return (data || []) as Certification[];
}

export async function createCertification(c: Certification): Promise<void> {
    const { error } = await supabase.from('certifications').insert([c]);
    if (error) throw new Error(error.message);
}

export async function updateCertification(id: string, updates: Partial<Certification>): Promise<void> {
    const { error } = await supabase
        .from('certifications')
        .update(updates)
        .eq('id', id);
    if (error) throw new Error(error.message);
}

export async function deleteCertification(id: string): Promise<void> {
    const { error } = await supabase
        .from('certifications')
        .update({ is_active: false })
        .eq('id', id);
    if (error) throw new Error(error.message);
}

// ==========================================
// MEMBER CERTIFICATIONS
// ==========================================

export async function getMemberCertifications(filters: any = {}): Promise<MemberCertification[]> {
    noStore();
    let query = supabase
        .from('member_certifications')
        .select(`
            *,
            member:resources(employee_id, name, role, team, project_id),
            certification:certifications(*)
        `)
        .eq('is_active', true);

    if (filters.member_id) query = query.eq('member_id', filters.member_id);
    if (filters.status) query = query.eq('status', filters.status);
    if (filters.certification_id) query = query.eq('certification_id', filters.certification_id);

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) {
        if (error.code === '42P01') return []; // Table doesn't exist yet
        throw new Error(error.message);
    }
    return (data || []) as MemberCertification[];
}

export async function createMemberCertification(mc: MemberCertification): Promise<void> {
    const { error } = await supabase.from('member_certifications').insert([mc]);
    if (error) throw new Error(error.message);
}

export async function updateMemberCertification(id: string, updates: Partial<MemberCertification>): Promise<void> {
    const { error } = await supabase
        .from('member_certifications')
        .update(updates)
        .eq('id', id);
    if (error) throw new Error(error.message);
}

export async function deleteMemberCertification(id: string): Promise<void> {
    const { error } = await supabase
        .from('member_certifications')
        .update({ is_active: false })
        .eq('id', id);
    if (error) throw new Error(error.message);
}
