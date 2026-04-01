"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Users,
    UserCheck,
    Brain,
    Rocket,
    Smile,
    Star,
    Lightbulb,
    Activity,
    ChevronRight,
    FileText,
    Briefcase,
    KanbanSquare,
    ClipboardList,
    BarChart2,
    Calendar,
    MessageSquare,
    Gauge
} from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/resources", label: "Resources", icon: Users },
    { href: "/projects", label: "Projects", icon: Briefcase },
    { href: "/hiring", label: "Hiring & Interns", icon: UserCheck },
    { href: "/skills", label: "Skills Matrix", icon: Brain },
    { href: "/delivery", label: "Delivery", icon: Rocket },
    { href: "/innovations", label: "Innovations", icon: Lightbulb },
    { href: "/tracking", label: "Tracking Tool", icon: KanbanSquare },
    { href: "/report", label: "Weekly Report", icon: ClipboardList },
    { href: "/audit", label: "Audit Logs", icon: FileText },
];

const esatPlatformItems = [
    { href: "/esat-hub", label: "ESAT Hub", icon: Gauge },
    { href: "/esat", label: "ESAT", icon: Smile },
    { href: "/csat", label: "CSAT", icon: Star },
    { href: "/polls", label: "Polls", icon: BarChart2 },
    { href: "/surveys", label: "Surveys", icon: ClipboardList },
    { href: "/events", label: "Events", icon: Calendar },
    { href: "/feedback", label: "Feedback", icon: MessageSquare },
];

export function Sidebar() {
    const pathname = usePathname();
    const [user, setUser] = useState<{ name: string; email: string; role: string } | null>(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await fetch("/api/auth/me");
                if (res.ok) {
                    const data = await res.json();
                    setUser(data.user);
                }
            } catch (err) { }
        };
        fetchUser();
    }, []);

    const initials = user?.name
        ? user.name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase()
        : "??";
    return (
        <aside className="w-60 flex-shrink-0 h-full bg-white border-r border-slate-200 flex flex-col">
            {/* Logo */}
            <div className="px-5 py-5 border-b border-slate-200">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-sky-600 flex items-center justify-center shadow-lg shadow-blue-600/25">
                        <Activity className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <div className="font-bold text-sm text-slate-900 leading-tight">DC12_PG3_MGMT</div>
                        <div className="text-[10px] text-slate-500 leading-tight">Manager Dashboard</div>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
                <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-3 pb-2">
                    Navigation
                </div>
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group relative",
                                isActive
                                    ? "bg-blue-50 text-blue-700 border border-blue-200"
                                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                            )}
                        >
                            {isActive && (
                                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-blue-600 rounded-r-full" />
                            )}
                            <Icon className={cn("w-4 h-4 flex-shrink-0", isActive ? "text-blue-600" : "text-slate-500 group-hover:text-slate-700")} />
                            <span className="flex-1">{item.label}</span>
                            {isActive && <ChevronRight className="w-3 h-3 text-blue-600 opacity-60" />}
                        </Link>
                    );
                })}

                {/* ESAT/CSAT Platform section */}
                <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-3 pt-4 pb-2">
                    ESAT / CSAT Platform
                </div>
                {esatPlatformItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group relative",
                                isActive
                                    ? "bg-violet-50 text-violet-700 border border-violet-200"
                                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                            )}
                        >
                            {isActive && (
                                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-violet-600 rounded-r-full" />
                            )}
                            <Icon className={cn("w-4 h-4 flex-shrink-0", isActive ? "text-violet-600" : "text-slate-500 group-hover:text-slate-700")} />
                            <span className="flex-1">{item.label}</span>
                            {isActive && <ChevronRight className="w-3 h-3 text-violet-600 opacity-60" />}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-slate-200">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow-sm">
                        {initials}
                    </div>
                    <div>
                        <div className="text-xs font-medium text-slate-700">{user?.role || "..."}</div>
                        <div className="text-[10px] text-slate-400 truncate max-w-[120px]" title={user?.email}>
                            {user?.email || "..."}
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    );
}
