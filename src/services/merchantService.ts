import { supabase } from '../lib/supabase';
import { DbMerchant, DbMerchantInsert } from '../lib/database.types';

export async function fetchMerchant(merchantId: string): Promise<DbMerchant | null> {
  const { data, error } = await supabase
    .from('merchant')
    .select('*')
    .eq('merchant_id', merchantId);

  if (error || !data || data.length === 0) {
    console.error('Error fetching merchant:', error);
    return null;
  }
  return data[0];
}

export async function updateMerchant(
  merchantId: string,
  updates: Partial<Pick<DbMerchant, 'nama_merchant' | 'alamat' | 'no_hp' | 'img_url' | 'latitude' | 'longitude'>>
): Promise<DbMerchant | null> {
  const { data, error } = await supabase
    .from('merchant')
    .update(updates)
    .eq('merchant_id', merchantId)
    .select();

  if (error) {
    console.error('Error updating merchant:', error);
    return null;
  }
  return data?.[0] ?? null;
}

export async function updateStoreStatus(
  merchantId: string,
  status: string
): Promise<boolean> {
  const { error } = await supabase
    .from('merchant')
    .update({ status_toko: status })
    .eq('merchant_id', merchantId);

  if (error) {
    console.error('Error updating store status:', error);
    return false;
  }
  return true;
}

export async function registerMerchant(
  newMerchant: Omit<DbMerchantInsert, 'merchant_id' | 'created_at'>
): Promise<DbMerchant | null> {
  const { data, error } = await supabase
    .from('merchant')
    .insert({
      ...newMerchant,
      status_toko: newMerchant.status_toko || 'BUKA',
    })
    .select();

  if (error) {
    console.error('Error registering merchant:', error);
    return null;
  }

  return data?.[0] ?? null;
}
