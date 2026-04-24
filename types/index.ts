// ============================================================
// TypeScript Types / Interfaces for the entire application
// ============================================================

export interface Resource {
    employee_id: string;
    name: string;
    role: string;
    team: string;
    grade: string;
    skills: string[];
    english_level: string;
    status: "Billable" | "Backup" | "Available" | "Maternity Leave" | "Resigning";
    allocation_percentage: number;
    join_date: string;
    risk_flag?: "Low performance" | "Resign risk" | null;
    at_risk_notes?: string;
    location: "lab3" | "lab6";
    notes?: string;
    project_id?: string;
    is_ramp_up?: boolean;
}

export interface Project {
    project_id: string;
    project_name: string;
    customer: string;
    headcount: number;
    effort: number;
    billable: number;
    nbr: number;
    delivery_status: "On Track" | "At Risk" | "Critical" | "Completed";
    risk_level: "Low" | "Medium" | "High";
    milestone_progress: number; // 0-100
    start_date: string;
    end_date: string;
    tech_stack: string[];
    parent_id?: string;
}

export interface Candidate {
    candidate_id: string;
    candidate_name: string;
    source: string;
    role_applied: string;
    interview_status: "Applied" | "Screening" | "Interview" | "Offer" | "Joined" | "Rejected";
    expected_join_date: string;
    mentor?: string;
    internship_progress?: number; // 0-100 (kept for backward compatibility if needed, but we'll calculate dynamically)
    start_date?: string;
    end_date?: string;
    type: "Candidate" | "Intern";
}

export interface SkillDefinition {
    id: string;
    name: string;
    category?: string;
}

export interface SkillMatrixEntry {
    id: string;
    employee_id: string;
    skill_id: string;
    level: "Beginner" | "Intermediate" | "Advanced" | "Expert";
    updated_at: string;
}

export interface SkillEntry {
    id: string; // Unique entry ID
    employee_id: string;
    skill_name: string;
    skill_level: "Beginner" | "Intermediate" | "Advanced" | "Expert";
}

export interface ESATRecord {
    id: string;
    quarter: string; // e.g. "Q1 2024"
    team: string;
    score: number; // 1-10
    respondents: number;
    top_positive: string;
    top_improvement: string;
    comment?: string;
}

export interface CSATRecord {
    id: string;
    record_id?: string;
    project?: string;
    project_id: string;
    customer: string;
    survey_date: string;
    survey_score: number; // 1-10
    feedback?: string;
    action_plan?: string;
}

export interface Innovation {
    initiative_id: string;
    initiative_name: string;
    owner: string;
    type: "AI" | "Automation" | "Framework" | "Research";
    status: "Planning" | "In Progress" | "Completed" | "On Hold";
    impact_score: number; // 1-10
    description: string;
    start_date: string;
}

// Dashboard KPI types
export interface DashboardKPI {
    headcount: number;
    billable_count: number;
    billable_rate: number;
    available_count: number;
    backup_count: number;
    projects_at_risk: number;
    avg_esat: number;
    avg_csat: number;
    active_innovations: number;
}

export interface User {
    id: string;
    email: string;
    passwordHash: string;
    name: string;
    role: "SuperAdmin" | "User";
    createdAt: string;
}

export interface AuditLog {
    id: string;
    user_id: string;
    action: string;
    target_type: string;
    target_id: string;
    details: string;
    timestamp: string;
}

export interface TrackingTask {
    id: string;
    title: string;
    description?: string;
    status: "Backlog" | "To Do" | "In Progress" | "Review" | "Done";
    priority: "Low" | "Medium" | "High" | "Urgent";
    assignee?: string;
    project_id?: string;
    labels?: string[];
    due_date?: string;
    effort?: number; // in hours
    created_at: string;
    updated_at: string;
    order_index: number;
}

export interface WorkspaceNote {
    id: string;
    project_id: string;
    content: string;
    updated_at: string;
}

export interface TrackingWorkspace {
    id: string;
    name: string;
    icon?: string; // emoji
    color?: string;
    created_at: string;
    created_by?: string;
    shared_with?: string[];
}

