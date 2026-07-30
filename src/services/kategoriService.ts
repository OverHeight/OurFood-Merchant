import { supabase } from '../lib/supabase';
import { DbKategori } from '../lib/database.types';

export async function fetchKategori(): Promise<DbKategori[]> {
  const { data, error } = await supabase
    .from('kategori')
    .select('*')
    .order('nama');

  if (error) {
    console.error('Error fetching kategori:', error);
    return [];
  }
  return data ?? [];
}
