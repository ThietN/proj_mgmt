import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import {
    getManagedDocuments,
    createManagedDocument,
    saveDocumentDraft,
} from "@/lib/database";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const category = searchParams.get("category") || undefined;
        const projectId = searchParams.get("project_id") || undefined;

        const docs = await getManagedDocuments(category, projectId);
        return NextResponse.json({ documents: docs });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("auth_token")?.value;
        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const decoded: any = await verifyToken(token);
        if (!decoded) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

        const user = {
            id: decoded.id || decoded.email,
            name: decoded.name || decoded.email.split("@")[0],
        };

        const body = await req.json();
        const { id, title, category, project_id, content } = body;

        if (!title || !category) {
            return NextResponse.json({ error: "title and category are required" }, { status: 400 });
        }

        const docId = id || `DOC_${Date.now()}`;
        const newDoc = await createManagedDocument({
            id: docId,
            title,
            category,
            project_id,
            content: content || "",
            user,
        });

        return NextResponse.json({ success: true, document: newDoc });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("auth_token")?.value;
        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const decoded: any = await verifyToken(token);
        if (!decoded) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

        const userId = decoded.id || decoded.email;

        const body = await req.json();
        const { document_id, draft_content, lock_token } = body;

        if (!document_id || !lock_token) {
            return NextResponse.json({ error: "document_id and lock_token are required" }, { status: 400 });
        }

        const result = await saveDocumentDraft(document_id, draft_content || "", lock_token, userId);
        if (!result.success) {
            return NextResponse.json(result, { status: 409 });
        }

        return NextResponse.json(result);
    } catch (error: any) {
        return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
    }
}
