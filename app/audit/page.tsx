import { AuditClient } from "@/components/audit/AuditClient";
import { getAuditLogs } from "@/lib/database";

// Next.js config for dynamic
export const dynamic = "force-dynamic";

export default async function AuditPage() {
    const logs = await getAuditLogs();

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Audit Logs</h1>
            <AuditClient logs={logs} />
        </div>
    );
}
