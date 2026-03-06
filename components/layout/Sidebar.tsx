"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Users,
    UserPlus,
    Brain,
    Rocket,
    Smile,
    Star,
    Lightbulb,
    Activity,
    ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/resources", label: "Resources", icon: Users },
    { href: "/hiring", label: "Hiring & Interns", icon: UserPlus },
    { href: "/skills", label: "Skills Matrix", icon: Brain },
    { href: "/delivery", label: "Delivery", icon: Rocket },
    { href: "/esat", label: "ESAT", icon: Smile },
    { href: "/csat", label: "CSAT", icon: Star },
    { href: "/innovations", label: "Innovations", icon: Lightbulb },
];

export function Sidebar() {
    const pathname = usePathname();
    return (
        <aside className="w-60 flex-shrink-0 h-full bg-[#080810] border-r border-[#1a1a2e] flex flex-col">
            {/* Logo */}
            <div className="px-5 py-5 border-b border-[#1a1a2e]">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
                        <Activity className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <div className="font-bold text-sm text-white leading-tight">DeliveryOS</div>
                        <div className="text-[10px] text-slate-500 leading-tight">Manager Dashboard</div>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
                <div className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider px-3 pb-2">
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
                                    ? "bg-indigo-600/15 text-indigo-400 border border-indigo-500/20"
                                    : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                            )}
                        >
                            {isActive && (
                                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-indigo-500 rounded-r-full" />
                            )}
                            <Icon className={cn("w-4 h-4 flex-shrink-0", isActive ? "text-indigo-400" : "text-slate-500 group-hover:text-slate-300")} />
                            <span className="flex-1">{item.label}</span>
                            {isActive && <ChevronRight className="w-3 h-3 text-indigo-500 opacity-60" />}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-[#1a1a2e]">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-xs font-bold text-white">
                        SM
                    </div>
                    <div>
                        <div className="text-xs font-medium text-slate-300">Senior Manager</div>
                        <div className="text-[10px] text-slate-600">manager@company.com</div>
                    </div>
                </div>
            </div>
        </aside>
    );
}
