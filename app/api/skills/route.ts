import { NextResponse } from "next/server";
import { getSkills, saveSkills } from "@/lib/data";
import { SkillEntry } from "@/types";

export async function GET() {
    try {
        const data = getSkills();
        return NextResponse.json(data);
    } catch {
        return NextResponse.json({ error: "Failed to read skills data" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body: SkillEntry = await request.json();
        const data = getSkills();
        data.push(body);
        saveSkills(data);
        return NextResponse.json(body, { status: 201 });
    } catch {
        return NextResponse.json({ error: "Failed to save skill entry" }, { status: 500 });
    }
}
