import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import {
    acquireDocumentLock,
    releaseDocumentLock,
    extendDocumentLock,
} from "@/lib/database";

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
        const { action, document_id, lock_token } = body;

        if (!document_id) {
            return NextResponse.json({ error: "document_id is required" }, { status: 400 });
        }

        if (action === "acquire") {
            const result = await acquireDocumentLock(document_id, user);
            if (!result.success) {
                return NextResponse.json(result, { status: 409 });
            }
            return NextResponse.json(result);
        }

        if (action === "release") {
            if (!lock_token) {
                return NextResponse.json({ error: "lock_token is required for release" }, { status: 400 });
            }
            const result = await releaseDocumentLock(document_id, lock_token, user.id);
            if (!result.success) {
                return NextResponse.json(result, { status: 400 });
            }
            return NextResponse.json(result);
        }

        if (action === "extend") {
            if (!lock_token) {
                return NextResponse.json({ error: "lock_token is required for extend" }, { status: 400 });
            }
            const result = await extendDocumentLock(document_id, lock_token, user.id);
            if (!result.success) {
                return NextResponse.json(result, { status: 400 });
            }
            return NextResponse.json(result);
        }

        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
    }
}
