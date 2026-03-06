import { NextResponse } from "next/server";
import { getCSAT, saveCSAT } from "@/lib/data";
import { CSATRecord } from "@/types";

export async function GET() {
    try {
        const data = getCSAT();
        return NextResponse.json(data);
    } catch {
        return NextResponse.json({ error: "Failed to read CSAT data" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body: CSATRecord = await request.json();
        const data = getCSAT();
        data.push(body);
        saveCSAT(data);
        return NextResponse.json(body, { status: 201 });
    } catch {
        return NextResponse.json({ error: "Failed to save CSAT record" }, { status: 500 });
    }
}
