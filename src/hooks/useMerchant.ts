import { useState, useEffect } from 'react';
import { MerchantProfile, StoreStatus } from '../types';
import { fetchMerchant, updateMerchant, updateStoreStatus } from '../services/merchantService';
import { getMerchantId } from '../lib/supabase';

const fallbackMerchant: MerchantProfile = {
  merchant_id: getMerchantId(),
  nama_merchant: 'OurFood Merchant',
  alamat: 'Jl. Dipati Ukur No. 112, Bandung',
  no_hp: '08123456789',
  latitude: -6.8868,
  longitude: 107.6153,
  storeStatus: 'BUKA',
  avatarUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=800&auto=format&fit=crop',
  rating: 4.8,
  totalOrdersThisMonth: 1245,
};

export function useMerchant() {
  const [merchant, setMerchant] = useState<MerchantProfile>(fallbackMerchant);
  const [isLoading, setIsLoading] = useState(true);

  const merchantId = getMerchantId();

  useEffect(() => {
    async function loadMerchant() {
      setIsLoading(true);
      const dbMerchant = await fetchMerchant(merchantId);

      if (dbMerchant) {
        setMerchant((prev) => ({
          ...prev,
          merchant_id: dbMerchant.merchant_id,
          nama_merchant: dbMerchant.nama_merchant || prev.nama_merchant,
          alamat: dbMerchant.alamat || prev.alamat,
          no_hp: dbMerchant.no_hp || prev.no_hp,
          latitude: dbMerchant.latitude,
          longitude: dbMerchant.longitude,
          storeStatus: (dbMerchant.status_toko as StoreStatus) || prev.storeStatus || 'BUKA',
          avatarUrl: dbMerchant.img_url || prev.avatarUrl,
        }));
      }
      setIsLoading(false);
    }

    loadMerchant();
  }, [merchantId]);

  const handleUpdateStoreStatus = async (newStatus: StoreStatus) => {
    // Optimistic local state update
    setMerchant((prev) => ({ ...prev, storeStatus: newStatus }));

    // Persist to Supabase
    await updateStoreStatus(merchantId, newStatus);
  };

  const handleUpdateProfile = async (updates: Partial<MerchantProfile>) => {
    // Optimistic update locally
    setMerchant((prev) => ({ ...prev, ...updates }));

    // Send to Supabase
    await updateMerchant(merchantId, {
      nama_merchant: updates.nama_merchant,
      alamat: updates.alamat,
      no_hp: updates.no_hp,
      img_url: updates.avatarUrl,
      latitude: updates.latitude,
      longitude: updates.longitude,
    });
  };

  return {
    merchant,
    isLoading,
    handleUpdateStoreStatus,
    handleUpdateProfile,
  };
}
