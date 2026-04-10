"use client";
import { InternMetrics } from "@/types";
import { Users, PlayCircle, CheckCircle2, TrendingUp, DollarSign } from "lucide-react";

interface InternSummaryCardsProps {
    metrics: InternMetrics;
}

export function InternSummaryCards({ metrics }: InternSummaryCardsProps) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {/* Total Interns */}
            <div className="glass-card p-4 bg-white border-l-4 border-l-slate-400 shadow-sm hover:translate-y-[-2px] transition-all">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Total Interns</p>
                        <h3 className="text-2xl font-black text-slate-900 leading-none">{metrics.totalInterns}</h3>
                    </div>
                    <Users className="w-8 h-8 text-slate-100" />
                </div>
            </div>

            {/* In Progress */}
            <div className="glass-card p-4 bg-white border-l-4 border-l-green-500 shadow-sm hover:translate-y-[-2px] transition-all">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-[10px] font-black text-green-500 uppercase tracking-widest mb-1.5">In Progress</p>
                        <h3 className="text-2xl font-black text-slate-900 leading-none">{metrics.inProgress}</h3>
                    </div>
                    <PlayCircle className="w-8 h-8 text-green-50" />
                </div>
            </div>

            {/* Completed */}
            <div className="glass-card p-4 bg-white border-l-4 border-l-red-500 shadow-sm hover:translate-y-[-2px] transition-all">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-1.5">Finished</p>
                        <h3 className="text-2xl font-black text-slate-900 leading-none">{metrics.completed}</h3>
                    </div>
                    <CheckCircle2 className="w-8 h-8 text-red-50" />
                </div>
            </div>

            {/* Converted to Billable */}
            <div className="glass-card p-4 bg-white border-l-4 border-l-blue-500 shadow-sm hover:translate-y-[-2px] transition-all">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1.5">Turned Bill</p>
                        <h3 className="text-2xl font-black text-slate-900 leading-none">{metrics.convertedToBillable}</h3>
                    </div>
                    <DollarSign className="w-8 h-8 text-blue-50" />
                </div>
            </div>

            {/* Completion Rate */}
            <div className="glass-card p-4 bg-white border-l-4 border-l-indigo-600 shadow-sm hover:translate-y-[-2px] transition-all">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1.5">Finished Rate</p>
                        <div className="flex items-baseline gap-1">
                            <h3 className="text-2xl font-black text-slate-900 leading-none">{metrics.completionRate.toFixed(1)}</h3>
                            <span className="text-xs font-bold text-slate-400">%</span>
                        </div>
                    </div>
                    <TrendingUp className="w-8 h-8 text-indigo-50" />
                </div>
            </div>
        </div>
    );
}
