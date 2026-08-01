import React, { useState } from 'react';
import { Order, OrderStatus, PaymentStatus } from '../types';
import { History, RefreshCw, ChevronRight } from 'lucide-react';

interface OrderHistorySidebarProps {
  historyOrders: Order[];
  onSelectOrder: (order: Order) => void;
  onViewAllHistory: () => void;
}

export const OrderHistorySidebar: React.FC<OrderHistorySidebarProps> = ({
  historyOrders,
  onSelectOrder,
  onViewAllHistory,
}) => {
  const [lastUpdated, setLastUpdated] = useState(
    new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB'
  );
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
      setLastUpdated(timeStr);
      setIsRefreshing(false);
    }, 600);
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'DELIVERED':
        return (
          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[10px] font-bold uppercase tracking-wider">
            Selesai
          </span>
        );
      case 'CANCELLED_BY_MERCHANT':
      case 'CANCELLED_BY_USER':
      case 'DELIVERY_FAILED':
        return (
          <span className="px-2 py-0.5 bg-rose-100 text-rose-800 rounded text-[10px] font-bold uppercase tracking-wider">
            Batal
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-bold uppercase tracking-wider">
            {status}
          </span>
        );
    }
  };

  const getPaymentBadge = (status?: PaymentStatus) => {
    switch (status) {
      case 'SUDAH_BAYAR':
        return (
          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[10px] font-bold uppercase tracking-wider">
            Sudah Bayar
          </span>
        );
      case 'BELUM_BAYAR':
        return (
          <span className="px-2 py-0.5 bg-rose-100 text-rose-700 rounded text-[10px] font-bold uppercase tracking-wider">
            Belum Bayar
          </span>
        );
      case 'REFUNDED':
        return (
          <span className="px-2 py-0.5 bg-slate-200 text-slate-600 rounded text-[10px] font-bold uppercase tracking-wider">
            Refunded
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <aside className="w-full lg:w-[30%] space-y-6">
      <div className="bg-white rounded-xl shadow-[0px_4px_12px_rgba(0,0,0,0.05)] border border-slate-200/60 flex flex-col min-h-[550px]">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-[#BD4444]" />
              <h3 className="text-base font-bold text-slate-900">
                Riwayat Pesanan
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Update terakhir: {lastUpdated}
            </p>
          </div>

          <button
            onClick={handleRefresh}
            className={`p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all cursor-pointer ${
              isRefreshing ? 'animate-spin text-[#BD4444]' : ''
            }`}
            title="Perbarui Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* History Item List */}
        <div className="flex-grow p-4 space-y-3 overflow-y-auto max-h-[600px]">
          {historyOrders.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-8">
              Belum ada riwayat pesanan.
            </p>
          ) : (
            historyOrders.map((order) => (
              <div
                key={order.order_id}
                onClick={() => onSelectOrder(order)}
                className="p-3.5 hover:bg-slate-50/80 transition-all rounded-xl border border-slate-200/60 group cursor-pointer hover:border-emerald-300 shadow-2xs"
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-slate-700">Order Id</span>
                  <span className="text-xs text-slate-400 font-medium">
                    {order.waktu_checkout ? new Date(order.waktu_checkout).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : ''}
                  </span>
                </div>

                <p className="text-sm font-bold text-[#BD4444] mb-2.5">
                  {order.order_id}
                </p>

                <div className="flex items-center gap-1.5 flex-wrap">
                  {getStatusBadge(order.status_order)}
                  {getPaymentBadge(order.paymentStatus)}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Button */}
        <div className="p-4 border-t border-slate-100">
          <button
            onClick={onViewAllHistory}
            className="w-full py-3 bg-slate-50 text-[#BD4444] text-xs font-bold rounded-xl border border-[#e0ceb5] hover:bg-[#F1DEC4] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>Tampilkan Lebih Banyak</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
