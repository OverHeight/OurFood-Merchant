import { useState, useEffect } from 'react';
import { MerchantProfile, StoreStatus } from '../types';
import { fetchMerchant, updateMerchant } from '../services/merchantService';
import { CURRENT_MERCHANT_ID } from '../lib/supabase';

// Initial state fallback if no data yet
const fallbackMerchant: MerchantProfile = {
  merchant_id: CURRENT_MERCHANT_ID,
  nama_merchant: 'Resto Unikom Fine Dining',
  alamat: 'Jl. Dipati Ukur No. 112, Bandung',
  no_hp: '08123456789',
  storeStatus: 'BUKA',
  avatarUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=800&auto=format&fit=crop',
  rating: 4.8,
  totalOrdersThisMonth: 1245
};

export function useMerchant() {
  const [merchant, setMerchant] = useState<MerchantProfile>(fallbackMerchant);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadMerchant() {
      setIsLoading(true);
      const dbMerchant = await fetchMerchant(CURRENT_MERCHANT_ID);
      
      if (dbMerchant) {
        setMerchant((prev) => ({
          ...prev,
          merchant_id: dbMerchant.merchant_id,
          nama_merchant: dbMerchant.nama_merchant,
          alamat: dbMerchant.alamat,
          no_hp: dbMerchant.no_hp,
          avatarUrl: dbMerchant.img_url || prev.avatarUrl,
        }));
      }
      setIsLoading(false);
    }
    
    loadMerchant();
  }, []);

  const handleUpdateStoreStatus = (newStatus: StoreStatus) => {
    // Currently only local state, as status is not in Supabase
    setMerchant((prev) => ({ ...prev, storeStatus: newStatus }));
  };

  const handleUpdateProfile = async (updates: Partial<MerchantProfile>) => {
    // Optimistic update locally
    setMerchant((prev) => ({ ...prev, ...updates }));

    // Send to Supabase
    await updateMerchant(CURRENT_MERCHANT_ID, {
      nama_merchant: updates.nama_merchant,
      alamat: updates.alamat,
      no_hp: updates.no_hp,
      img_url: updates.avatarUrl
    });
  };

  return {
    merchant,
    isLoading,
    handleUpdateStoreStatus,
    handleUpdateProfile
  };
}
