import { NextResponse } from "next/server";
import { getCertifications, createCertification, updateCertification, deleteCertification, logAudit } from "@/lib/database";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

export async function GET() {
    try {
        const certs = await getCertifications();
        return NextResponse.json({ success: true, certifications: certs });
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
        const newCert = {
            ...body,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            created_by: decoded.id
        };

        await createCertification(newCert);

        await logAudit(
            decoded.email as string,
            "CREATE",
            "Certification",
            newCert.id || 'new',
            `Added new certification: ${newCert.name}`
        );

        return NextResponse.json({ success: true, certification: newCert });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
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

        await updateCertification(id, { ...updates, updated_at: new Date().toISOString() });

        await logAudit(
            decoded.email as string,
            "UPDATE",
            "Certification",
            id,
            `Updated certification: ${body.name || id}`
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

        await deleteCertification(id);

        await logAudit(
            decoded.email as string,
            "DELETE",
            "Certification",
            id,
            `Soft deleted certification: ${id}`
        );

        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ error: e.message || "Server error" }, { status: 500 });
    }
}
