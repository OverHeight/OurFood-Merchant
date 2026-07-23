import React, { useState } from 'react';
import { Order, OrderStatus } from '../types';
import { ClipboardList, Search, Filter, ChevronRight, Eye } from 'lucide-react';

interface OrdersListViewProps {
  orders: Order[];
  onSelectOrder: (order: Order) => void;
  onUpdateStatus: (orderId: string, newStatus: OrderStatus) => void;
}

export const OrdersListView: React.FC<OrdersListViewProps> = ({
  orders,
  onSelectOrder,
  onUpdateStatus,
}) => {
  const [filterTab, setFilterTab] = useState<'semua' | 'aktif' | 'selesai' | 'batal'>('semua');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase());

    if (filterTab === 'aktif') {
      return (
        matchesSearch &&
        (order.status === 'DISIAPKAN' ||
          order.status === 'SEDANG_DIMASAK' ||
          order.status === 'SIAP_DIANTAR' ||
          order.status === 'DIANTAR')
      );
    }
    if (filterTab === 'selesai') {
      return matchesSearch && order.status === 'SELESAI';
    }
    if (filterTab === 'batal') {
      return matchesSearch && order.status === 'BATAL';
    }
    return matchesSearch;
  });

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'SELESAI':
        return <span className="px-2.5 py-1 bg-emerald-100 text-[#006e2f] rounded-full text-xs font-bold">Selesai</span>;
      case 'SEDANG_DIMASAK':
        return <span className="px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-bold">Sedang Dimasak</span>;
      case 'SIAP_DIANTAR':
      case 'DIANTAR':
        return <span className="px-2.5 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-bold">Diantar</span>;
      case 'DISIAPKAN':
        return <span className="px-2.5 py-1 bg-slate-100 text-slate-800 rounded-full text-xs font-bold">Disiapkan</span>;
      case 'BATAL':
        return <span className="px-2.5 py-1 bg-rose-100 text-rose-800 rounded-full text-xs font-bold">Dibatalkan</span>;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-[0px_4px_12px_rgba(0,0,0,0.05)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-[#006e2f]" />
            <span>Semua Pesanan Restoran</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Daftar lengkap riwayat dan transaksi pesanan merchant.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Cari ID Order / Pelanggan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-[#006e2f] outline-none bg-slate-50"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setFilterTab('semua')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            filterTab === 'semua'
              ? 'bg-[#006e2f] text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          Semua ({orders.length})
        </button>
        <button
          onClick={() => setFilterTab('aktif')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            filterTab === 'aktif'
              ? 'bg-amber-500 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          Aktif / Diproses
        </button>
        <button
          onClick={() => setFilterTab('selesai')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            filterTab === 'selesai'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          Selesai
        </button>
        <button
          onClick={() => setFilterTab('batal')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            filterTab === 'batal'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          Dibatalkan
        </button>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0px_4px_12px_rgba(0,0,0,0.05)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">Pelanggan</th>
                <th className="py-3 px-4">Item Pesanan</th>
                <th className="py-3 px-4">Total</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-800">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Tidak ada pesanan yang sesuai dengan filter.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const itemsSummary = order.items
                    .map((i) => `${i.name} (${i.quantity}x)`)
                    .join(', ');

                  return (
                    <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-[#006e2f]">
                        {order.id}
                        <span className="block text-[10px] text-slate-400 font-normal">
                          {order.time}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        {order.customerName}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">
                        {itemsSummary}
                      </td>
                      <td className="py-3.5 px-4 font-extrabold text-slate-900">
                        Rp {new Intl.NumberFormat('id-ID').format(order.totalPrice)}
                      </td>
                      <td className="py-3.5 px-4">{getStatusBadge(order.status)}</td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => onSelectOrder(order)}
                          className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-[#006e2f] border border-emerald-200 font-bold rounded-lg transition-all inline-flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" /> Detail
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
