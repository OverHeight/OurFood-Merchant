import React, { useState } from 'react';
import { X, AlertTriangle, MessageSquare } from 'lucide-react';

interface CancelOrderModalProps {
  orderId: string;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (orderId: string, reason: string) => void;
}

const CANCEL_REASONS = [
  'Bahan habis / stok kosong',
  'Terlalu sibuk / kapasitas penuh',
  'Item tidak tersedia hari ini',
  'Masalah teknis dapur',
  'Permintaan dari pelanggan',
  'Lainnya',
];

export const CancelOrderModal: React.FC<CancelOrderModalProps> = ({
  orderId,
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [selectedReason, setSelectedReason] = useState('');
  const [customReason, setCustomReason] = useState('');

  if (!isOpen) return null;

  const finalReason = selectedReason === 'Lainnya' ? customReason.trim() : selectedReason;
  const isValid = finalReason.length > 0;

  const handleConfirm = () => {
    if (!isValid) return;
    onConfirm(orderId, finalReason);
    setSelectedReason('');
    setCustomReason('');
    onClose();
  };

  const handleClose = () => {
    setSelectedReason('');
    setCustomReason('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-rose-50/60">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-rose-100 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Batalkan Pesanan</h3>
              <p className="text-[11px] text-slate-500">Order {orderId}</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <p className="text-xs text-slate-600 font-medium">
            Pilih alasan pembatalan pesanan ini. Alasan akan dicatat untuk evaluasi layanan.
          </p>

          <div className="space-y-2">
            {CANCEL_REASONS.map((reason) => (
              <button
                key={reason}
                onClick={() => setSelectedReason(reason)}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-medium border transition-all flex items-center gap-2 ${
                  selectedReason === reason
                    ? 'bg-rose-50 border-rose-400 text-rose-800 font-semibold'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span
                  className={`w-3.5 h-3.5 rounded-full border-2 flex-shrink-0 transition-colors ${
                    selectedReason === reason
                      ? 'border-rose-500 bg-rose-500'
                      : 'border-slate-300 bg-white'
                  }`}
                />
                {reason}
              </button>
            ))}
          </div>

          {selectedReason === 'Lainnya' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1 flex items-center gap-1">
                <MessageSquare className="w-3.5 h-3.5" /> Alasan Lainnya
              </label>
              <textarea
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="Tuliskan alasan pembatalan secara detail..."
                rows={3}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-rose-400 outline-none resize-none"
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3">
          <button
            onClick={handleClose}
            className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-100 transition-all"
          >
            Kembali
          </button>
          <button
            onClick={handleConfirm}
            disabled={!isValid}
            className="px-5 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl transition-all"
          >
            Konfirmasi Pembatalan
          </button>
        </div>
      </div>
    </div>
  );
};
