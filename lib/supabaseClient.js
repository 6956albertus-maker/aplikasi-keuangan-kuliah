import { createClient } from '@supabase/supabase-js';

// Ganti nilai URL dan ANON_KEY sesuai konfigurasi Supabase Anda
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'URL_SUPABASE_ANDA';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'ANON_KEY_ANDA';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
