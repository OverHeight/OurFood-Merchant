import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_PUBLISHABLE_KEY =
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    import.meta.env.VITE_SUPABASE_ANON_KEY ||
    '';

if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
    console.error('Missing Supabase environment variables in .env file!');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

// Use localStorage to allow dynamic merchant switching
export const getMerchantId = (): string =>
  localStorage.getItem('merchantId') || 'aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

export const CURRENT_MERCHANT_ID = getMerchantId();

