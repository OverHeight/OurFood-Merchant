import React from "react";
import { Order, OrderStatus, PaymentStatus } from "../types";
import {
  X,
  Printer,
  ShoppingBag,
  UserCheck,
  MapPin,
  Phone,
  CheckCircle2,
  AlertOctagon,
} from "lucide-react";

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

  const formattedPrice = new Intl.NumberFormat("id-ID").format(
    order.total_harga,
  );

  const paymentLabel = (status?: PaymentStatus | string | null) => {
    const normalized = String(status || "")
      .trim()
      .toUpperCase();

    if (
      normalized === "SUDAH_BAYAR" ||
      normalized === "LUNAS" ||
      normalized === "PAID" ||
      normalized === "SETTLED" ||
      normalized === "SUCCESS"
    ) {
      return "Sudah Bayar";
    }

    if (normalized === "REFUNDED" || normalized === "REFUND") {
      return "Refunded";
    }

    return "Belum Bayar";
  };

  const isWaiting = order.status_order === "WAITING_MERCHANT";
  const isAcceptedOrInProgress =
    order.status_order === "PREPARING" ||
    order.status_order === "READY_FOR_PICKUP" ||
    order.status_order === "ON_THE_WAY";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#BD4444]" />
            <h3 className="text-base font-bold text-slate-900">
              Rincian Pesanan
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Receipt content */}
        <div className="p-6 overflow-y-auto space-y-4">
          {/* Customer Metadata Card */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
            <div className="flex justify-between items-start pb-2 border-b border-slate-200/80">
              <span className="text-slate-500 font-medium">Nama Pemesan</span>
              <div className="text-right">
                <span className="font-extrabold text-slate-900 text-sm block">
                  {order.nama || "Pelanggan"}
                </span>
                {order.customerType === "walk-in" && (
                  <span className="mt-1 inline-block px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold uppercase">
                    Pelanggan Walk-in
                  </span>
                )}
              </div>
            </div>
            {order.no_hp && (
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">No. Telepon</span>
                <span className="font-semibold text-slate-800">
                  {order.no_hp}
                </span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-medium">
                Waktu Pemesanan
              </span>
              <span className="font-semibold text-slate-800">
                {order.waktu_checkout ? new Date(order.waktu_checkout).toLocaleString('id-ID') : ''}
              </span>
            </div>

            {/* Address details */}
            {order.alamat_pengantaran && (
              <div className="flex justify-between items-start pt-1 border-t border-slate-200/60">
                <span className="text-slate-500 font-medium flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" /> Alamat Pengantaran
                </span>
                <span className="font-semibold text-slate-800 text-right max-w-[220px]">
                  {order.alamat_pengantaran}
                </span>
              </div>
            )}

            {/* Driver Details if assigned */}
            {order.driver && (
              <div className="pt-2 border-t border-slate-200/80 flex justify-between items-center text-indigo-900 bg-indigo-50/70 p-2.5 rounded-lg">
                <div className="flex items-center gap-1.5 font-bold">
                  <UserCheck className="w-4 h-4 text-indigo-600" />
                  <span>Driver: {order.driver.nama}</span>
                </div>
                <div className="text-right text-[11px]">
                  <span className="block font-semibold">{order.driver.plat_nomor || '-'}</span>
                  {order.driver.no_hp && (
                    <span className="flex items-center gap-1 text-slate-600">
                      <Phone className="w-3 h-3" /> {order.driver.no_hp}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Ordered Items List */}
          <div>
            <p className="text-xs font-bold text-slate-700 uppercase mb-2 tracking-wider">
              Daftar Menu Yang Dipesan
            </p>
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white">
              {order.items.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 flex justify-between items-start hover:bg-slate-50/80 transition-colors"
                >
                  <div>
                    <p className="text-sm font-bold text-slate-900">
                      {item.nama_menu}{" "}
                      <span className="text-[#BD4444] font-extrabold">x{item.jumlah}</span>
                    </p>
                    {item.notes && (
                      <p className="text-[11px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md mt-1 inline-block border border-amber-200 font-medium">
                        Catatan: {item.notes}
                      </p>
                    )}
                  </div>
                  <p className="text-sm font-extrabold text-slate-900">
                    Rp{" "}
                    {new Intl.NumberFormat("id-ID").format(
                      item.harga_saat_itu * item.jumlah,
                    )}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Total & Payment Summary */}
          <div className="p-4 bg-[#F1DEC4]/40 rounded-xl border border-[#e0ceb5] flex justify-between items-center">
            <div>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Total Pembayaran</p>
              <p className="text-lg font-extrabold text-[#BD4444]">
                Rp {formattedPrice}
              </p>
            </div>
            <span className="text-xs font-bold px-3 py-1 bg-emerald-100 text-[#BD4444] rounded-full uppercase">
              {paymentLabel(order.paymentStatus)}
            </span>
          </div>

          {/* Cancel Reason (if already cancelled) */}
          {(order.status_order === "CANCELLED_BY_MERCHANT" || order.status_order === "CANCELLED_BY_USER") && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl">
              <p className="text-xs font-bold text-rose-700 mb-1 flex items-center gap-1">
                <AlertOctagon className="w-4 h-4" /> Alasan Pembatalan:
              </p>
              <p className="text-xs text-rose-600 font-medium">
                {order.cancelReason || (order.status_order === "CANCELLED_BY_USER" ? "Dibatalkan oleh Pelanggan" : "Dibatalkan oleh Merchant")}
              </p>
            </div>
          )}

          {/* If order is already accepted, show Batalkan Pesanan option inside modal */}
          {isAcceptedOrInProgress && (
            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => onCancelOrder(String(order.order_id))}
                className="w-full py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <AlertOctagon className="w-4 h-4" />
                <span>Batalkan Pesanan Ini</span>
              </button>
            </div>
          )}
        </div>

        {/* Modal Actions Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3">
          <button
            onClick={handlePrint}
            className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Struk</span>
          </button>

          {isWaiting ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onCancelOrder(String(order.order_id))}
                className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Tolak
              </button>
              <button
                onClick={() => {
                  onUpdateStatus(String(order.order_id), "PREPARING");
                  onClose();
                }}
                className="px-5 py-2.5 bg-[#677E61] hover:bg-[#54684f] text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Terima Pesanan</span>
              </button>
            </div>
          ) : (
            <button
              onClick={onClose}
              className="px-5 py-2.5 bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold rounded-xl cursor-pointer"
            >
              Tutup
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
