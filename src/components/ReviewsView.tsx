import React, { useState } from 'react';
import { Review } from '../types';
import { Star, MessageSquare, Filter, CheckCircle, TrendingUp } from 'lucide-react';

interface ReviewsViewProps {
  reviews: Review[];
}

const StarRating: React.FC<{ rating: number; size?: 'sm' | 'md' }> = ({ rating, size = 'sm' }) => {
  const cls = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`${cls} ${s <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300 fill-slate-200'}`}
        />
      ))}
    </div>
  );
};

export const ReviewsView: React.FC<ReviewsViewProps> = ({ reviews }) => {
  const [filterRating, setFilterRating] = useState<number | 'semua'>('semua');

  const avgRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  const ratingCounts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
    pct: reviews.length > 0
      ? (reviews.filter((r) => r.rating === star).length / reviews.length) * 100
      : 0,
  }));

  const filtered = reviews.filter((r) =>
    filterRating === 'semua' ? true : r.rating === filterRating
  );

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-[0px_4px_12px_rgba(0,0,0,0.05)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Star className="w-6 h-6 fill-amber-400 text-amber-400" />
            <span>Ulasan Pelanggan</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Semua ulasan yang diberikan pelanggan terhadap restoran Anda.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 px-4 py-2.5 rounded-xl">
          <div className="text-center">
            <p className="text-2xl font-extrabold text-amber-600">{avgRating.toFixed(1)}</p>
            <StarRating rating={Math.round(avgRating)} size="sm" />
          </div>
          <div className="text-left">
            <p className="text-xs font-bold text-slate-700">{reviews.length} ulasan</p>
            <p className="text-[11px] text-slate-500">Rating rata-rata</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar: Rating Breakdown */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-[0px_4px_12px_rgba(0,0,0,0.05)] h-fit">
          <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-[#006e2f]" />
            Distribusi Rating
          </h3>
          <div className="space-y-2.5">
            {ratingCounts.map(({ star, count, pct }) => (
              <button
                key={star}
                onClick={() => setFilterRating(filterRating === star ? 'semua' : star)}
                className={`w-full flex items-center gap-2 group transition-all rounded-lg px-1 py-0.5 ${filterRating === star ? 'bg-amber-50' : 'hover:bg-slate-50'}`}
              >
                <span className="text-xs font-bold text-slate-700 w-3">{star}</span>
                <Star className="w-3 h-3 fill-amber-400 text-amber-400 shrink-0" />
                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-[11px] text-slate-500 w-4 text-right">{count}</span>
              </button>
            ))}
          </div>

          {/* Filter Pills */}
          <div className="mt-4 pt-4 border-t border-slate-100">
            <p className="text-[11px] font-bold text-slate-500 uppercase mb-2 flex items-center gap-1">
              <Filter className="w-3 h-3" /> Filter
            </p>
            <button
              onClick={() => setFilterRating('semua')}
              className={`w-full py-1.5 rounded-lg text-xs font-bold transition-all ${filterRating === 'semua' ? 'bg-[#006e2f] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              Semua ({reviews.length})
            </button>
          </div>
        </div>

        {/* Review List */}
        <div className="lg:col-span-3 space-y-3">
          {filtered.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center text-slate-400">
              <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm font-medium">Tidak ada ulasan untuk filter ini.</p>
            </div>
          ) : (
            filtered.map((review) => (
              <div
                key={review.review_id}
                className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-[0px_4px_12px_rgba(0,0,0,0.05)] hover:border-amber-200 transition-all"
              >
                <div className="flex items-start gap-3">
                  <img
                    src={review.avatar_url || `https://i.pravatar.cc/150?u=${review.review_id}`}
                    alt={review.nama_pelanggan}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-100 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div>
                        <p className="text-sm font-bold text-slate-900">{review.nama_pelanggan}</p>
                        <p className="text-[11px] text-slate-500">{formatTime(review.waktu)}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <StarRating rating={review.rating} />
                        {review.dibalas && (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" /> Dibalas
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-slate-700 mt-2 leading-relaxed">{review.komentar}</p>

                    <div className="mt-2">
                      <span className="text-[11px] bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg font-medium">
                        Menu: {review.nama_menu}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
