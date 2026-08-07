import { NextResponse } from "next/server";
import { getManagedDocumentById } from "@/lib/database";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        if (!id) {
            return NextResponse.json({ error: "Document ID is required" }, { status: 400 });
        }

        const doc = await getManagedDocumentById(id);
        if (!doc) {
            return NextResponse.json({ error: "Document not found" }, { status: 404 });
        }

        return NextResponse.json({ document: doc });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
    }
}
