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
    status: "Billable" | "Backup" | "Available";
    allocation_percentage: number;
    join_date: string;
    risk_flag?: "Low performance" | "Resign risk" | null;
}

export interface Project {
    project_id: string;
    project_name: string;
    customer: string;
    team_size: number;
    delivery_status: "On Track" | "At Risk" | "Critical" | "Completed";
    risk_level: "Low" | "Medium" | "High";
    milestone_progress: number; // 0-100
    start_date: string;
    end_date: string;
    tech_stack: string[];
}

export interface Candidate {
    candidate_id: string;
    candidate_name: string;
    source: string;
    role_applied: string;
    interview_status: "Applied" | "Screening" | "Interview" | "Offer" | "Joined" | "Rejected";
    expected_join_date: string;
    mentor?: string;
    internship_progress?: number; // 0-100
    type: "Candidate" | "Intern";
}

export interface SkillEntry {
    employee_id: string;
    employee_name: string;
    team: string;
    skill_name: string;
    skill_level: "Beginner" | "Intermediate" | "Advanced" | "Expert";
}

export interface ESATRecord {
    quarter: string; // e.g. "Q1 2024"
    team: string;
    score: number; // 1-10
    comment?: string;
}

export interface CSATRecord {
    record_id: string;
    project: string;
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
