import { getFeedback } from "@/lib/database";
import FeedbackClient from "@/components/feedback/FeedbackClient";

export default async function FeedbackPage() {
    const feedback = await getFeedback();
    return <FeedbackClient feedback={feedback} />;
}
