import { cn } from "@/lib/utils";
import { LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface KpiCardProps {
    title: string;
    value: string | number;
    subValue?: string;
    trend?: "up" | "down" | "neutral";
    trendValue?: string;
    icon: LucideIcon;
    iconColor?: string;
    iconBg?: string;
    className?: string;
    highlight?: boolean;
}

export function KpiCard({
    title,
    value,
    subValue,
    trend,
    trendValue,
    icon: Icon,
    iconColor = "text-blue-600",
    iconBg = "bg-blue-600/10",
    className,
    highlight,
}: KpiCardProps) {
    const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;
    const trendColor =
        trend === "up" ? "text-emerald-600" : trend === "down" ? "text-red-600" : "text-slate-500";

    return (
        <div
            className={cn(
                "glass-card p-5 hover:border-blue-600/20 transition-all duration-200 group cursor-default",
                highlight && "border-blue-600/30 bg-blue-700/5",
                className
            )}
        >
            <div className="flex items-start justify-between mb-4">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", iconBg)}>
                    <Icon className={cn("w-5 h-5", iconColor)} />
                </div>
                {trend && trendValue && (
                    <div className={cn("flex items-center gap-1 text-xs font-medium", trendColor)}>
                        <TrendIcon className="w-3.5 h-3.5" />
                        {trendValue}
                    </div>
                )}
            </div>
            <div className="mt-1">
                <div className="text-2xl font-bold text-slate-900 tracking-tight">{value}</div>
                <div className="text-xs font-medium text-slate-500 mt-0.5">{title}</div>
                {subValue && (
                    <div className="text-[11px] text-slate-400 mt-1">{subValue}</div>
                )}
            </div>
        </div>
    );
}
