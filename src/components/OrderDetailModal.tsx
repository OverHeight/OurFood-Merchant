import React from 'react';
import { Order, OrderStatus } from '../types';
import { X, Printer, Clock, User, Phone, MapPin, CheckCircle, AlertCircle, ShoppingBag } from 'lucide-react';

interface OrderDetailModalProps {
  order: Order | null;
  onClose: () => void;
  onUpdateStatus: (orderId: string, newStatus: OrderStatus) => void;
  onCancelOrder: (orderId: string) => void;
}

export const OrderDetailModal: React.FC<OrderDetailModalProps> = ({
  order,
  onClose,
  onUpdateStatus,
  onCancelOrder,
}) => {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  const formattedPrice = new Intl.NumberFormat('id-ID').format(order.total_harga);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#006e2f]" />
            <h3 className="text-base font-bold text-slate-900">
              Detail Pesanan <span className="text-[#006e2f]">{order.order_id}</span>
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Area / Receipt content */}
        <div className="p-6 overflow-y-auto space-y-4">
          {/* Customer & Order Metadata Card */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200/80">
              <span className="text-slate-500 font-medium">Pelanggan</span>
              <span className="font-bold text-slate-900">{order.nama}</span>
            </div>
            {order.no_hp && (
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">No. Telepon</span>
                <span className="font-semibold text-slate-800">{order.no_hp}</span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-medium">Waktu Pemesanan</span>
              <span className="font-semibold text-slate-800">{order.waktu_checkout} WIB</span>
            </div>
            {order.deliveryType && (
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Tipe Layanan</span>
                <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {order.deliveryType}
                </span>
              </div>
            )}
            {order.alamat_pengantaran && (
              <div className="flex justify-between items-start pt-1">
                <span className="text-slate-500 font-medium">Alamat</span>
                <span className="font-medium text-slate-800 text-right max-w-[200px]">
                  {order.alamat_pengantaran}
                </span>
              </div>
            )}
          </div>

          {/* Ordered Items List */}
          <div>
            <p className="text-xs font-bold text-slate-700 uppercase mb-2">Rincian Item</p>
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
              {order.items.map((item, idx) => (
                <div key={idx} className="p-3 bg-white flex justify-between items-start">
                  <div>
                    <p className="text-xs font-bold text-slate-900">
                      {item.nama_menu} <span className="text-[#006e2f]">x{item.jumlah}</span>
                    </p>
                    {item.notes && (
                      <p className="text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded mt-1 inline-block border border-amber-200">
                        Catatan: {item.notes}
                      </p>
                    )}
                  </div>
                  <p className="text-xs font-bold text-slate-800">
                    Rp {new Intl.NumberFormat('id-ID').format(item.harga_saat_itu * item.jumlah)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Summary */}
          <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-200/80 flex justify-between items-center">
            <div>
              <p className="text-xs text-slate-500 font-medium">Total Harga</p>
              <p className="text-base font-extrabold text-[#006e2f]">
                Rp {formattedPrice}
              </p>
            </div>
            <span className="text-xs font-bold px-3 py-1 bg-emerald-100 text-[#006e2f] rounded-full uppercase">
              {order.paymentStatus}
            </span>
          </div>

          {/* Cancel Reason (if cancelled) */}
          {order.status_order === 'BATAL' && order.cancelReason && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl">
              <p className="text-xs font-bold text-rose-700 mb-1">Alasan Pembatalan:</p>
              <p className="text-xs text-rose-600">{order.cancelReason}</p>
            </div>
          )}

          {/* Quick Status Control */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <p className="text-xs font-bold text-slate-700 uppercase">Ubah Status Pesanan</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                onClick={() => onUpdateStatus(String(order.order_id), 'SEDANG_DIMASAK')}
                className={`py-2 px-1 rounded-xl text-xs font-bold transition-all border ${
                  order.status_order === 'SEDANG_DIMASAK'
                    ? 'bg-amber-500 text-white border-amber-500'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Diproses
              </button>

              <button
                onClick={() => onUpdateStatus(String(order.order_id), 'SIAP_DIANTAR')}
                className={`py-2 px-1 rounded-xl text-xs font-bold transition-all border ${
                  order.status_order === 'SIAP_DIANTAR'
                    ? 'bg-[#006e2f] text-white border-[#006e2f]'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Siap
              </button>

              <button
                onClick={() => onUpdateStatus(String(order.order_id), 'SELESAI')}
                className={`py-2 px-1 rounded-xl text-xs font-bold transition-all border ${
                  order.status_order === 'SELESAI'
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Selesai
              </button>

              <button
                onClick={() => onCancelOrder(String(order.order_id))}
                disabled={order.status_order === 'BATAL' || order.status_order === 'SELESAI'}
                className={`py-2 px-1 rounded-xl text-xs font-bold transition-all border ${
                  order.status_order === 'BATAL'
                    ? 'bg-rose-600 text-white border-rose-600'
                    : 'bg-slate-50 text-rose-700 border-rose-200 hover:bg-rose-50 disabled:opacity-40 disabled:cursor-not-allowed'
                }`}
              >
                Batalkan
              </button>
            </div>
          </div>
        </div>

        {/* Actions Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold rounded-xl flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Struk</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold rounded-xl"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
