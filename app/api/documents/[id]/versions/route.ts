import { NextResponse } from "next/server";
import { getDocumentVersions } from "@/lib/database";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: documentId } = await params;
        if (!documentId) {
            return NextResponse.json({ error: "Document ID is required" }, { status: 400 });
        }

        const versions = await getDocumentVersions(documentId);
        return NextResponse.json({ versions });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
    }
}
