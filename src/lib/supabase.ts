import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;

export const supabase =
  window.__supabaseClient ??
  (window.__supabaseClient = createClient(supabaseUrl, supabaseKey));
