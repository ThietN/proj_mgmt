import { NextResponse } from "next/server";
import { getUserByEmail, logAudit } from "@/lib/database";
import { createToken } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
    try {
        const { email, password } = await req.json();

        if (!email || !password) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }

        const user = await getUserByEmail(email);
        console.log("[LOGIN DEBUG] email:", email);
        console.log("[LOGIN DEBUG] user found:", user ? "YES" : "NO");
        console.log("[LOGIN DEBUG] user data:", JSON.stringify(user, null, 2));

        if (!user) {
            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
        }

        console.log("[LOGIN DEBUG] password input:", password);
        console.log("[LOGIN DEBUG] passwordHash from DB:", user.passwordHash);
        const isValid = await bcrypt.compare(password, user.passwordHash);
        console.log("[LOGIN DEBUG] bcrypt.compare result:", isValid);
        if (!isValid) {
            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
        }

        await logAudit(email, "LOGIN", "System", "NA", "User logged in");

        const token = await createToken({ id: user.id, email: user.email, name: user.name, role: user.role });

        const response = NextResponse.json({ success: true, user: { name: user.name, email: user.email, role: user.role } });
        response.cookies.set("auth_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 // 1 day
        });

        return response;
    } catch (e) {
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
