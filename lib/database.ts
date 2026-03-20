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
    TrackingWorkspace
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
    const payload = { ...updates, id };
    const { error } = await supabase
        .from('tracking_tasks')
        .upsert(payload, { onConflict: 'id' })
        .select();
    if (error) {
        console.error("[updateTrackingTask] Supabase upsert error:", error);
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
export async function getTrackingWorkspaces(): Promise<TrackingWorkspace[]> {
    noStore();
    const { data, error } = await supabase
        .from('tracking_workspaces')
        .select('*')
        .order('created_at', { ascending: true });
    if (error) throw new Error(error.message);
    return (data || []) as TrackingWorkspace[];
}

export async function createTrackingWorkspace(ws: TrackingWorkspace): Promise<void> {
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
