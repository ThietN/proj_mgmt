import { NextResponse } from "next/server";
import { getMemberCertifications, createMemberCertification, updateMemberCertification, deleteMemberCertification, logAudit } from "@/lib/database";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const member_id = searchParams.get("member_id");
        const status = searchParams.get("status");
        
        const filters: any = {};
        if (member_id) filters.member_id = member_id;
        if (status) filters.status = status;

        const data = await getMemberCertifications(filters);
        return NextResponse.json({ success: true, memberCertifications: data });
    } catch (e) {
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("auth_token")?.value;
        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const decoded = await verifyToken(token);
        if (!decoded) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

        const body = await req.json();
        const newMc = {
            ...body,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            created_by: decoded.id
        };

        await createMemberCertification(newMc);

        await logAudit(
            decoded.email as string,
            "CREATE",
            "MemberCertification",
            newMc.member_id,
            `Assigned certification ${newMc.certification_id} to member ${newMc.member_id}`
        );

        return NextResponse.json({ success: true, memberCertification: newMc });
    } catch (e: any) {
        return NextResponse.json({ error: e.message || "Server error" }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("auth_token")?.value;
        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const decoded = await verifyToken(token);
        if (!decoded) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

        const body = await req.json();
        const { id, ...updates } = body;

        if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

        await updateMemberCertification(id, { ...updates, updated_at: new Date().toISOString() });

        await logAudit(
            decoded.email as string,
            "UPDATE",
            "MemberCertification",
            id,
            `Updated member certification: ${id}`
        );

        return NextResponse.json({ success: true });
    } catch (e) {
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("auth_token")?.value;
        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const decoded = await verifyToken(token);
        if (!decoded) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

        await deleteMemberCertification(id);

        await logAudit(
            decoded.email as string,
            "DELETE",
            "MemberCertification",
            id,
            `Soft deleted member certification: ${id}`
        );

        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ error: e.message || "Server error" }, { status: 500 });
    }
}
