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
