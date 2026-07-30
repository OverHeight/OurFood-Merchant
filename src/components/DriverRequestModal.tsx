import React, { useState, useEffect } from 'react';
import { DriverRequest } from '../types';
import { X, Star, Car, MapPin, Clock, CheckCircle, XCircle, Bike } from 'lucide-react';

interface DriverRequestModalProps {
  request: DriverRequest | null;
  onAccept: (requestId: string) => void;
  onReject: (requestId: string) => void;
  onClose: () => void;
}

export const DriverRequestModal: React.FC<DriverRequestModalProps> = ({
  request,
  onAccept,
  onReject,
  onClose,
}) => {
  const [timeLeft, setTimeLeft] = useState(30);

  useEffect(() => {
    if (!request) return;
    const remaining = Math.max(0, Math.floor((request.expires_at - Date.now()) / 1000));
    setTimeLeft(remaining);

    const interval = setInterval(() => {
      const left = Math.max(0, Math.floor((request.expires_at - Date.now()) / 1000));
      setTimeLeft(left);
      if (left <= 0) {
        clearInterval(interval);
        onClose();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [request]);

  if (!request) return null;

  const progressPercent = (timeLeft / 30) * 100;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-sm overflow-hidden">
        {/* Timer Bar */}
        <div className="h-1.5 bg-slate-100 w-full">
          <div
            className={`h-full transition-all duration-1000 ${timeLeft > 10 ? 'bg-[#F1DEC4]0' : 'bg-rose-500'}`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Bike className="w-4 h-4 text-blue-600" />
              Driver Request Masuk!
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Untuk pesanan {request.order_id}</p>
          </div>
          <div className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${timeLeft > 10 ? 'bg-emerald-100 text-[#BD4444]' : 'bg-rose-100 text-rose-700 animate-pulse'}`}>
            <Clock className="w-3 h-3" />
            {timeLeft}s
          </div>
        </div>

        {/* Driver Info */}
        <div className="p-5 space-y-4">
          <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <img
              src={request.avatar_url}
              alt={request.nama_driver}
              className="w-14 h-14 rounded-full object-cover ring-2 ring-blue-300/50"
            />
            <div className="flex-1">
              <p className="text-sm font-bold text-slate-900">{request.nama_driver}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                <span className="text-xs font-semibold text-slate-700">{request.rating_driver}</span>
                <span className="text-xs text-slate-400">/ 5.0</span>
              </div>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-lg flex items-center gap-1">
                  <Car className="w-3 h-3" /> {request.nomor_kendaraan}
                </span>
                <span className="text-[11px] text-slate-500 flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {request.jarak_km} km dari restoran
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => onReject(request.request_id)}
              className="py-3 rounded-xl text-xs font-bold border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 transition-all flex items-center justify-center gap-2"
            >
              <XCircle className="w-4 h-4" />
              Tolak Driver
            </button>
            <button
              onClick={() => onAccept(request.request_id)}
              className="py-3 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Terima Driver
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
