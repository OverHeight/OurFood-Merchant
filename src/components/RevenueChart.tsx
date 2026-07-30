import React, { useState } from 'react';
import { THIS_WEEK_REVENUE, LAST_WEEK_REVENUE, THIS_MONTH_REVENUE, TODAY_REVENUE } from '../data/mockData';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';

type Period = 'harian' | 'mingguan_ini' | 'mingguan_lalu' | 'bulanan';

const PERIOD_CONFIG: Record<Period, { label: string; data: typeof THIS_WEEK_REVENUE }> = {
  harian:        { label: 'Hari Ini',     data: TODAY_REVENUE },
  mingguan_ini:  { label: 'Minggu Ini',   data: THIS_WEEK_REVENUE },
  mingguan_lalu: { label: 'Minggu Lalu',  data: LAST_WEEK_REVENUE },
  bulanan:       { label: 'Bulan Ini',    data: THIS_MONTH_REVENUE },
};

interface RevenueChartProps {
  compact?: boolean;
}

export const RevenueChart: React.FC<RevenueChartProps> = ({ compact = false }) => {
  const [period, setPeriod] = useState<Period>('mingguan_ini');

  const config = PERIOD_CONFIG[period];
  const data = config.data;
  const currentTotal = data.reduce((acc, curr) => acc + curr.amount, 0);
  const prevTotal = THIS_WEEK_REVENUE.reduce((acc, c) => acc + c.amount, 0); // baseline for comparison
  const trend = period === 'mingguan_ini'
    ? ((currentTotal - prevTotal) / prevTotal) * 100
    : 0;
  const trendVsLast = period === 'mingguan_ini'
    ? ((THIS_WEEK_REVENUE.reduce((a,c)=>a+c.amount,0) - LAST_WEEK_REVENUE.reduce((a,c)=>a+c.amount,0)) / LAST_WEEK_REVENUE.reduce((a,c)=>a+c.amount,0)) * 100
    : null;

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
              {config.label}:{' '}
              <span className="font-bold text-[#BD4444]">
                Rp {new Intl.NumberFormat('id-ID').format(currentTotal)}
              </span>
            </p>
            {trendVsLast !== null && (
              <span className={`flex items-center gap-0.5 text-[11px] font-bold px-2 py-0.5 rounded-full ${trendVsLast >= 0 ? 'bg-emerald-100 text-[#BD4444]' : 'bg-rose-100 text-rose-700'}`}>
                {trendVsLast >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {Math.abs(trendVsLast).toFixed(1)}%
              </span>
            )}
          </div>
        </div>

        {/* Period Switcher Pills */}
        <div className="flex flex-wrap gap-1.5">
          {PILLS.map((p) => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
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
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
              {data.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={index === data.length - 1 || index === data.length - 2 ? '#006e2f' : '#22c55e'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
