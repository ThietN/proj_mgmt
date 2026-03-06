import { NextResponse } from "next/server";
import { getHiring, saveHiring } from "@/lib/data";
import { Candidate } from "@/types";

export async function GET() {
    try {
        const data = getHiring();
        return NextResponse.json(data);
    } catch {
        return NextResponse.json({ error: "Failed to read hiring data" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body: Candidate = await request.json();
        const data = getHiring();
        data.push(body);
        saveHiring(data);
        return NextResponse.json(body, { status: 201 });
    } catch {
        return NextResponse.json({ error: "Failed to save candidate" }, { status: 500 });
    }
}
