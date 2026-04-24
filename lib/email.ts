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

export async function sendNotificationEmail(subject: string, html: string) {
  const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;
  
  if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER) {
    console.log("Email config missing. Skipping email send.");
    return;
  }

  try {
    await transporter.sendMail({
      from: `"Team Management System" <${process.env.EMAIL_USER}>`,
      to: adminEmail,
      subject: subject,
      html: html,
    });
    console.log("Notification email sent successfully to", adminEmail);
  } catch (error) {
    console.error("Failed to send notification email:", error);
  }
}
