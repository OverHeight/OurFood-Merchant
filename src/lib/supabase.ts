import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://cksyywoxgrcjoqhfpauh.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_rSiVXZ3v0umrnKTXWreLMA_FweDQi7L';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Hardcoded merchant ID to match the user's data (Warung Steak Dipatiukur)
export const CURRENT_MERCHANT_ID = 'c3ef63d0-9093-4fd6-bf51-807a6fcebe8e';
