import { supabase } from '../lib/supabase';
import { DbMerchant } from '../lib/database.types';

export async function fetchMerchant(merchantId: string): Promise<DbMerchant | null> {
  const { data, error } = await supabase
    .from('merchant')
    .select('*')
    .eq('merchant_id', merchantId)
    .single();

  if (error) {
    console.error('Error fetching merchant:', error);
    return null;
  }
  return data;
}

export async function updateMerchant(
  merchantId: string,
  updates: Partial<Pick<DbMerchant, 'nama_merchant' | 'alamat' | 'no_hp' | 'img_url'>>
): Promise<DbMerchant | null> {
  const { data, error } = await supabase
    .from('merchant')
    .update(updates)
    .eq('merchant_id', merchantId)
    .select()
    .single();

  if (error) {
    console.error('Error updating merchant:', error);
    return null;
  }
  return data;
}
