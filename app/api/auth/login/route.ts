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

        if (!user) {
            return NextResponse.json({ error: "Email hoặc mật khẩu không đúng" }, { status: 401 });
        }

        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) {
            return NextResponse.json({ error: "Email hoặc mật khẩu không đúng" }, { status: 401 });
        }

        // Block login if email not verified
        if (!user.email_verified) {
            return NextResponse.json(
                {
                    error: "Tài khoản chưa được kích hoạt. Vui lòng kiểm tra hộp thư @tma.com.vn và click vào link kích hoạt.",
                    needsVerification: true
                },
                { status: 403 }
            );
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
        console.error("[POST /api/auth/login] error:", e);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

