import type { Metadata } from "next";
import "./globals.css";
import { LayoutWrapper } from "@/components/layout/LayoutWrapper";

export const metadata: Metadata = {
    title: "TMA- DC12_PG3 – Executive Dashboard",
    description: "Web Management System. Track resources, hiring, skills, delivery health, ESAT, CSAT, and innovations.",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className="light">
            <body className="font-sans bg-slate-50 text-slate-900 antialiased">
                <LayoutWrapper>{children}</LayoutWrapper>
            </body>
        </html>
    );
}
