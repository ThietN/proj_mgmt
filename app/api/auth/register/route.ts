import { NextResponse } from "next/server";
import { getUserByEmail, saveUser, logAudit } from "@/lib/database";
import { sendEmail } from "@/lib/email";
import bcrypt from "bcryptjs";

const ALLOWED_DOMAIN = "@tma.com.vn";

export async function POST(req: Request) {
    try {
        const { email, password, name, role } = await req.json();

        if (!email || !password || !name) {
            return NextResponse.json({ error: "Vui lòng điền đầy đủ thông tin" }, { status: 400 });
        }

        // Enforce @tma.com.vn domain (server-side)
        if (!email.toLowerCase().endsWith(ALLOWED_DOMAIN)) {
            return NextResponse.json(
                { error: `Chỉ chấp nhận email có domain ${ALLOWED_DOMAIN}` },
                { status: 400 }
            );
        }

        const existing = await getUserByEmail(email);
        if (existing) {
            return NextResponse.json({ error: "Email này đã được đăng ký" }, { status: 400 });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const newUser = {
            id: crypto.randomUUID(),
            email,
            passwordHash,
            name,
            role: "User" as const,
            createdAt: new Date().toISOString(),
            email_verified: true,
            verification_token: null,
        };

        await saveUser(newUser as any);
        await logAudit(email, "CREATE", "User", newUser.id, `User registered: ${email}`);

        // Notify admin of new registration
        const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;
        if (adminEmail) {
            await sendEmail(
                adminEmail,
                "New User Registration",
                `<p>Người dùng mới đã đăng ký: <b>${name}</b> (${email}) lúc ${new Date().toLocaleString("vi-VN")}.<br>Tài khoản đã được kích hoạt ngay sau khi tạo.</p>`
            );
        }

        return NextResponse.json({
            success: true,
            message: "Đăng ký thành công! Bạn có thể đăng nhập ngay."
        });

    } catch (e: any) {
        console.error("[POST /api/auth/register] error:", e, e?.message);
        return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
    }
}

