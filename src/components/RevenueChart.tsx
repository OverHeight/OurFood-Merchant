import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { fetchRevenueData } from '../services/orderService';
import { getMerchantId } from '../lib/supabase';
import { RevenueDataPoint } from '../types';

type Period = 'harian' | 'mingguan_ini' | 'mingguan_lalu' | 'bulanan';

const PERIOD_LABELS: Record<Period, string> = {
  harian: 'Hari Ini',
  mingguan_ini: 'Minggu Ini',
  mingguan_lalu: 'Minggu Lalu',
  bulanan: 'Bulan Ini',
};

interface RevenueChartProps {
  compact?: boolean;
}

export const RevenueChart: React.FC<RevenueChartProps> = ({ compact = false }) => {
  const [period, setPeriod] = useState<Period>('mingguan_ini');
  const [chartData, setChartData] = useState<RevenueDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const merchantId = getMerchantId();

  useEffect(() => {
    async function loadRevenue() {
      setIsLoading(true);
      const data = await fetchRevenueData(merchantId, period);
      setChartData(data);
      setIsLoading(false);
    }
    loadRevenue();
  }, [merchantId, period]);

  const currentTotal = chartData.reduce((acc, curr) => acc + curr.amount, 0);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-slate-900 text-white p-2.5 rounded-xl text-xs shadow-lg border border-slate-700">
          <p className="font-bold text-[#73976A]">{label}</p>
          <p className="font-semibold mt-1">
            Pendapatan: Rp {new Intl.NumberFormat('id-ID').format(item.amount)}
          </p>
          <p className="text-slate-300 text-[11px] mt-0.5">
            Total Order: {item.orderCount} pesanan
          </p>
        </div>
      );
    }
    return null;
  };

  const PILLS: { key: Period; label: string }[] = [
    { key: 'harian', label: 'Harian' },
    { key: 'mingguan_ini', label: 'Mingguan' },
    { key: 'mingguan_lalu', label: 'Minggu Lalu' },
    { key: 'bulanan', label: 'Bulanan' },
  ];

  return (
    <div className="bg-white rounded-xl shadow-[0px_4px_12px_rgba(0,0,0,0.05)] p-5 border border-slate-200/60">
      {/* Chart Header */}
      <div className={`flex flex-col ${compact ? 'gap-2 mb-4' : 'sm:flex-row sm:items-center justify-between gap-3 mb-6'}`}>
        <div>
          <h3 className="text-lg font-bold text-slate-900">
            Grafik Pendapatan
          </h3>
          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-xs text-slate-500 font-medium">
              {PERIOD_LABELS[period]}:{' '}
              <span className="font-bold text-[#BD4444]">
                Rp {new Intl.NumberFormat('id-ID').format(currentTotal)}
              </span>
            </p>
          </div>
        </div>

        {/* Period Switcher Pills */}
        <div className="flex flex-wrap gap-1.5">
          {PILLS.map((p) => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                period === p.key
                  ? 'bg-[#BD4444] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Container */}
      <div className="h-56 w-full">
        {isLoading ? (
          <div className="h-full flex items-center justify-center text-slate-400 text-xs font-medium">
            Memuat grafik pendapatan...
          </div>
        ) : chartData.length === 0 || currentTotal === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs font-medium border border-dashed border-slate-200 rounded-xl">
            <p>Belum ada pendapatan dari pesanan yang selesai pada periode ini.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6d7b6c', fontSize: 11, fontWeight: 600 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#94a3b8', fontSize: 10 }}
                tickFormatter={(value) => `${value / 1000}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
                {chartData.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={index === chartData.length - 1 ? '#006e2f' : '#22c55e'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
