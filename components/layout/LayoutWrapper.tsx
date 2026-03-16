"use client";
import { usePathname } from "next/navigation";
import { Suspense } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isAuthPage = pathname === "/login" || pathname === "/register";

    if (isAuthPage) {
        return <main>{children}</main>;
    }

    return (
        <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <div className="flex flex-col flex-1 overflow-hidden">
                <Suspense fallback={<div className="h-14 bg-white border-b border-slate-200" />}>
                    <Topbar />
                </Suspense>
                <main className="flex-1 overflow-y-auto p-6 bg-slate-50">
                    <Suspense fallback={<div className="flex items-center justify-center min-h-full">Loading...</div>}>
                        {children}
                    </Suspense>
                </main>
            </div>
        </div>
    );
}
