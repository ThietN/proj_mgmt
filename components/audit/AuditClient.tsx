"use client";

import { useState } from "react";
import { AuditLog } from "@/types";
import { Search } from "lucide-react";

export function AuditClient({ logs }: { logs: AuditLog[] }) {
    const [searchTerm, setSearchTerm] = useState("");

    const filteredLogs = logs.filter(log =>
        log.user_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.target_type.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-4">
            <div className="glass-card p-4 flex flex-col sm:flex-row gap-4 justify-between">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search logs by user, detail, or type..."
                        className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 outline-none focus:border-blue-500 transition-colors"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
                            <tr>
                                <th className="px-4 py-3 min-w-[150px]">Time</th>
                                <th className="px-4 py-3 min-w-[150px]">User</th>
                                <th className="px-4 py-3 min-w-[100px]">Action</th>
                                <th className="px-4 py-3 min-w-[100px]">Target</th>
                                <th className="px-4 py-3 min-w-[300px]">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 bg-white">
                            {filteredLogs.map((log) => (
                                <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-4 py-3 text-slate-500 font-mono text-[11px]">
                                        {new Date(log.timestamp).toLocaleString()}
                                    </td>
                                    <td className="px-4 py-3 font-medium text-slate-900">
                                        {log.user_id}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${log.action === "CREATE" ? "bg-emerald-50 text-emerald-600 border border-emerald-200" :
                                                log.action === "UPDATE" ? "bg-amber-50 text-amber-600 border border-amber-200" :
                                                    log.action === "DELETE" ? "bg-red-50 text-red-600 border border-red-200" :
                                                        "bg-blue-50 text-blue-600 border border-blue-200"
                                            }`}>
                                            {log.action}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-slate-600">
                                        {log.target_type} <span className="text-[10px] text-slate-400">({log.target_id})</span>
                                    </td>
                                    <td className="px-4 py-3 text-slate-700">
                                        {log.details}
                                    </td>
                                </tr>
                            ))}
                            {filteredLogs.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                                        No audit logs found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
