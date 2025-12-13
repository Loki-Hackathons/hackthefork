import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
// const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
// const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;
// export const supabase = createClient(supabaseUrl, supabaseKey);

export const apiClient = {
    // Wrapper for fetch calls to your Python Backend
    get: async (endpoint: string) => {
        // ...
    },
    post: async (endpoint: string, body: any) => {
        // ...
    }
};

