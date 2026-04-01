import { getSurveys } from "@/lib/database";
import SurveysClient from "@/components/surveys/SurveysClient";

export default async function SurveysPage() {
    const surveys = await getSurveys();
    return <SurveysClient surveys={surveys} />;
}
