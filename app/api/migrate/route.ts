import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import {
    getResources,
    getProjects,
    getAuditLogs,
    getESAT,
    getCSAT,
    getInnovations,
    getUsers,
    getHiring
} from "@/lib/data";
import { supabase } from "@/lib/supabase";

export async function GET() {
    try {
        console.log("Migration started...");

        // 1. Create Tables
        await sql`
            CREATE TABLE IF NOT EXISTS projects (
                project_id TEXT PRIMARY KEY,
                project_name TEXT NOT NULL,
                customer TEXT NOT NULL,
                headcount DECIMAL(10, 2) DEFAULT 0,
                effort DECIMAL(10, 2) DEFAULT 0,
                billable DECIMAL(10, 2) DEFAULT 0,
                nbr DECIMAL(10, 2) DEFAULT 0,
                delivery_status TEXT DEFAULT 'On Track',
                risk_level TEXT DEFAULT 'Low',
                milestone_progress INTEGER DEFAULT 0,
                start_date DATE NOT NULL,
                end_date DATE NOT NULL,
                tech_stack TEXT[] DEFAULT '{}',
                parent_id TEXT REFERENCES projects(project_id)
            );
        `;

        await sql`
            CREATE TABLE IF NOT EXISTS resources (
                employee_id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                role TEXT NOT NULL,
                team TEXT NOT NULL,
                grade TEXT,
                skills TEXT[] DEFAULT '{}',
                english_level TEXT DEFAULT 'Intermediate',
                status TEXT NOT NULL,
                allocation_percentage INTEGER DEFAULT 100,
                join_date DATE NOT NULL,
                risk_flag TEXT,
                location TEXT NOT NULL,
                notes TEXT,
                project_id TEXT REFERENCES projects(project_id),
                is_ramp_up BOOLEAN DEFAULT FALSE
            );
        `;

        await sql`
            CREATE TABLE IF NOT EXISTS audit_logs (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                action TEXT NOT NULL,
                target_type TEXT NOT NULL,
                target_id TEXT NOT NULL,
                details TEXT,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `;

        await sql`
            CREATE TABLE IF NOT EXISTS esat_records (
                id TEXT PRIMARY KEY,
                quarter TEXT NOT NULL,
                team TEXT NOT NULL,
                score DECIMAL(3, 1) NOT NULL,
                respondents INTEGER DEFAULT 0,
                top_positive TEXT DEFAULT '',
                top_improvement TEXT DEFAULT '',
                comment TEXT
            );
        `;

        await sql`
            CREATE TABLE IF NOT EXISTS csat_records (
                id TEXT PRIMARY KEY,
                project_id TEXT REFERENCES projects(project_id),
                customer TEXT NOT NULL,
                survey_date DATE NOT NULL,
                survey_score DECIMAL(3, 1) NOT NULL,
                feedback TEXT,
                action_plan TEXT
            );
        `;

        await sql`
            CREATE TABLE IF NOT EXISTS innovations (
                initiative_id TEXT PRIMARY KEY,
                initiative_name TEXT NOT NULL,
                owner TEXT NOT NULL,
                type TEXT NOT NULL,
                status TEXT NOT NULL,
                impact_score INTEGER DEFAULT 0,
                description TEXT,
                start_date DATE NOT NULL
            );
        `;

        await sql`
            CREATE TABLE IF NOT EXISTS candidates (
                candidate_id TEXT PRIMARY KEY,
                candidate_name TEXT NOT NULL,
                source TEXT NOT NULL,
                role_applied TEXT NOT NULL,
                interview_status TEXT NOT NULL,
                expected_join_date DATE NOT NULL,
                mentor TEXT,
                internship_progress INTEGER DEFAULT 0,
                type TEXT NOT NULL
            );
        `;

        await sql`
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                name TEXT NOT NULL,
                role TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `;

        // 2. Clear Existing Data (Optional - be careful if running multiple times)
        // await sql`TRUNCATE TABLE resources, projects, audit_logs, esat_records, csat_records, innovations, candidates, users CASCADE;`;

        // 3. Migrate Projects First
        const projects = getProjects();
        for (const p of projects) {
            await sql`
                INSERT INTO projects (
                    project_id, project_name, customer, headcount, effort, billable, nbr, 
                    delivery_status, risk_level, milestone_progress, start_date, end_date, 
                    tech_stack, parent_id
                ) VALUES (
                    ${p.project_id}, ${p.project_name}, ${p.customer}, ${p.headcount}, ${p.effort}, ${p.billable}, ${p.nbr},
                    ${p.delivery_status}, ${p.risk_level}, ${p.milestone_progress}, ${p.start_date}, ${p.end_date},
                    ${p.tech_stack as any}, ${p.parent_id || null}
                ) ON CONFLICT (project_id) DO UPDATE SET
                    project_name = EXCLUDED.project_name,
                    customer = EXCLUDED.customer,
                    headcount = EXCLUDED.headcount,
                    effort = EXCLUDED.effort,
                    billable = EXCLUDED.billable,
                    nbr = EXCLUDED.nbr,
                    delivery_status = EXCLUDED.delivery_status,
                    risk_level = EXCLUDED.risk_level,
                    milestone_progress = EXCLUDED.milestone_progress,
                    start_date = EXCLUDED.start_date,
                    end_date = EXCLUDED.end_date,
                    tech_stack = EXCLUDED.tech_stack,
                    parent_id = EXCLUDED.parent_id;
            `;
        }

        // 4. Migrate Resources
        const resources = getResources();
        for (const r of resources) {
            await sql`
                INSERT INTO resources (
                    employee_id, name, role, team, grade, skills, english_level, status, 
                    allocation_percentage, join_date, risk_flag, location, notes, project_id,
                    is_ramp_up
                ) VALUES (
                    ${r.employee_id}, ${r.name}, ${r.role}, ${r.team}, ${r.grade}, ${r.skills as any},
                    ${r.english_level}, ${r.status}, ${r.allocation_percentage}, ${r.join_date},
                    ${r.risk_flag || null}, ${r.location}, ${r.notes || null}, ${r.project_id || null},
                    ${r.is_ramp_up || false}
                ) ON CONFLICT (employee_id) DO UPDATE SET
                    name = EXCLUDED.name,
                    role = EXCLUDED.role,
                    team = EXCLUDED.team,
                    grade = EXCLUDED.grade,
                    skills = EXCLUDED.skills,
                    english_level = EXCLUDED.english_level,
                    status = EXCLUDED.status,
                    allocation_percentage = EXCLUDED.allocation_percentage,
                    join_date = EXCLUDED.join_date,
                    risk_flag = EXCLUDED.risk_flag,
                    location = EXCLUDED.location,
                    notes = EXCLUDED.notes,
                    project_id = EXCLUDED.project_id,
                    is_ramp_up = EXCLUDED.is_ramp_up;
            `;
        }

        // 5. Migrate ESAT
        const esat = getESAT();
        for (const e of esat) {
            await sql`
                INSERT INTO esat_records (id, quarter, team, score, respondents, top_positive, top_improvement, comment)
                VALUES (${e.id}, ${e.quarter}, ${e.team}, ${e.score}, ${e.respondents}, ${e.top_positive}, ${e.top_improvement}, ${e.comment || null})
                ON CONFLICT (id) DO NOTHING;
            `;
        }

        // 6. Migrate CSAT
        const csat = getCSAT();
        for (const c of csat) {
            await sql`
                INSERT INTO csat_records (id, project_id, customer, survey_date, survey_score, feedback, action_plan)
                VALUES (${c.id}, ${c.project_id}, ${c.customer}, ${c.survey_date}, ${c.survey_score}, ${c.feedback || null}, ${c.action_plan || null})
                ON CONFLICT (id) DO NOTHING;
            `;
        }

        // 7. Migrate Innovations
        const innovations = getInnovations();
        for (const i of innovations) {
            await sql`
                INSERT INTO innovations (initiative_id, initiative_name, owner, type, status, impact_score, description, start_date)
                VALUES (${i.initiative_id}, ${i.initiative_name}, ${i.owner}, ${i.type}, ${i.status}, ${i.impact_score}, ${i.description}, ${i.start_date})
                ON CONFLICT (initiative_id) DO NOTHING;
            `;
        }

        // 8. Migrate Hiring
        const candidates = getHiring();
        for (const h of candidates) {
            await sql`
                INSERT INTO candidates (candidate_id, candidate_name, source, role_applied, interview_status, expected_join_date, mentor, internship_progress, type)
                VALUES (${h.candidate_id}, ${h.candidate_name}, ${h.source}, ${h.role_applied}, ${h.interview_status}, ${h.expected_join_date}, ${h.mentor || null}, ${h.internship_progress || 0}, ${h.type})
                ON CONFLICT (candidate_id) DO NOTHING;
            `;
        }

        // 9. Migrate Users
        const users = getUsers();
        for (const u of users) {
            await sql`
                INSERT INTO users (id, email, password_hash, name, role, created_at)
                VALUES (${u.id}, ${u.email}, ${u.passwordHash}, ${u.name}, ${u.role}, ${u.createdAt})
                ON CONFLICT (id) DO NOTHING;
            `;
        }

        // 10. Migrate Audit Logs
        const logs = getAuditLogs();
        for (const l of logs) {
            await sql`
                INSERT INTO audit_logs (id, user_id, action, target_type, target_id, details, timestamp)
                VALUES (${l.id}, ${l.user_id}, ${l.action}, ${l.target_type}, ${l.target_id}, ${l.details}, ${l.timestamp})
                ON CONFLICT (id) DO NOTHING;
            `;
        }

        return NextResponse.json({ success: true, message: "Migration completed successfully!" });
    } catch (e: any) {
        console.error("Migration failed:", e);
        return NextResponse.json({ success: false, error: e.message || "Unknown error" }, { status: 500 });
    }
}
