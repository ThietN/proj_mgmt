import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";

export const metadata: Metadata = {
    title: "DeliveryOS – Senior Manager Dashboard",
    description: "Web Management System for Senior Delivery Managers. Track resources, hiring, skills, delivery health, ESAT, CSAT, and innovations.",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className="dark">
            <body className="font-sans bg-[#0a0a0f] text-slate-100 antialiased">
                <div className="flex h-screen overflow-hidden">
                    <Sidebar />
                    <div className="flex flex-col flex-1 overflow-hidden">
                        <Topbar />
                        <main className="flex-1 overflow-y-auto p-6 bg-[#0a0a0f]">
                            {children}
                        </main>
                    </div>
                </div>
            </body>
        </html>
    );
}
