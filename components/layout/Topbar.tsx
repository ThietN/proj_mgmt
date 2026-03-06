"use client";
import { Bell, Search, Calendar } from "lucide-react";

export function Topbar() {
    const now = new Date();
    const dateStr = now.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    return (
        <header className="h-14 flex-shrink-0 border-b border-[#1a1a2e] bg-[#080810]/80 backdrop-blur-md flex items-center px-6 gap-4">
            {/* Search */}
            <div className="flex items-center gap-2 flex-1 max-w-sm bg-[#111122] border border-[#1a1a2e] rounded-lg px-3 py-1.5">
                <Search className="w-3.5 h-3.5 text-slate-500" />
                <input
                    type="text"
                    placeholder="Search..."
                    className="bg-transparent text-sm text-slate-400 placeholder-slate-600 outline-none w-full"
                />
                <kbd className="text-[10px] text-slate-600 bg-[#1a1a2e] px-1.5 py-0.5 rounded font-mono border border-[#252540]">
                    ⌘K
                </kbd>
            </div>

            <div className="flex-1" />

            {/* Date */}
            <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-500">
                <Calendar className="w-3.5 h-3.5" />
                {dateStr}
            </div>

            {/* Notifications */}
            <button className="relative w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 transition-colors">
                <Bell className="w-4 h-4 text-slate-400" />
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
            </button>

            {/* Avatar */}
            <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-xs font-bold text-white">
                    SM
                </div>
            </div>
        </header>
    );
}
