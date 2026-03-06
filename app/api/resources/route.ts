import { NextResponse } from "next/server";
import { getResources, saveResources } from "@/lib/data";
import { Resource } from "@/types";

export async function GET() {
    try {
        const resources = getResources();
        return NextResponse.json(resources);
    } catch {
        return NextResponse.json({ error: "Failed to read resources" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body: Resource = await request.json();
        const resources = getResources();
        resources.push(body);
        saveResources(resources);
        return NextResponse.json(body, { status: 201 });
    } catch {
        return NextResponse.json({ error: "Failed to save resource" }, { status: 500 });
    }
}
