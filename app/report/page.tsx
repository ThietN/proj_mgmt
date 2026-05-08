import { 
    getResources, getProjects, getInnovations, getCSAT, getESAT, getHiring, 
    getTrackingTasks, getTrackingWorkspaces, getWeeklyReports,
    getAttendanceStats, getTopLateMembers, getTopNotAccessMembers, getInterns
} from "@/lib/database";
import { ReportClient } from "@/components/report/ReportClient";

export const dynamic = "force-dynamic";

export default async function ReportPage() {
    const [
        resources, projects, innovations, csat, esat, 
        hiring, trackingTasks, workspaces, pastReports,
        attendanceStats, lateRankings, notAccessRankings, interns
    ] = await Promise.all([
        getResources(),
        getProjects(),
        getInnovations(),
        getCSAT(),
        getESAT(),
        getHiring(),
        getTrackingTasks(),
        getTrackingWorkspaces(),
        getWeeklyReports(),
        getAttendanceStats(),
        getTopLateMembers(15),
        getTopNotAccessMembers(15),
        getInterns(),
    ]);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Weekly Program Report</h1>
                <p className="text-sm text-slate-500 mt-0.5">Auto-generated report from all modules — edit & export</p>
            </div>
            <ReportClient
                resources={resources}
                projects={projects}
                innovations={innovations}
                csat={csat}
                esat={esat}
                hiring={hiring}
                trackingTasks={trackingTasks}
                workspaces={workspaces}
                pastReports={pastReports}
                attendanceStats={attendanceStats}
                lateRankings={lateRankings}
                notAccessRankings={notAccessRankings}
                interns={interns}
            />
        </div>
    );
}
