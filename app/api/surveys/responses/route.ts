import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { survey_id, respondent_email, answers } = body;

        if (!survey_id || !answers) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const { data, error } = await supabase
            .from("survey_responses")
            .insert([{
                survey_id,
                respondent_email,
                answers
            }])
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ success: true, response: data });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const survey_id = searchParams.get("survey_id");

        if (!survey_id) {
            return NextResponse.json({ error: "Missing survey_id" }, { status: 400 });
        }

        const { data, error } = await supabase
            .from("survey_responses")
            .select("*")
            .eq("survey_id", survey_id)
            .order("submitted_at", { ascending: false });

        if (error) throw error;

        return NextResponse.json({ responses: data });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
