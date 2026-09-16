import { NextResponse } from "next/server";
import { getUserByVerificationToken, activateUser, logAudit } from "@/lib/database";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    if (!token) {
        return NextResponse.redirect(`${appUrl}/register?error=missing_token`);
    }

    try {
        const user = await getUserByVerificationToken(token);

        if (!user) {
            // Token not found or already used
            return NextResponse.redirect(`${appUrl}/register?error=invalid_token`);
        }

        if (user.email_verified) {
            // Already activated – just send to login
            return NextResponse.redirect(`${appUrl}/login?verified=already`);
        }

        // Activate the account
        await activateUser(user.id);
        await logAudit(user.email, "UPDATE", "User", user.id, "Email verified – account activated");

        return NextResponse.redirect(`${appUrl}/login?verified=true`);
    } catch (e) {
        console.error("[GET /api/auth/verify-email] error:", e);
        return NextResponse.redirect(`${appUrl}/register?error=server_error`);
    }
}
