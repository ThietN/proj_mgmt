"use client";
import { MemberCertification, Certification } from "@/types";
import { Award, AlertTriangle, CheckCircle2, Clock, Calendar, TrendingUp, ShieldCheck, Zap, ArrowUpRight, ArrowDownRight, Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { KpiCard } from "@/components/ui/KpiCard";
import { CertificationNotifications } from "./CertificationNotifications";

interface CertificationDashboardClientProps {
    records: MemberCertification[];
    certifications: Certification[];
}

export function CertificationDashboardClient({ records, certifications }: CertificationDashboardClientProps) {
    // Stats calculation
    const passed = records.filter(r => r.status === 'PASSED');
    const learning = records.filter(r => r.status === 'LEARNING' || r.status === 'SCHEDULED');

    // Expiry analysis
    const now = new Date();
    const expiry30 = records.filter(r => r.status === 'PASSED' && r.expiry_date && (new Date(r.expiry_date).getTime() - now.getTime()) / (1000 * 3600 * 24) <= 30);
    const expiry60 = records.filter(r => r.status === 'PASSED' && r.expiry_date && (new Date(r.expiry_date).getTime() - now.getTime()) / (1000 * 3600 * 24) <= 60);
    const expiry90 = records.filter(r => r.status === 'PASSED' && r.expiry_date && (new Date(r.expiry_date).getTime() - now.getTime()) / (1000 * 3600 * 24) <= 90);

    const expired = records.filter(r => r.status === 'EXPIRED' || (r.status === 'PASSED' && r.expiry_date && new Date(r.expiry_date) < now));

    // Category distribution
    const catStats = passed.reduce((acc: any, r) => {
        const cat = r.certification?.category || 'OTHER';
        acc[cat] = (acc[cat] || 0) + 1;
        return acc;
    }, {});

    const sortedCats = Object.entries(catStats).sort((a: any, b: any) => b[1] - a[1]);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Top KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <KpiCard title="Active Certifications" value={passed.length} icon={Award} iconColor="text-emerald-600" iconBg="bg-emerald-50" />
                <KpiCard title="In Progress" value={learning.length} icon={Clock} iconColor="text-amber-600" iconBg="bg-amber-50" />
                <KpiCard title="Expiring (90d)" value={expiry90.length} icon={AlertTriangle} iconColor="text-orange-600" iconBg="bg-orange-50" />
                <KpiCard title="Expired" value={expired.length} icon={ShieldCheck} iconColor="text-red-600" iconBg="bg-red-50" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Expiry Dashboard */}
                <div className="lg:col-span-2 glass-card bg-white border-slate-200">
                    <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                            <Clock className="w-4 h-4 text-orange-500" /> Retention & Renewal Dashboard
                        </h3>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                            <div className="p-4 rounded-2xl bg-red-50 border border-red-100 flex flex-col items-center text-center">
                                <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-1">Critical (30d)</p>
                                <span className="text-3xl font-black text-red-600">{expiry30.length}</span>
                                <p className="text-[9px] text-red-400 mt-1 font-bold">RENEWAL REQUIRED</p>
                            </div>
                            <div className="p-4 rounded-2xl bg-orange-50 border border-orange-100 flex flex-col items-center text-center">
                                <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest mb-1">Warning (60d)</p>
                                <span className="text-3xl font-black text-orange-600">{expiry60.length}</span>
                                <p className="text-[9px] text-orange-400 mt-1 font-bold">PLAN TRAINING</p>
                            </div>
                            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 flex flex-col items-center text-center">
                                <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest mb-1">Upcoming (90d)</p>
                                <span className="text-3xl font-black text-amber-600">{expiry90.length}</span>
                                <p className="text-[9px] text-amber-400 mt-1 font-bold">MONITORING</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 border-b border-slate-50 pb-2">Expiring Soon</h4>
                            {expiry90.slice(0, 5).map((r) => (
                                <div key={r.id} className="flex items-center justify-between p-3 bg-slate-50/50 rounded-xl border border-slate-100 group hover:border-orange-200 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center font-bold text-xs shadow-sm">
                                            {r.member?.name?.[0]}
                                        </div>
                                        <div>
                                            <div className="text-xs font-black text-slate-800">{r.member?.name}</div>
                                            <div className="text-[10px] text-slate-400 font-bold uppercase">{r.certification?.name}</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[10px] font-black text-orange-600 uppercase">Expires: {r.expiry_date}</div>
                                        <div className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">
                                            {Math.ceil((new Date(r.expiry_date!).getTime() - now.getTime()) / (1000 * 3600 * 24))} Days Left
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {expiry90.length === 0 && (
                                <div className="text-center py-8 text-xs text-slate-400 italic">No certifications expiring within 90 days.</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Category stats */}
                <div className="glass-card bg-white border-slate-200 flex flex-col">
                    <div className="p-4 border-b border-slate-100 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-blue-500" />
                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Skill Distribution</h3>
                    </div>
                    <div className="p-6 flex-1 space-y-6">
                        {sortedCats.map(([cat, count]: any) => (
                            <div key={cat} className="space-y-1.5">
                                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                                    <span className="text-slate-500">{cat}</span>
                                    <span className="text-slate-900">{count} Active</span>
                                </div>
                                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                        className={cn(
                                            "h-full transition-all duration-1000",
                                            cat === 'TECHNICAL' ? "bg-blue-500" :
                                                cat === 'CLOUD' ? "bg-sky-500" :
                                                    cat === 'SECURITY' ? "bg-red-500" :
                                                        cat === 'AI' ? "bg-violet-500" : "bg-emerald-500"
                                        )}
                                        style={{ width: `${(count / passed.length) * 100}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                        {sortedCats.length === 0 && (
                            <div className="text-center py-12">
                                <Award className="w-8 h-8 text-slate-200 mx-auto mb-3" />
                                <p className="text-[11px] text-slate-400 font-medium">No passed certifications yet.</p>
                            </div>
                        )}
                    </div>
                    <div className="p-4 bg-slate-50/50 border-t border-slate-100">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Growth Trend</span>
                            <div className="flex items-center gap-1 text-emerald-600">
                                <ArrowUpRight className="w-3 h-3" />
                                <span className="text-xs font-black">+12%</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Notifications Sidebar */}
                <div className="space-y-6">
                    <CertificationNotifications records={records} />
                    {/* <div className="glass-card bg-gradient-to-br from-blue-600 to-indigo-700 p-6 text-white overflow-hidden relative group cursor-pointer">
                        <div className="absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 bg-white/10 rounded-full group-hover:scale-150 transition-transform duration-700" />
                        <h4 className="text-xs font-black uppercase tracking-widest opacity-70 mb-1">Training Budget</h4>
                        <div className="text-2xl font-black mb-4">$12,450.00</div>
                        <div className="space-y-3 relative z-10">
                            <div className="flex justify-between text-[10px] font-bold opacity-80 uppercase">
                                <span>Utilized</span>
                                <span>65%</span>
                            </div>
                            <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
                                <div className="h-full bg-white rounded-full w-[65%]" />
                            </div>
                            <button className="w-full py-2 bg-white/10 hover:bg-white/20 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors mt-2">
                                Request Funding
                            </button>
                        </div>
                    </div> */}
                </div>
            </div>
        </div>
    );
}
