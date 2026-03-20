import { getTrackingTasks, getProjects, getResources, getInnovations, getWorkspaceNotes, getTrackingWorkspaces } from "@/lib/database";
import { TrackingClient } from "@/components/tracking/TrackingClient";
import { KpiCard } from "@/components/ui/KpiCard";
import { CheckSquare, Clock, AlertCircle, ListChecks } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function TrackingPage() {
    const [tasks, projects, resources, innovations, workspaceNotes, workspaces] = await Promise.all([
        getTrackingTasks(),
        getProjects(),
        getResources(),
        getInnovations(),
        getWorkspaceNotes(),
        getTrackingWorkspaces(),
    ]);

    const inProgress = tasks.filter(t => t.status === "In Progress").length;
    const done = tasks.filter(t => t.status === "Done").length;
    const overdue = tasks.filter(t => t.due_date && new Date(t.due_date) < new Date() && t.status !== "Done").length;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Tracking Tool</h1>
                <p className="text-sm text-slate-500 mt-0.5">Workspace-based Kanban boards, notes & project tracking</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <KpiCard title="Total Tasks" value={tasks.length} icon={ListChecks} iconColor="text-indigo-600" iconBg="bg-indigo-600/10" />
                <KpiCard title="In Progress" value={inProgress} icon={Clock} iconColor="text-amber-600" iconBg="bg-amber-50" />
                <KpiCard title="Completed" value={done} icon={CheckSquare} iconColor="text-emerald-600" iconBg="bg-emerald-50" />
                <KpiCard title="Overdue" value={overdue} icon={AlertCircle} iconColor="text-red-600" iconBg="bg-red-50" highlight={overdue > 0} />
            </div>

            <TrackingClient
                tasks={tasks}
                projects={projects}
                resources={resources}
                innovations={innovations}
                workspaceNotes={workspaceNotes}
                workspaces={workspaces}
            />
        </div>
    );
}