export interface WeeklyReportData {
    id: string;
    week_number: number;
    year: number;
    resource_notes: string;
    program_notes: string;
    innovation_notes: string;
    activities_notes: string;
    other_notes: string;
    effort_override?: number;
    updated_at: string;
}

// ============================================================
// ESAT PLATFORM TYPES
// ============================================================

export type PollStatus = "Draft" | "Active" | "Closed";
export type PollAudience = "All" | "Department" | "Team" | "Role";

export interface PollOption {
    id: string;
    label: string;
    votes: number;
}

export interface Poll {
    id: string;
    title: string;
    question: string;
    options: PollOption[];
    status: PollStatus;
    is_anonymous: boolean;
    audience: PollAudience;
    audience_value?: string; // e.g. department name
    deadline?: string;
    created_by: string;
    created_at: string;
    updated_at: string;
    total_votes: number;
}

export type QuestionType = "multiple_choice" | "rating" | "nps" | "text" | "checkbox";

export interface SurveyQuestion {
    id: string;
    order_index: number;
    type: QuestionType;
    question: string;
    required: boolean;
    options?: string[]; // for multiple_choice / checkbox
    min_label?: string; // for rating/nps
    max_label?: string;
    skip_logic?: { if_answer: string; go_to: string }; // conditional logic
}

export type SurveyStatus = "Draft" | "Scheduled" | "Active" | "Closed";

export interface Survey {
    id: string;
    title: string;
    description?: string;
    questions: SurveyQuestion[];
    status: SurveyStatus;
    is_anonymous: boolean;
    audience: PollAudience;
    audience_value?: string;
    start_date?: string;
    end_date?: string;
    created_by: string;
    created_at: string;
    updated_at: string;
    response_count: number;
    participation_rate?: number;
}

export type RSVPStatus = "Accepted" | "Declined" | "Maybe" | "Pending";

export interface EventRSVP {
    id: string;
    event_id: string;
    employee_id: string;
    employee_name: string;
    status: RSVPStatus;
    responded_at?: string;
}

export type EventStatus = "Upcoming" | "Ongoing" | "Completed" | "Cancelled";

export interface OrgEvent {
    id: string;
    title: string;
    description?: string;
    event_date: string;
    end_date?: string;
    location?: string;
    meeting_link?: string;
    organizer: string;
    capacity?: number;
    status: EventStatus;
    rsvp_count: number;
    attended_count?: number;
    feedback_enabled: boolean;
    created_at: string;
    updated_at: string;
}

export type FeedbackCategory = "Workplace" | "Management" | "Tools" | "Culture" | "Benefits" | "Other";
export type FeedbackPriority = "Low" | "Medium" | "High" | "Critical";
export type FeedbackStatus = "New" | "In Review" | "Resolved" | "Closed";

export interface FeedbackComment {
    id: string;
    feedback_id: string;
    author: string;
    is_admin: boolean;
    message: string;
    created_at: string;
}

export interface Feedback {
    id: string;
    title: string;
    message: string;
    category: FeedbackCategory;
    priority: FeedbackPriority;
    status: FeedbackStatus;
    is_anonymous: boolean;
    submitted_by?: string; // null if anonymous
    assigned_to?: string;
    admin_response?: string;
    comments?: FeedbackComment[];
    created_at: string;
    updated_at: string;
}

export interface ESATHubStats {
    overall_score: number;
    participation_rate: number;
    active_polls: number;
    active_surveys: number;
    upcoming_events: number;
    open_feedback: number;
    resolved_feedback: number;
    avg_response_time_days: number;
}

// ============================================================
// ATTENDANCE / WORK TRACKER TYPES
// ============================================================

export type AttendanceStatus = "ON_TIME" | "LATE" | "NOT_ACCESS" | "INVALID";

export interface AttendanceRecord {
    id: string;
    employee_name: string;
    username: string;
    badge_id?: string;
    project?: string;
    program?: string;
    dc_name?: string;
    bu_name?: string;
    tracking_date: string; // YYYY-MM-DD
    check_in_time?: string; // HH:mm or "Not Access"
    status: AttendanceStatus;
    created_at: string;
}

export interface AttendanceUploadLog {
    id: string;
    file_name: string;
    rows_processed: number;
    late_count: number;
    not_access_count: number;
    invalid_count: number;
    processing_time_ms: number;
    upload_user: string;
    upload_time: string;
}

