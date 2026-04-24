"use client";
import { useState } from "react";
import { MemberCertification, Certification } from "@/types";
import { Award, CheckCircle2, Clock, Calendar, TrendingUp, AlertCircle, ExternalLink, Edit2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { MemberCertificationForm } from "./MemberCertificationForm";

interface MyCertificationsClientProps {
    records: MemberCertification[];
}

export function MyCertificationsClient({ records }: MyCertificationsClientProps) {
    const [myRecords, setMyRecords] = useState<MemberCertification[]>(records);
    const [editingRecord, setEditingRecord] = useState<MemberCertification | null>(null);

    const passed = myRecords.filter(r => r.status === 'PASSED');
    const active = myRecords.filter(r => r.status !== 'PASSED' && r.status !== 'FAILED' && r.status !== 'EXPIRED');

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Active Goals */}
                <div className="space-y-4">
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-blue-500" /> Current Learning Goals
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                        {active.map(r => (
                            <div key={r.id} className="glass-card bg-white border-slate-200 p-5 group hover:border-blue-300 transition-all">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
                                            <Calendar className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-black text-slate-800 leading-tight">{r.certification?.name}</h4>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{r.certification?.provider} • {r.certification?.code}</p>
                                        </div>
                                    </div>
                                    <span className={cn(
                                        "text-[9px] font-black px-2 py-0.5 rounded-full border uppercase tracking-wider",
                                        r.status === 'SCHEDULED' ? "bg-indigo-50 text-indigo-600 border-indigo-100" : "bg-amber-50 text-amber-600 border-amber-100"
                                    )}>
                                        {r.status}
                                    </span>
                                </div>
                                
                                <div className="space-y-2 mb-4">
                                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                                        <span>Progress</span>
                                        <span>{r.progress_percent}%</span>
                                    </div>
                                    <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100 p-0.5">
                                        <div 
                                            className="h-full bg-blue-500 rounded-full transition-all duration-1000"
                                            style={{ width: `${r.progress_percent}%` }}
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Target Exam</span>
                                        <span className="text-xs font-bold text-slate-700">{r.target_exam_date || "Not set"}</span>
                                    </div>
                                    <button
                                        onClick={() => setEditingRecord(r)}
                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all"
                                    >
                                        <Edit2 className="w-3 h-3" /> Update Progress
                                    </button>
                                </div>
                            </div>
                        ))}
                        {active.length === 0 && (
                            <div className="p-12 text-center bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
                                <p className="text-slate-400 text-xs font-medium">No active certification goals. Time to level up!</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Achieved Certifications */}
                <div className="space-y-4">
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <BadgeCheck className="w-4 h-4 text-emerald-500" /> Professional Portfolio
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                        {passed.map(r => (
                            <div key={r.id} className="glass-card bg-white border-emerald-100 p-5 group hover:shadow-lg transition-all relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 bg-emerald-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500" />
                                <div className="relative z-10">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-100">
                                            <Award className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="font-black text-slate-800 leading-tight">{r.certification?.name}</h4>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{r.certification?.provider} • {r.certification?.code}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-slate-50">
                                        <div>
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Achieved On</p>
                                            <p className="text-xs font-bold text-slate-700">{r.actual_exam_date || "N/A"}</p>
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Valid Until</p>
                                            <p className={cn(
                                                "text-xs font-bold",
                                                r.expiry_date && new Date(r.expiry_date) < new Date() ? "text-red-500" : "text-emerald-600"
                                            )}>
                                                {r.expiry_date || "Life"}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    {r.certificate_number && (
                                        <div className="mt-4 flex items-center justify-between">
                                            <div className="text-[10px] font-bold text-slate-400">ID: {r.certificate_number}</div>
                                            {r.certification?.exam_url && (
                                                <a href={r.certification.exam_url} target="_blank" rel="noreferrer" className="text-[10px] font-black text-blue-500 uppercase tracking-widest flex items-center gap-1 hover:text-blue-700">
                                                    Verify <ExternalLink className="w-3 h-3" />
                                                </a>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        {passed.length === 0 && (
                            <div className="p-12 text-center bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
                                <p className="text-slate-400 text-xs font-medium">Your portfolio is empty. Start your first certification today!</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {editingRecord && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                        <MemberCertificationForm
                            initialData={editingRecord}
                            members={[]} // Not needed for editing own
                            certifications={[]} // Not needed for editing own
                            onSuccess={(updated) => {
                                setMyRecords(myRecords.map(r => r.id === editingRecord.id ? { ...r, ...updated } : r));
                                setEditingRecord(null);
                            }}
                            onCancel={() => setEditingRecord(null)}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

function BadgeCheck({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"/>
            <path d="m9 12 2 2 4-4"/>
        </svg>
    )
}
