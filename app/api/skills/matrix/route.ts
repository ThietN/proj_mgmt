import { NextResponse } from "next/server";
import { getSkillMatrix, updateSkillLevel, upsertSkillMatrixBatch, deleteSkillMatrixEntry } from "@/lib/database";

export async function GET() {
    try {
        const matrix = await getSkillMatrix();
        return NextResponse.json(matrix);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { employee_id, skill_id, level, batch } = body;

        if (batch && Array.isArray(batch)) {
            await upsertSkillMatrixBatch(batch);
            return NextResponse.json({ success: true });
        }

        if (!employee_id || !skill_id || !level) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        await updateSkillLevel(employee_id, skill_id, level);
        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const employee_id = searchParams.get("employee_id");
        const skill_id = searchParams.get("skill_id");

        if (!employee_id || !skill_id) {
            return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
        }

        await deleteSkillMatrixEntry(employee_id, skill_id);
        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
