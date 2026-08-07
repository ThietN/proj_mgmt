import { NextResponse } from "next/server";
import { getSurveyById } from "@/lib/database";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "Missing survey id" }, { status: 400 });
        }

        const survey = await getSurveyById(id);
        if (!survey) {
            return NextResponse.json({ error: "Survey not found" }, { status: 404 });
        }

        // Return only what's needed for the participant view
        return NextResponse.json({ 
            survey: {
                id: survey.id,
                title: survey.title,
                description: survey.description,
                questions: survey.questions,
                is_anonymous: survey.is_anonymous,
                status: survey.status
            }
        });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
