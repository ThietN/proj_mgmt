import { getEvents } from "@/lib/database";
import EventsClient from "@/components/events/EventsClient";

export default async function EventsPage() {
    const events = await getEvents();
    return <EventsClient events={events} />;
}
