import React from 'react';

interface StatCardsRowProps {
  todayCount: number;
  completedCount: number;
  inProgressCount: number;
  cancelledCount: number;
  totalRevenue: number;
}

export const StatCardsRow: React.FC<StatCardsRowProps> = ({
  todayCount,
  completedCount,
  inProgressCount,
  cancelledCount,
  totalRevenue,
}) => {
  const formattedRevenue = new Intl.NumberFormat('id-ID').format(totalRevenue);

  return (
    <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {/* Today's Order */}
      <div className="bg-white p-5 rounded-xl shadow-[0px_4px_12px_rgba(0,0,0,0.05)] border border-slate-200/60 flex flex-col justify-between hover:border-emerald-300 transition-all">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Pesanan Hari Ini
        </span>
        <h2 className="text-3xl font-bold text-[#BD4444] mt-2">
          {todayCount}
        </h2>
      </div>

      {/* Finished Order */}
      <div className="bg-white p-5 rounded-xl shadow-[0px_4px_12px_rgba(0,0,0,0.05)] border border-slate-200/60 flex flex-col justify-between hover:border-emerald-300 transition-all">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Pesanan Selesai
        </span>
        <h2 className="text-3xl font-bold text-slate-800 mt-2">
          {completedCount}
        </h2>
      </div>

      {/* In Progress */}
      <div className="bg-white p-5 rounded-xl shadow-[0px_4px_12px_rgba(0,0,0,0.05)] border border-slate-200/60 flex flex-col justify-between hover:border-amber-300 transition-all">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Sedang Diproses
        </span>
        <h2 className="text-3xl font-bold text-amber-600 mt-2">
          {inProgressCount}
        </h2>
      </div>

      {/* Cancelled */}
      <div className="bg-white p-5 rounded-xl shadow-[0px_4px_12px_rgba(0,0,0,0.05)] border border-slate-200/60 flex flex-col justify-between hover:border-slate-300 transition-all">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Dibatalkan
        </span>
        <h2 className="text-3xl font-bold text-slate-400 mt-2">
          {cancelledCount}
        </h2>
      </div>

      {/* Revenue */}
      <div className="bg-gradient-to-br from-[#BD4444] to-emerald-700 p-6 rounded-2xl shadow-lg border border-emerald-800/60 flex flex-col justify-between transition-all col-span-2 md:col-span-4 text-white">
        <span className="text-sm font-semibold text-emerald-100 uppercase tracking-wider">
          Total Pendapatan
        </span>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-emerald-200">Rp</span>
          <span className="text-4xl md:text-5xl font-extrabold tracking-tight">
            {formattedRevenue}
          </span>
        </div>
      </div>
    </section>
  );
};
