import React, { useState } from 'react';
import { MapPin, Phone, Clock, ExternalLink, Navigation, Store, Motorbike, Map as MapIcon, User, Package } from 'lucide-react';
import { MerchantProfile, Order } from '../types';

interface MapsViewProps {
  merchantProfile: MerchantProfile;
  activeOrders: Order[];
}

// Encode address for Google Maps URL
const embedUrl = (address: string) =>
  `https://maps.google.com/maps?q=${encodeURIComponent(address)}&output=embed&z=15`;

export const MapsView: React.FC<MapsViewProps> = ({ merchantProfile, activeOrders }) => {
  const deliveryOrders = activeOrders.filter(
    (o) => o.deliveryType === 'Delivery' && (o.status_order === 'DIANTAR' || o.status_order === 'SIAP_DIANTAR' || o.status_order === 'SEDANG_DIMASAK')
  );

  const [selectedOrderId, setSelectedOrderId] = useState<string | number | null>(
    deliveryOrders.length > 0 ? deliveryOrders[0].order_id : null
  );

  const selectedOrder = deliveryOrders.find((o) => o.order_id === selectedOrderId);

  // Mock driver details based on order id to make it consistent
  const getMockDriver = (orderId: string | number) => {
    const idStr = String(orderId);
    const isDiantar = selectedOrder?.status_order === 'DIANTAR';
    return {
      name: isDiantar ? 'Agus Supriyadi' : 'Mencari Driver...',
      plat: isDiantar ? 'B 2345 XYZ' : '-',
      eta: isDiantar ? '12 Min' : '--',
      distance: isDiantar ? '2.4 km' : '--',
    };
  };

  const driverInfo = selectedOrder ? getMockDriver(selectedOrder.order_id) : null;
  // If no order selected or order has no address, fallback to merchant address
  const mapAddress = selectedOrder?.alamat_pengantaran || merchantProfile.alamat;

  return (
    <div className="space-y-6 animate-in fade-in h-full flex flex-col">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-[0px_4px_12px_rgba(0,0,0,0.05)] shrink-0">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <MapIcon className="w-6 h-6 text-[#BD4444]" />
          <span>Live Tracking Pesanan</span>
        </h2>
        <p className="text-xs text-slate-500 font-medium mt-1">
          Pantau posisi driver untuk pesanan delivery yang sedang berlangsung.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-[500px]">
        {/* Left Sidebar: List of Orders */}
        <div className="lg:w-1/3 bg-white rounded-2xl border border-slate-200/80 shadow-[0px_4px_12px_rgba(0,0,0,0.05)] flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Package className="w-4 h-4 text-[#BD4444]" />
              Pesanan Delivery ({deliveryOrders.length})
            </h3>
          </div>
          
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {deliveryOrders.length === 0 ? (
              <div className="text-center py-10">
                <Navigation className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-500">Tidak ada pesanan delivery aktif.</p>
              </div>
            ) : (
              deliveryOrders.map((order) => (
                <button
                  key={order.order_id}
                  onClick={() => setSelectedOrderId(order.order_id)}
                  className={`w-full text-left p-3 rounded-xl border transition-all ${
                    selectedOrderId === order.order_id
                      ? 'bg-[#F1DEC4] border-[#e0ceb5] shadow-sm'
                      : 'bg-white border-slate-200 hover:border-[#e0ceb5] hover:bg-slate-50'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold text-slate-900">{order.order_id}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      order.status_order === 'DIANTAR' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {order.status_order}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-600 mb-1">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-medium truncate">{order.nama}</span>
                  </div>
                  <div className="flex items-start gap-1.5 text-[11px] text-slate-500">
                    <MapPin className="w-3.5 h-3.5 text-rose-400 mt-0.5 shrink-0" />
                    <span className="line-clamp-2">{order.alamat_pengantaran}</span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right Area: Map & Details */}
        <div className="lg:w-2/3 flex flex-col gap-4">
          {/* Map Embed */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0px_4px_12px_rgba(0,0,0,0.05)] overflow-hidden flex-1 relative min-h-[350px]">
            <div className="absolute inset-0 bg-slate-100">
              <iframe
                title="Lokasi Tracking"
                src={embedUrl(mapAddress)}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            
            {/* Overlay Info (Simulated Tracker) */}
            {selectedOrder && (
              <div className="absolute top-4 left-4 right-4 md:right-auto md:w-80 bg-white/95 backdrop-blur shadow-lg border border-slate-200 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-3 border-b border-slate-100 pb-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                    <Motorbike className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">{driverInfo?.name}</p>
                    <p className="text-[10px] font-medium text-slate-500">Plat: {driverInfo?.plat}</p>
                  </div>
                </div>
                
                <div className="flex justify-between items-center text-center">
                  <div>
                    <p className="text-[10px] text-slate-500 font-bold uppercase mb-0.5">Status</p>
                    <p className="text-xs font-bold text-[#BD4444]">{selectedOrder.status_order}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 font-bold uppercase mb-0.5">Jarak</p>
                    <p className="text-xs font-bold text-slate-900">{driverInfo?.distance}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 font-bold uppercase mb-0.5">Estimasi</p>
                    <p className="text-xs font-bold text-slate-900">{driverInfo?.eta}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Fallback Restoran Info if no active delivery */}
          {!selectedOrder && (
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-[0px_4px_12px_rgba(0,0,0,0.05)] flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                <Store className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Lokasi Restoran Anda</h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">{merchantProfile.alamat}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
