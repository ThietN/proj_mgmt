import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
// Ưu tiên dùng Service Role Key trên backend để bypass RLS
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseKey, {
    global: {
        fetch: (url, options = {}) =>
            fetch(url, { ...options, cache: 'no-store' })
    }
});
