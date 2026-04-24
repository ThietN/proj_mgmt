import { NextResponse } from "next/server";
import { getUserByEmail, saveUser, logAudit } from "@/lib/database";
import { createToken } from "@/lib/auth";
import { sendNotificationEmail } from "@/lib/email";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
    try {
        const { email, password, name, role } = await req.json();

        if (!email || !password || !name) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }

        const existing = await getUserByEmail(email);
        if (existing) {
            return NextResponse.json({ error: "Email exists" }, { status: 400 });
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const newUser = {
            id: crypto.randomUUID(),
            email,
            passwordHash,
            name,
            role: "User",
            createdAt: new Date().toISOString()
        };

        await saveUser(newUser as any);

        await logAudit(email, "CREATE", "User", newUser.id, `User registered: ${email}`);

        // Notify admin about new registration
        await sendNotificationEmail(
            "New User Registered",
            `<p>A new user has registered on the <b>Team Management System</b>:</p>
             <ul>
                <li><b>Name:</b> ${name}</li>
                <li><b>Email:</b> ${email}</li>
                <li><b>Time:</b> ${new Date().toLocaleString()}</li>
             </ul>`
        );

        const token = await createToken({ id: newUser.id, email, name, role: newUser.role as any });

        const response = NextResponse.json({ success: true });
        response.cookies.set("auth_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 // 1 day
        });

        return response;
    } catch (e: any) {
        console.error("[POST /api/auth/register] error:", e, e?.message);
        return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
    }
}
