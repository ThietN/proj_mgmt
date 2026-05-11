import SurveyParticipantView from "@/components/surveys/SurveyParticipantView";

interface PageProps {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps) {
    const { id } = await params;
    return {
        title: `Take Survey | Project Mgmt`,
        description: "Please provide your feedback",
    };
}

export default async function SurveyViewPage({ params }: PageProps) {
    const { id } = await params;
    return <SurveyParticipantView surveyId={id} />;
}
