import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || supabaseUrl === 'YOUR_SUPABASE_URL_HERE' || !supabaseAnonKey || supabaseAnonKey === 'YOUR_SUPABASE_ANON_KEY_HERE') {
  console.warn(
    'Supabase credentials are not configured. Please edit the .env file with your actual Supabase URL and Anon Key.'
  );
}

const isUrlValid = supabaseUrl && supabaseUrl.startsWith('http');
export const supabase = createClient(
  isUrlValid ? supabaseUrl : 'https://placeholder-url.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);
