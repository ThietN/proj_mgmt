import { createClient } from '@supabase/supabase-js';

let supabaseInstance: any;

export const supabase: any = new Proxy({}, {
    get(target, prop) {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_KEY || '';

        // If URL is missing, we shouldn't attempt createClient
        if (!supabaseUrl || !supabaseKey) {
            // Return a function that throws when called, for common methods like .from()
            const errorFn = (...args: any[]) => {
                throw new Error("Supabase URL/Key is missing. Check your environment variables.");
            };
            // Also return the errorFn for nested properties (like .auth.something)
            return new Proxy(errorFn, {
                get: () => errorFn
            });
        }

        if (!supabaseInstance) {
            supabaseInstance = createClient(supabaseUrl, supabaseKey, {
                global: {
                    fetch: (url, options = {}) =>
                        fetch(url, { ...options, cache: 'no-store' })
                }
            });
        }
        return (supabaseInstance as any)[prop];
    }
});
