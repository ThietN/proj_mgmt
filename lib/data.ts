import fs from "fs";
import path from "path";
import {
    Resource,
    Project,
    Candidate,
    SkillEntry,
    ESATRecord,
    CSATRecord,
    Innovation,
} from "@/types";

const dataDir = path.join(process.cwd(), "data");

function readJSON<T>(filename: string): T[] {
    const filePath = path.join(dataDir, filename);
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw) as T[];
}

function writeJSON<T>(filename: string, data: T[]): void {
    const filePath = path.join(dataDir, filename);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
}

// Resources
export function getResources(): Resource[] {
    return readJSON<Resource>("resources.json");
}
export function saveResources(data: Resource[]): void {
    writeJSON("resources.json", data);
}

// Projects
export function getProjects(): Project[] {
    return readJSON<Project>("projects.json");
}
export function saveProjects(data: Project[]): void {
    writeJSON("projects.json", data);
}

// Hiring
export function getHiring(): Candidate[] {
    return readJSON<Candidate>("hiring.json");
}
export function saveHiring(data: Candidate[]): void {
    writeJSON("hiring.json", data);
}

// Skills
export function getSkills(): SkillEntry[] {
    return readJSON<SkillEntry>("skills.json");
}
export function saveSkills(data: SkillEntry[]): void {
    writeJSON("skills.json", data);
}

// ESAT
export function getESAT(): ESATRecord[] {
    return readJSON<ESATRecord>("esat.json");
}
export function saveESAT(data: ESATRecord[]): void {
    writeJSON("esat.json", data);
}

// CSAT
export function getCSAT(): CSATRecord[] {
    return readJSON<CSATRecord>("csat.json");
}
export function saveCSAT(data: CSATRecord[]): void {
    writeJSON("csat.json", data);
}

// Innovations
export function getInnovations(): Innovation[] {
    return readJSON<Innovation>("innovations.json");
}
export function saveInnovations(data: Innovation[]): void {
    writeJSON("innovations.json", data);
}
