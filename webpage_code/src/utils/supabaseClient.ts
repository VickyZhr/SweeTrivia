
import { createClient } from '@supabase/supabase-js';

// These should be replaced with your actual Supabase project URL and anon key
const supabaseUrl = 'https://your-project-id.supabase.co';
const supabaseAnonKey = 'your-supabase-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