export interface AttendanceStats {
    total_records: number;
    late_count: number;
    not_access_count: number;
    on_time_count: number;
    late_rate: number;
    not_access_rate: number;
    start_date?: string;
    end_date?: string;
}

export interface AttendanceRankingMember {
    username: string;
    name: string;
    count: number;
    details: { date: string; time: string }[];
}

// ============================================================
// INTERN MANAGEMENT TYPES
// ============================================================

export type InternStatus = "Scheduled" | "Interview" | "Joined" | "In Progress" | "Completed";
export type FinalGrade = "Excellent" | "Good" | "Fair" | "Average" | "Poor";

export interface Intern {
    id: string;
    full_name: string;
    email: string;
    role?: string;
    project?: string;
    mentor?: string;
    start_date?: string;
    end_date?: string;
    status: InternStatus;
    completed_date?: string;
    is_billable: boolean;
    billable_date?: string;
    university?: string;
    gpa?: number | null;
    english_score?: number | null;
    created_at: string;
    updated_at: string;
    evaluation?: InternEvaluation;
}

export interface InternEvaluation {
    id: string;
    intern_id: string;
    technical_score: number;
    technical_note?: string;
    soft_skill_score: number;
    soft_skill_note?: string;
    attitude_score: number;
    attitude_note?: string;
    english_score: number;
    final_grade: FinalGrade;
    evaluated_by: string;
    evaluated_at: string;
}

export interface InternStatusHistory {
    id: string;
    intern_id: string;
    old_status?: string;
    new_status: string;
    changed_by?: string;
    changed_at: string;
}

export interface BillableResource {
    id: string;
    intern_id: string;
    project?: string;
    billing_rate?: number;
    start_billable_date: string;
    created_at: string;
}

export interface InternMetrics {
    totalInterns: number;
    inProgress: number;
    completed: number;
    convertedToBillable: number;
    completionRate: number;
}
// ============================================================
// CERTIFICATION MANAGEMENT TYPES
// ============================================================

export type CertificationCategory = 
    | "TECHNICAL" 
    | "TESTING" 
    | "CLOUD" 
    | "SECURITY" 
    | "AI" 
    | "DEVOPS" 
    | "MANAGEMENT" 
    | "SOFT_SKILL";

export type CertificationLevel = 
    | "FOUNDATION" 
    | "ASSOCIATE" 
    | "PROFESSIONAL" 
    | "EXPERT";

export type CertificateType = 
    | "INTERNAL" 
    | "EXTERNAL";

export interface Certification {
    id: string;
    name: string;
    code: string;
    provider: string;
    category: CertificationCategory;
    level: CertificationLevel;
    certificate_type: CertificateType;
    validity_period_months?: number;
    cost?: number;
    currency?: string;
    exam_url?: string;
    description?: string;
    is_active: boolean;
    created_at?: string;
    updated_at?: string;
    created_by?: string;
}

export type MemberCertificationStatus = 
    | "PLANNED" 
    | "LEARNING" 
    | "SCHEDULED" 
    | "PASSED" 
    | "FAILED" 
    | "EXPIRED";

export type LearningMethod = 
    | "SELF_STUDY" 
    | "COURSE" 
    | "BOOTCAMP" 
    | "MENTORING";

export type CertificationPriority = 
    | "LOW" 
    | "MEDIUM" 
    | "HIGH";

export interface MemberCertification {
    id: string;
    member_id: string;
    certification_id: string;
    status: MemberCertificationStatus;
    progress_percent: number;
    start_date?: string;
    target_exam_date?: string;
    actual_exam_date?: string;
    expiry_date?: string;
    attempt_count: number;
    score?: number;
    certificate_number?: string;
    certificate_file?: string;
    study_provider?: string;
    learning_method: LearningMethod;
    priority: CertificationPriority;
    manager_note?: string;
    member_note?: string;
    is_mandatory: boolean;
    sponsor?: string;
    estimated_cost?: number;
    actual_cost?: number;
    currency?: string;
    is_active: boolean;
    created_at?: string;
    updated_at?: string;
    created_by?: string;
    
    // Joined data (optional)
    member?: Resource;
    certification?: Certification;
}
