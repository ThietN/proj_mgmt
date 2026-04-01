import { getPolls } from "@/lib/database";
import PollsClient from "@/components/polls/PollsClient";

export default async function PollsPage() {
    const polls = await getPolls();
    return <PollsClient polls={polls} />;
}
