
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function run() {
  try {
    const { data: resources, error: rErr } = await supabase.from('resources').select('*');
    if (rErr) throw rErr;
    const { data: skills, error: sErr } = await supabase.from('skill_definitions').select('*');
    if (sErr) throw sErr;
    const { data: matrix, error: mErr } = await supabase.from('skill_matrix').select('*');
    if (mErr) throw mErr;
    
    console.log(JSON.stringify({ resources, skills, matrix }));
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

run()
