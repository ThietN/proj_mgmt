"use client";
import dynamic from "next/dynamic";

const SpanOfControlInner = dynamic(
    () => import("./SpanOfControl").then(mod => mod.SpanOfControl),
    { 
        ssr: false, 
        loading: () => <div className="h-[200px] w-full animate-pulse bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center text-xs text-slate-400 font-bold uppercase tracking-widest">Loading Span of Control data...</div> 
    }
);

export function SpanOfControlDynamic(props: any) {
    return <SpanOfControlInner {...props} />;
}
