import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { publishDocumentVersion } from "@/lib/database";

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
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

        const { id: documentId } = await params;
        const body = await req.json();
        const { content, change_summary, lock_token } = body;

        if (!lock_token) {
            return NextResponse.json({ error: "lock_token is required to publish" }, { status: 400 });
        }

        const result = await publishDocumentVersion(
            documentId,
            content || "",
            change_summary || "",
            lock_token,
            user
        );

        if (!result.success) {
            return NextResponse.json(result, { status: 409 });
        }

        return NextResponse.json(result);
    } catch (error: any) {
        return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
    }
}
