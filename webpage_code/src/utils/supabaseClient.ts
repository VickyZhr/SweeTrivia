
import { createClient } from '@supabase/supabase-js';

// These should be replaced with your actual Supabase project URL and anon key
const supabaseUrl = 'https://gvfnsrhqgfmvyncrojdg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd2Zm5zcmhxZ2ZtdnluY3JvamRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIyMjM3NzcsImV4cCI6MjA1Nzc5OTc3N30._ImOtTnr23uThcL7_20Vm1-tvz_o4_Kzt7M_op0P7Q4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
