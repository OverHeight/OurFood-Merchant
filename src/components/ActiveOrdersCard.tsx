import React from 'react';
import { Order, OrderStatus } from '../types';
import { Utensils, Coffee, Soup, BarChart2, ChevronRight, CheckCircle2, Clock, Truck, Play } from 'lucide-react';

interface ActiveOrdersCardProps {
  orders: Order[];
  onSelectOrder: (order: Order) => void;
  onUpdateStatus: (orderId: string, newStatus: OrderStatus) => void;
  onViewAll: () => void;
}

export const ActiveOrdersCard: React.FC<ActiveOrdersCardProps> = ({
  orders,
  onSelectOrder,
  onUpdateStatus,
  onViewAll,
}) => {
  const getOrderIcon = (itemNames: string) => {
    const lower = itemNames.toLowerCase();
    if (lower.includes('kopi') || lower.includes('teh') || lower.includes('es')) {
      return <Coffee className="w-6 h-6 text-[#006e2f]" />;
    }
    if (lower.includes('soto') || lower.includes('sop')) {
      return <Soup className="w-6 h-6 text-[#006e2f]" />;
    }
    return <Utensils className="w-6 h-6 text-[#006e2f]" />;
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'SEDANG_DIMASAK':
        return <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">Sedang Dimasak</span>;
      case 'SIAP_DIANTAR':
        return <span className="text-xs font-bold text-[#006e2f] bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">Siap Diantar</span>;
      case 'DISIAPKAN':
        return <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">Menunggu Konfirmasi</span>;
      case 'DIANTAR':
        return <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200">Dalam Pengiriman</span>;
      default:
        return <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">{status}</span>;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-[0px_4px_12px_rgba(0,0,0,0.05)] border border-slate-200/60 overflow-hidden min-h-[380px] flex flex-col">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-bold text-slate-900">Pesanan Aktif</h3>
          <span className="text-xs font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full">
            {orders.length}
          </span>
        </div>
        <button
          onClick={onViewAll}
          className="text-xs font-bold text-[#006e2f] hover:underline flex items-center gap-1"
        >
          Lihat Semua <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Content */}
      <div className="p-5 flex-grow flex flex-col gap-3">
        {orders.length === 0 ? (
          <div className="flex-grow flex items-center justify-center py-12 text-slate-400">
            <div className="text-center">
              <BarChart2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm font-medium text-slate-500">
                Tidak ada pesanan aktif saat ini.
              </p>
            </div>
          </div>
        ) : (
          orders.map((order) => {
            const summaryTitle = order.items
              .map((i) => `${i.nama_menu} (${i.jumlah}x)`)
              .join(', ');
            const formattedPrice = new Intl.NumberFormat('id-ID').format(order.total_harga);

            return (
              <div
                key={order.order_id}
                className="group p-4 bg-[#f8f9ff] rounded-xl border border-slate-200/80 hover:border-emerald-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
              >
                {/* Left side info */}
                <div
                  onClick={() => onSelectOrder(order)}
                  className="flex items-center gap-3.5 flex-1 cursor-pointer"
                >
                  <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center shrink-0 border border-emerald-100">
                    {getOrderIcon(summaryTitle)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm md:text-base font-bold text-slate-900 truncate">
                        {summaryTitle}
                      </p>
                      <span className="text-[10px] font-semibold text-slate-400">
                        {order.waktu_checkout}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      Pesanan oleh: <span className="text-slate-800 font-semibold">{order.nama}</span> • {order.order_id}
                    </p>
                  </div>
                </div>

                {/* Right side price & status button */}
                <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200/60">
                  <div className="text-left sm:text-right">
                    <p className="text-sm font-bold text-slate-900">
                      Rp. {formattedPrice}
                    </p>
                    <div className="mt-0.5">{getStatusBadge(order.status_order)}</div>
                  </div>

                  {/* Quick Action buttons */}
                  <div className="flex items-center gap-1">
                    {order.status_order === 'DISIAPKAN' && (
                      <button
                        onClick={() => onUpdateStatus(String(order.order_id), 'SEDANG_DIMASAK')}
                        className="px-2.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold transition-all shadow-2xs"
                        title="Proses Masak"
                      >
                        Masak
                      </button>
                    )}
                    {order.status_order === 'SEDANG_DIMASAK' && (
                      <button
                        onClick={() => onUpdateStatus(String(order.order_id), 'SIAP_DIANTAR')}
                        className="px-2.5 py-1.5 bg-[#006e2f] hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition-all shadow-2xs"
                        title="Tandai Siap Diantar"
                      >
                        Siap
                      </button>
                    )}
                    {order.status_order === 'SIAP_DIANTAR' && (
                      <button
                        onClick={() => onUpdateStatus(String(order.order_id), 'SELESAI')}
                        className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-2xs"
                        title="Tandai Selesai"
                      >
                        Selesai
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}

        {/* Atmospheric Placeholder Footer matching HTML */}
        <div className="mt-2 pt-4 border-t border-slate-100 flex items-center justify-center text-slate-400 opacity-60">
          <div className="text-center flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <p className="text-xs font-medium text-slate-500">
              Menunggu pesanan baru masuk...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
