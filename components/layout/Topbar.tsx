"use client";
import { useState, useEffect } from "react";
import { Bell, Search, Calendar, LogOut, ChevronDown } from "lucide-react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function Topbar() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();

    const currentMonth = searchParams.get("month") || "";
    const currentQuarter = searchParams.get("quarter") || "";

    const [user, setUser] = useState<{ name: string; email: string; role: string } | null>(null);
    const now = new Date();
    const dateStr = now.toLocaleDateString("en-US", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
    });

    const updateFilter = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value) {
            params.set(key, value);
            // If setting one, maybe clear the other for clarity? 
            // Usually month and quarter are nested but for simplicity let's just set.
            if (key === "month") params.delete("quarter");
            if (key === "quarter") params.delete("month");
        } else {
            params.delete(key);
        }
        router.push(`${pathname}?${params.toString()}`);
    };

    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const quarters = ["Q1 (Jan-Mar)", "Q2 (Apr-Jun)", "Q3 (Jul-Sep)", "Q4 (Oct-Dec)"];

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

    async function handleLogout() {
        await fetch("/api/auth/logout", { method: "POST" });
        router.push("/login");
        router.refresh();
    }

    return (
        <header className="h-14 flex-shrink-0 border-b border-slate-200 bg-white/80 backdrop-blur-md flex items-center px-6 gap-4">
            {/* Search */}
            <div className="flex items-center gap-2 flex-1 max-w-sm bg-white border border-slate-200 rounded-lg px-3 py-1.5">
                <Search className="w-3.5 h-3.5 text-slate-500" />
                <input
                    type="text"
                    placeholder="Search..."
                    className="bg-transparent text-sm text-slate-700 placeholder-slate-600 outline-none w-full"
                />
                <kbd className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded font-mono border border-slate-300">
                    Search
                </kbd>
            </div>

            <div className="flex-1" />

            {/* Date & Filters */}
            <div className="hidden lg:flex items-center gap-4">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 border-r border-slate-200 pr-4 mr-2">
                    <Calendar className="w-3.5 h-3.5" />
                    {dateStr}
                </div>

                <div className="flex items-center gap-2">
                    <div className="relative group">
                        <select
                            value={currentMonth}
                            onChange={(e) => updateFilter("month", e.target.value)}
                            className="appearance-none bg-slate-50 border border-slate-200 text-slate-700 text-[11px] font-medium rounded-md pl-2 pr-7 py-1 outline-none hover:border-blue-400 transition-colors cursor-pointer"
                        >
                            <option value="">All Months</option>
                            {months.map((m, i) => (
                                <option key={m} value={(i + 1).toString()}>{m}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
                    </div>

                    <div className="relative group">
                        <select
                            value={currentQuarter}
                            onChange={(e) => updateFilter("quarter", e.target.value)}
                            className="appearance-none bg-slate-50 border border-slate-200 text-slate-700 text-[11px] font-medium rounded-md pl-2 pr-7 py-1 outline-none hover:border-blue-400 transition-colors cursor-pointer"
                        >
                            <option value="">All Quarters</option>
                            {quarters.map((q, i) => (
                                <option key={q} value={(i + 1).toString()}>Q{i + 1}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
                    </div>
                </div>
            </div>

            {/* Notifications */}
            <button className="relative w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-200 transition-colors">
                <Bell className="w-4 h-4 text-slate-500" />
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
            </button>

            {/* Avatar / Profile */}
            <div className="flex items-center gap-2.5">
                <div className="hidden sm:block text-right">
                    <div className="text-xs font-bold text-slate-900 leading-none">{user?.name || "Loading..."}</div>
                    <div className="text-[10px] text-slate-500">{user?.role || "..."}</div>
                </div>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-sky-600 flex items-center justify-center text-[11px] font-bold text-white shadow-sm">
                    {initials}
                </div>
                <button
                    onClick={handleLogout}
                    title="Logout"
                    className="ml-1 w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                >
                    <LogOut className="w-4 h-4" />
                </button>
            </div>
        </header>
    );
}
