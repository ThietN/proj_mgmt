import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || "587"),
  secure: process.env.EMAIL_SECURE === "true",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendEmail(to: string, subject: string, html: string) {
  if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER) {
    console.log("Email config missing. Skipping email send.");
    return;
  }

  try {
    await transporter.sendMail({
      from: `"Team Management System" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: subject,
      html: html,
    });
    console.log("Email sent successfully to", to);
  } catch (error) {
    console.error("Failed to send notification email:", error);
  }
}

export async function sendVerificationEmail(to: string, name: string, token: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const verifyUrl = `${appUrl}/api/auth/verify-email?token=${token}`;

  // In development without email config, log the link to console
  if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER) {
    console.log("=== [DEV] Email verification link (no SMTP configured) ===");
    console.log(`Verify URL for ${to}: ${verifyUrl}`);
    console.log("=========================================================");
    return;
  }

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:40px 0;">
        <tr>
          <td align="center">
            <table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
              <!-- Header -->
              <tr>
                <td style="background:linear-gradient(135deg,#1d4ed8,#0ea5e9);padding:32px 40px;text-align:center;">
                  <div style="font-size:28px;font-weight:bold;color:#ffffff;letter-spacing:-0.5px;">DC12_PG3_MGMT</div>
                  <div style="color:#bfdbfe;font-size:13px;margin-top:4px;">Team Management System</div>
                </td>
              </tr>
              <!-- Body -->
              <tr>
                <td style="padding:40px;">
                  <h2 style="margin:0 0 8px;color:#1e293b;font-size:20px;">Kích hoạt tài khoản của bạn</h2>
                  <p style="color:#64748b;font-size:14px;line-height:1.6;margin:0 0 24px;">
                    Xin chào <strong>${name}</strong>,<br>
                    Cảm ơn bạn đã đăng ký. Vui lòng click vào nút bên dưới để xác nhận email và kích hoạt tài khoản.
                  </p>
                  <div style="text-align:center;margin:32px 0;">
                    <a href="${verifyUrl}" style="display:inline-block;background:linear-gradient(135deg,#1d4ed8,#0ea5e9);color:#ffffff;font-weight:bold;font-size:15px;padding:14px 36px;border-radius:8px;text-decoration:none;letter-spacing:0.3px;">
                      ✅ Kích hoạt tài khoản
                    </a>
                  </div>
                  <p style="color:#94a3b8;font-size:12px;line-height:1.6;margin:24px 0 0;border-top:1px solid #e2e8f0;padding-top:20px;">
                    Link này sẽ hết hạn sau <strong>24 giờ</strong>. Nếu bạn không đăng ký tài khoản này, hãy bỏ qua email này.<br><br>
                    Hoặc copy link sau vào trình duyệt:<br>
                    <span style="color:#3b82f6;word-break:break-all;">${verifyUrl}</span>
                  </p>
                </td>
              </tr>
              <!-- Footer -->
              <tr>
                <td style="background:#f8fafc;padding:20px 40px;text-align:center;">
                  <p style="color:#94a3b8;font-size:11px;margin:0;">© 2024 TMA Solutions — DC12 Group 3</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: `"Team Management System" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: "Kích hoạt tài khoản DC12_PG3_MGMT của bạn",
      html: html,
    });
    console.log("Verification email sent to", to);
  } catch (error) {
    console.error("Failed to send verification email:", error);
    throw error;
  }
}
