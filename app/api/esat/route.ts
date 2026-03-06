import { NextResponse } from "next/server";
import { getESAT, saveESAT } from "@/lib/data";
import { ESATRecord } from "@/types";

export async function GET() {
    try {
        const data = getESAT();
        return NextResponse.json(data);
    } catch {
        return NextResponse.json({ error: "Failed to read ESAT data" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body: ESATRecord = await request.json();
        const data = getESAT();
        data.push(body);
        saveESAT(data);
        return NextResponse.json(body, { status: 201 });
    } catch {
        return NextResponse.json({ error: "Failed to save ESAT record" }, { status: 500 });
    }
}
