import { NextResponse } from "next/server";
import { getHiring, createCandidate, updateCandidate, deleteCandidate, logAudit } from "@/lib/database";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

export async function POST(req: Request) {
    try {
        const token = cookies().get("auth_token")?.value;
        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const decoded = await verifyToken(token);
        if (!decoded) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

        const body = await req.json();
        const candidates = await getHiring();

        const newCandidate = {
            candidate_id: body.candidate_id || `C${1010 + candidates.length}`,
            candidate_name: body.candidate_name || "New Candidate",
            source: body.source || "Referral",
            role_applied: body.role_applied || "Engineer",
            interview_status: body.interview_status || "Applied",
            expected_join_date: body.expected_join_date || new Date().toISOString().split("T")[0],
            mentor: body.mentor || "",
            internship_progress: Number(body.internship_progress) || 0,
            type: body.type || "Candidate"
        };

        await createCandidate(newCandidate as any);

        await logAudit(
            decoded.email as string,
            "CREATE",
            "Hiring",
            newCandidate.candidate_id,
            `Created ${newCandidate.type}: ${newCandidate.candidate_name}`
        );

        return NextResponse.json({ success: true, candidate: newCandidate });
    } catch (e) {
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const token = cookies().get("auth_token")?.value;
        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const decoded = await verifyToken(token);
        if (!decoded) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

        const body = await req.json();
        const { candidate_id, ...updates } = body;

        if (!candidate_id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

        await updateCandidate(candidate_id, updates);

        await logAudit(
            decoded.email as string,
            "UPDATE",
            "Hiring",
            candidate_id,
            `Updated Hiring: ${candidate_id}`
        );

        return NextResponse.json({ success: true });
    } catch (e) {
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const token = cookies().get("auth_token")?.value;
        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const decoded = await verifyToken(token);
        if (!decoded) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

        await deleteCandidate(id);

        await logAudit(
            decoded.email as string,
            "DELETE",
            "Hiring",
            id,
            `Deleted Hiring record: ${id}`
        );

        return NextResponse.json({ success: true });
    } catch (e) {
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
