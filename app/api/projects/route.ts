import { NextResponse } from "next/server";
import { getProjects, saveProjects } from "@/lib/data";
import { Project } from "@/types";

export async function GET() {
    try {
        const projects = getProjects();
        return NextResponse.json(projects);
    } catch {
        return NextResponse.json({ error: "Failed to read projects" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body: Project = await request.json();
        const projects = getProjects();
        projects.push(body);
        saveProjects(projects);
        return NextResponse.json(body, { status: 201 });
    } catch {
        return NextResponse.json({ error: "Failed to save project" }, { status: 500 });
    }
}
