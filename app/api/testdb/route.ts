import { supabase } from "@/lib/supabase";
export const dynamic = "force-dynamic";

export async function GET() {
  const { data, error } = await supabase.from("users").select("*").limit(1);
  console.log("Supabase test:", { data, error });
  if (error) {
    return new Response("Supabase error: " + error.message, { status: 500 });
  }
  return new Response("Supabase OK", { status: 200 });
}
