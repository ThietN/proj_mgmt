import { cn } from "@/lib/utils";

interface StatusBadgeProps {
    status: string;
    size?: "sm" | "md";
}

const statusMap: Record<string, { label: string; class: string; dot: string }> = {
    // Resource status
    Billable: { label: "Billable", class: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", dot: "bg-emerald-400" },
    Backup: { label: "Backup", class: "bg-amber-500/10 text-amber-400 border-amber-500/20", dot: "bg-amber-400" },
    Available: { label: "Available", class: "bg-blue-500/10 text-blue-400 border-blue-500/20", dot: "bg-blue-400" },
    // Project status
    "On Track": { label: "On Track", class: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", dot: "bg-emerald-400" },
    "At Risk": { label: "At Risk", class: "bg-amber-500/10 text-amber-400 border-amber-500/20", dot: "bg-amber-400" },
    Critical: { label: "Critical", class: "bg-red-500/10 text-red-400 border-red-500/20", dot: "bg-red-400" },
    Completed: { label: "Completed", class: "bg-slate-500/10 text-slate-400 border-slate-500/20", dot: "bg-slate-400" },
    // Risk level
    Low: { label: "Low", class: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", dot: "bg-emerald-400" },
    Medium: { label: "Medium", class: "bg-amber-500/10 text-amber-400 border-amber-500/20", dot: "bg-amber-400" },
    High: { label: "High", class: "bg-red-500/10 text-red-400 border-red-500/20", dot: "bg-red-400" },
    // Hiring
    Applied: { label: "Applied", class: "bg-slate-500/10 text-slate-400 border-slate-500/20", dot: "bg-slate-400" },
    Screening: { label: "Screening", class: "bg-blue-500/10 text-blue-400 border-blue-500/20", dot: "bg-blue-400" },
    Interview: { label: "Interview", class: "bg-violet-500/10 text-violet-400 border-violet-500/20", dot: "bg-violet-400" },
    Offer: { label: "Offer", class: "bg-amber-500/10 text-amber-400 border-amber-500/20", dot: "bg-amber-400" },
    Joined: { label: "Joined", class: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", dot: "bg-emerald-400" },
    Rejected: { label: "Rejected", class: "bg-red-500/10 text-red-400 border-red-500/20", dot: "bg-red-400" },
    // Innovation
    Planning: { label: "Planning", class: "bg-slate-500/10 text-slate-400 border-slate-500/20", dot: "bg-slate-400" },
    "In Progress": { label: "In Progress", class: "bg-blue-500/10 text-blue-400 border-blue-500/20", dot: "bg-blue-400" },
    "On Hold": { label: "On Hold", class: "bg-amber-500/10 text-amber-400 border-amber-500/20", dot: "bg-amber-400" },
    // Risk flags
    "Low performance": { label: "Low performance", class: "bg-amber-500/10 text-amber-400 border-amber-500/20", dot: "bg-amber-400" },
    "Resign risk": { label: "Resign risk", class: "bg-red-500/10 text-red-400 border-red-500/20", dot: "bg-red-400" },
    // Skill levels
    Beginner: { label: "Beginner", class: "bg-slate-500/10 text-slate-400 border-slate-500/20", dot: "bg-slate-400" },
    Intermediate: { label: "Intermediate", class: "bg-blue-500/10 text-blue-400 border-blue-500/20", dot: "bg-blue-400" },
    Advanced: { label: "Advanced", class: "bg-violet-500/10 text-violet-400 border-violet-500/20", dot: "bg-violet-400" },
    Expert: { label: "Expert", class: "bg-amber-500/10 text-amber-400 border-amber-500/20", dot: "bg-amber-400" },
};

export function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
    const config = statusMap[status] ?? {
        label: status,
        class: "bg-slate-500/10 text-slate-400 border-slate-500/20",
        dot: "bg-slate-400",
    };
    return (
        <span
            className={cn(
                "inline-flex items-center gap-1.5 border rounded-full font-medium",
                config.class,
                size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs"
            )}
        >
            <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", config.dot)} />
            {config.label}
        </span>
    );
}
