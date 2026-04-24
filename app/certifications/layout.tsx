"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Gauge, List, Layout, User, Award } from "lucide-react";
import { cn } from "@/lib/utils";

export default function CertificationsLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    const tabs = [
        { href: "/certifications", label: "Dashboard", icon: Gauge, exact: true },
        { href: "/certifications/catalog", label: "Catalog", icon: List },
        { href: "/certifications/tracking", label: "Member Tracking", icon: User },
        { href: "/certifications/my", label: "My Certifications", icon: Award },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">External Certification Management</h1>
                <p className="text-sm text-slate-500 mt-0.5">
                    Plan, track and manage team professional certifications
                </p>
            </div>

            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl w-fit">
                {tabs.map((tab) => {
                    const isActive = pathname ? (tab.exact ? pathname === tab.href : pathname.startsWith(tab.href)) : false;
                    const Icon = tab.icon;
                    return (
                        <Link
                            key={tab.href}
                            href={tab.href}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200",
                                isActive 
                                    ? "bg-white text-blue-600 shadow-sm" 
                                    : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
                            )}
                        >
                            <Icon className={cn("w-4 h-4", isActive ? "text-blue-600" : "text-slate-400")} />
                            {tab.label}
                        </Link>
                    );
                })}
            </div>

            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                {children}
            </div>
        </div>
    );
}
