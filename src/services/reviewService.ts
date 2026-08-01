import { supabase } from '../lib/supabase';
import { Review } from '../types';

export async function fetchReviewsByMerchant(merchantId: string): Promise<Review[]> {
  try {
    // 1. Fetch raw reviews directly for this merchant
    const { data: dbReviews, error } = await supabase
      .from('review_merchant')
      .select('*')
      .eq('merchant_id', merchantId)
      .order('created_at', { ascending: false });

    if (error || !dbReviews || dbReviews.length === 0) {
      if (error) console.error('Error fetching merchant reviews:', error);
      return [];
    }

    // 2. Fetch customer names from user_profile table safely
    const userIds = Array.from(new Set(dbReviews.map((r) => r.user_id).filter(Boolean)));
    const userMap = new Map<string, string>();

    if (userIds.length > 0) {
      const { data: users } = await supabase
        .from('user_profile')
        .select('user_id, nama')
        .in('user_id', userIds);

      (users || []).forEach((u) => {
        if (u.user_id && u.nama) userMap.set(u.user_id, u.nama);
      });
    }

    // 3. Map to frontend Review interface
    return dbReviews.map((r: any) => ({
      review_id: r.review_id,
      order_id: r.order_id,
      user_id: r.user_id,
      merchant_id: r.merchant_id,
      nama_pelanggan: userMap.get(r.user_id) || 'Pelanggan',
      rating: r.rating || 5,
      komentar: r.komentar || '',
      nama_menu: 'Pesanan Restoran',
      waktu: r.created_at
        ? new Date(r.created_at).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })
        : 'Baru saja',
      img_url: r.img_url || undefined,
      dibalas: false,
    }));
  } catch (err) {
    console.error('Exception in fetchReviewsByMerchant:', err);
    return [];
  }
}
