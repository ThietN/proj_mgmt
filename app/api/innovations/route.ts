import { NextResponse } from "next/server";
import { getInnovations, saveInnovations } from "@/lib/data";
import { Innovation } from "@/types";

export async function GET() {
    try {
        const data = getInnovations();
        return NextResponse.json(data);
    } catch {
        return NextResponse.json({ error: "Failed to read innovations data" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body: Innovation = await request.json();
        const data = getInnovations();
        data.push(body);
        saveInnovations(data);
        return NextResponse.json(body, { status: 201 });
    } catch {
        return NextResponse.json({ error: "Failed to save innovation" }, { status: 500 });
    }
}
