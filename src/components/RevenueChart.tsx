import React, { useState } from 'react';
import { THIS_WEEK_REVENUE, LAST_WEEK_REVENUE } from '../data/mockData';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export const RevenueChart: React.FC = () => {
  const [selectedWeek, setSelectedWeek] = useState<'thisWeek' | 'lastWeek'>('thisWeek');

  const data = selectedWeek === 'thisWeek' ? THIS_WEEK_REVENUE : LAST_WEEK_REVENUE;

  const totalThisWeek = THIS_WEEK_REVENUE.reduce((acc, curr) => acc + curr.amount, 0);
  const totalLastWeek = LAST_WEEK_REVENUE.reduce((acc, curr) => acc + curr.amount, 0);
  const currentTotal = selectedWeek === 'thisWeek' ? totalThisWeek : totalLastWeek;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-slate-900 text-white p-2.5 rounded-xl text-xs shadow-lg border border-slate-700">
          <p className="font-bold text-emerald-400">{label}</p>
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

  return (
    <div className="bg-white rounded-xl shadow-[0px_4px_12px_rgba(0,0,0,0.05)] p-5 border border-slate-200/60">
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900">
            Grafik Pendapatan Mingguan
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Total {selectedWeek === 'thisWeek' ? 'Minggu Ini' : 'Minggu Lalu'}:{' '}
            <span className="font-bold text-[#006e2f]">
              Rp {new Intl.NumberFormat('id-ID').format(currentTotal)}
            </span>
          </p>
        </div>

        {/* Week Switcher Pills */}
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedWeek('thisWeek')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
              selectedWeek === 'thisWeek'
                ? 'bg-[#22c55e] text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            Minggu Ini
          </button>
          <button
            onClick={() => setSelectedWeek('lastWeek')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
              selectedWeek === 'lastWeek'
                ? 'bg-[#006e2f] text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            Minggu Lalu
          </button>
        </div>
      </div>

      {/* Chart Container */}
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6d7b6c', fontSize: 12, fontWeight: 600 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94a3b8', fontSize: 10 }}
              tickFormatter={(value) => `${value / 1000}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={index === 3 || index === 4 ? '#006e2f' : '#22c55e'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
