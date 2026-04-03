"use client";

import dynamic from "next/dynamic";


const DashboardChartsInner = dynamic(
    () => import("./DashboardCharts").then(mod => mod.DashboardCharts),
    { 
        ssr: false, 
        loading: () => <div className="h-[200px] w-full animate-pulse bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center text-xs text-slate-400 font-bold">Loading charts...</div> 
    }
);

export function DashboardChartsDynamic(props: any) {
    return <DashboardChartsInner {...props} />;
}
