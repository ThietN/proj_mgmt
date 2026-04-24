"use client";
import { MemberCertification } from "@/types";
import { Bell, AlertTriangle, CheckCircle2, XCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface CertificationNotificationsProps {
    records: MemberCertification[];
}

export function CertificationNotifications({ records }: CertificationNotificationsProps) {
    const now = new Date();
    
    // Logic for notifications
    const notifications = [
        ...records.filter(r => r.status === 'PASSED' && r.expiry_date && (new Date(r.expiry_date).getTime() - now.getTime()) / (1000 * 3600 * 24) <= 30)
            .map(r => ({
                id: `expiry-${r.id}`,
                type: 'warning',
                title: 'Certification Expiring',
                message: `${r.member?.name}'s ${r.certification?.code} expires in ${Math.ceil((new Date(r.expiry_date!).getTime() - now.getTime()) / (1000 * 3600 * 24))} days.`,
                icon: AlertTriangle,
                color: 'text-orange-600',
                bg: 'bg-orange-50'
            })),
        ...records.filter(r => r.status === 'FAILED')
            .map(r => ({
                id: `failed-${r.id}`,
                type: 'error',
                title: 'Exam Failed',
                message: `${r.member?.name} failed the ${r.certification?.code} exam.`,
                icon: XCircle,
                color: 'text-red-600',
                bg: 'bg-red-50'
            })),
        ...records.filter(r => r.status === 'PASSED' && r.updated_at && (now.getTime() - new Date(r.updated_at).getTime()) / (1000 * 3600 * 24) <= 7)
            .map(r => ({
                id: `passed-${r.id}`,
                type: 'success',
                title: 'Certification Earned!',
                message: `${r.member?.name} has successfully passed ${r.certification?.code}.`,
                icon: CheckCircle2,
                color: 'text-emerald-600',
                bg: 'bg-emerald-50'
            }))
    ];

    if (notifications.length === 0) return null;

    return (
        <div className="glass-card bg-white border-slate-200 p-4">
            <div className="flex items-center gap-2 mb-4 border-b border-slate-50 pb-2">
                <Bell className="w-4 h-4 text-blue-500" />
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Recent Alerts</h3>
                <span className="ml-auto bg-blue-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">{notifications.length}</span>
            </div>
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {notifications.map(n => (
                    <div key={n.id} className={cn("p-3 rounded-xl border flex gap-3 transition-all hover:scale-[1.02]", n.bg, "border-white/50 shadow-sm")}>
                        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-white shadow-sm")}>
                            <n.icon className={cn("w-4 h-4", n.color)} />
                        </div>
                        <div>
                            <div className={cn("text-[10px] font-black uppercase tracking-widest", n.color)}>{n.title}</div>
                            <div className="text-xs font-bold text-slate-700 leading-tight mt-0.5">{n.message}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
