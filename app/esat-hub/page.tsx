import { getPolls, getSurveys, getEvents, getFeedback } from "@/lib/database";
import ESATHubClient from "@/components/esat-hub/ESATHubClient";

export default async function ESATHubPage() {
    const [polls, surveys, events, feedback] = await Promise.all([
        getPolls(),
        getSurveys(),
        getEvents(),
        getFeedback(),
    ]);

    const stats = {
        overall_score: 7.8, // placeholder — computed from ESAT records
        participation_rate: surveys.length > 0
            ? Math.round(surveys.reduce((s, sv) => s + (sv.participation_rate || 0), 0) / surveys.length)
            : 0,
        active_polls: polls.filter(p => p.status === "Active").length,
        active_surveys: surveys.filter(s => s.status === "Active").length,
        upcoming_events: events.filter(e => e.status === "Upcoming" || e.status === "Ongoing").length,
        open_feedback: feedback.filter(f => f.status === "New" || f.status === "In Review").length,
        resolved_feedback: feedback.filter(f => f.status === "Resolved" || f.status === "Closed").length,
        avg_response_time_days: 2.4, // placeholder
    };

    return <ESATHubClient stats={stats} polls={polls} surveys={surveys} events={events} feedback={feedback} />;
}
