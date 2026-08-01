import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, Store, Map as MapIcon, User, Package, Phone, Bike, ExternalLink } from 'lucide-react';
import { MerchantProfile, Order } from '../types';
import { supabase } from '../lib/supabase';

interface MapsViewProps {
  merchantProfile: MerchantProfile;
  activeOrders: Order[];
}

declare global {
  interface Window {
    L: any;
  }
}

// Haversine formula for calculating distance in km
function calculateDistanceKm(
  lat1: number | null | undefined,
  lon1: number | null | undefined,
  lat2: number | null | undefined,
  lon2: number | null | undefined
): number | null {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return null;
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export const MapsView: React.FC<MapsViewProps> = ({ merchantProfile, activeOrders }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const merchantMarkerRef = useRef<any>(null);
  const userMarkerRef = useRef<any>(null);
  const driverMarkerRef = useRef<any>(null);

  const deliveryOrders = activeOrders.filter(
    (o) =>
      o.status_order === 'ON_THE_WAY' ||
      o.status_order === 'READY_FOR_PICKUP' ||
      o.status_order === 'PREPARING'
  );

  const [selectedOrderId, setSelectedOrderId] = useState<string | number | null>(
    deliveryOrders.length > 0 ? deliveryOrders[0].order_id : null
  );

  const selectedOrder = deliveryOrders.find((o) => o.order_id === selectedOrderId);
  const [driverPos, setDriverPos] = useState<{ lat: number | null; lon: number | null }>({
    lat: selectedOrder?.driver?.latitude || null,
    lon: selectedOrder?.driver?.longitude || null,
  });

  // Coordinates resolution
  const merchantLat = merchantProfile.latitude || -6.8868;
  const merchantLon = merchantProfile.longitude || 107.6153;

  const userLat = selectedOrder?.user_address?.latitude || (merchantLat + 0.015);
  const userLon = selectedOrder?.user_address?.longitude || (merchantLon + 0.012);

  const currentDriverLat = driverPos.lat || (merchantLat + 0.007);
  const currentDriverLon = driverPos.lon || (merchantLon + 0.006);

  // Realtime subscription on driver position updates
  useEffect(() => {
    if (selectedOrder?.driver?.driver_id) {
      setDriverPos({
        lat: selectedOrder.driver.latitude || null,
        lon: selectedOrder.driver.longitude || null,
      });

      const channel = supabase
        .channel(`driver-tracking-${selectedOrder.driver.driver_id}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'driver',
            filter: `driver_id=eq.${selectedOrder.driver.driver_id}`,
          },
          (payload) => {
            const updatedDriver = payload.new as any;
            if (updatedDriver.latitude && updatedDriver.longitude) {
              setDriverPos({
                lat: updatedDriver.latitude,
                lon: updatedDriver.longitude,
              });
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [selectedOrder?.driver?.driver_id]);

  // Initialize & update Leaflet OpenStreetMap Canvas with 3 Markers
  useEffect(() => {
    let isSubscribed = true;

    const loadLeafletMap = async () => {
      // 1. Inject Leaflet CSS
      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link');
        link.id = 'leaflet-css';
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      // 2. Inject Leaflet JS
      if (!window.L) {
        await new Promise((resolve) => {
          const script = document.createElement('script');
          script.id = 'leaflet-js';
          script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
          script.onload = resolve;
          document.head.appendChild(script);
        });
      }

      if (!isSubscribed) return;

      if (window.L && mapContainerRef.current) {
        const L = window.L;

        if (!mapInstanceRef.current) {
          const map = L.map(mapContainerRef.current, {
            center: [merchantLat, merchantLon],
            zoom: 14,
          });
          mapInstanceRef.current = map;

          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; OpenStreetMap',
          }).addTo(map);

          // 1. Merchant Marker Icon (Red Store)
          const merchantIcon = L.divIcon({
            className: 'merchant-pin',
            html: `<div style="background-color: #BD4444; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.3); color: white; font-size: 16px;">🏪</div>`,
            iconSize: [34, 34],
            iconAnchor: [17, 17],
          });
          merchantMarkerRef.current = L.marker([merchantLat, merchantLon], { icon: merchantIcon })
            .addTo(map)
            .bindPopup(`<b>Restoran:</b> ${merchantProfile.nama_merchant}`);

          // 2. User Address Marker Icon (Green House)
          const userIcon = L.divIcon({
            className: 'user-pin',
            html: `<div style="background-color: #10B981; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.3); color: white; font-size: 16px;">🏠</div>`,
            iconSize: [34, 34],
            iconAnchor: [17, 17],
          });
          userMarkerRef.current = L.marker([userLat, userLon], { icon: userIcon })
            .addTo(map)
            .bindPopup(`<b>Pemesan:</b> ${selectedOrder?.nama || 'Pelanggan'}<br/>${selectedOrder?.alamat_pengantaran || ''}`);

          // 3. Driver Live Marker Icon (Blue Bike)
          const driverIcon = L.divIcon({
            className: 'driver-pin',
            html: `<div style="background-color: #3B82F6; width: 38px; height: 38px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 4px 12px rgba(59,130,246,0.5); color: white; font-size: 18px; animation: pulse 2s infinite;">🛵</div>`,
            iconSize: [38, 38],
            iconAnchor: [19, 19],
          });
          driverMarkerRef.current = L.marker([currentDriverLat, currentDriverLon], { icon: driverIcon })
            .addTo(map)
            .bindPopup(`<b>Driver:</b> ${selectedOrder?.driver?.nama || 'Driver'}`);
        } else {
          // Update existing markers
          if (merchantMarkerRef.current) {
            merchantMarkerRef.current.setLatLng([merchantLat, merchantLon]);
          }
          if (userMarkerRef.current) {
            userMarkerRef.current.setLatLng([userLat, userLon]);
            userMarkerRef.current.getPopup().setContent(`<b>Pemesan:</b> ${selectedOrder?.nama || 'Pelanggan'}<br/>${selectedOrder?.alamat_pengantaran || ''}`);
          }
          if (driverMarkerRef.current) {
            driverMarkerRef.current.setLatLng([currentDriverLat, currentDriverLon]);
            driverMarkerRef.current.getPopup().setContent(`<b>Driver:</b> ${selectedOrder?.driver?.nama || 'Driver'}`);
          }

          // Fit bounds to show all 3 markers
          const bounds = L.latLngBounds([
            [merchantLat, merchantLon],
            [userLat, userLon],
            [currentDriverLat, currentDriverLon],
          ]);
          mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40] });
        }
      }
    };

    loadLeafletMap();

    return () => {
      isSubscribed = false;
    };
  }, [merchantLat, merchantLon, userLat, userLon, currentDriverLat, currentDriverLon, selectedOrderId]);

  // Calculate distance & ETA using coordinates
  const distKm = calculateDistanceKm(currentDriverLat, currentDriverLon, userLat, userLon);
  const etaMinutes = distKm ? Math.max(1, Math.round((distKm / 30) * 60)) : null;

  return (
    <div className="space-y-6 animate-in fade-in h-full flex flex-col">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-[0px_4px_12px_rgba(0,0,0,0.05)] shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <MapIcon className="w-6 h-6 text-[#BD4444]" />
            <span>Live Tracking Pesanan (OpenStreetMap 3 Pinpoints)</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Pantau 3 titik lokasi sekaligus: Restoran, Driver (Live), dan Alamat Pemesan secara realtime.
          </p>
        </div>
        <a
          href={`https://www.openstreetmap.org/?mlat=${currentDriverLat}&mlon=${currentDriverLon}#map=16/${currentDriverLat}/${currentDriverLon}`}
          target="_blank"
          rel="noreferrer"
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0"
        >
          <ExternalLink className="w-4 h-4 text-emerald-600" />
          <span>Buka di OpenStreetMap</span>
        </a>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-[500px]">
        {/* Left Sidebar: List of Orders */}
        <div className="lg:w-1/3 bg-white rounded-2xl border border-slate-200/80 shadow-[0px_4px_12px_rgba(0,0,0,0.05)] flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Package className="w-4 h-4 text-[#BD4444]" />
              Pesanan Aktif ({deliveryOrders.length})
            </h3>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {deliveryOrders.length === 0 ? (
              <div className="text-center py-10">
                <Navigation className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-500">Tidak ada pesanan aktif saat ini.</p>
              </div>
            ) : (
              deliveryOrders.map((order) => (
                <button
                  key={order.order_id}
                  onClick={() => setSelectedOrderId(order.order_id)}
                  className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer ${
                    selectedOrderId === order.order_id
                      ? 'bg-[#F1DEC4] border-[#e0ceb5] shadow-sm'
                      : 'bg-white border-slate-200 hover:border-[#e0ceb5] hover:bg-slate-50'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold text-slate-900">{order.nama}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        order.status_order === 'ON_THE_WAY'
                          ? 'bg-indigo-100 text-indigo-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {order.status_order}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-600 mb-1">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-medium truncate">{order.nama}</span>
                  </div>
                  <div className="flex items-start gap-1.5 text-[11px] text-slate-500">
                    <MapPin className="w-3.5 h-3.5 text-rose-400 mt-0.5 shrink-0" />
                    <span className="line-clamp-2">{order.alamat_pengantaran || 'Di Resto'}</span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right Area: Interactive OpenStreetMap Canvas with 3 Pinpoints */}
        <div className="lg:w-2/3 flex flex-col gap-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0px_4px_12px_rgba(0,0,0,0.05)] overflow-hidden flex-1 relative min-h-[420px]">
            <div ref={mapContainerRef} className="absolute inset-0 bg-slate-100 z-0" />

            {/* Top-Right Legend Box (3 Pinpoints) */}
            <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-xs shadow-lg border border-slate-200 rounded-2xl p-3.5 z-[400] space-y-2 text-xs">
              <p className="font-extrabold text-slate-800 text-[11px] uppercase tracking-wider border-b border-slate-100 pb-1">
                Legenda Peta (3 Pinpoint)
              </p>

              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#BD4444] text-white flex items-center justify-center text-xs shrink-0 shadow-xs">
                  🏪
                </span>
                <div>
                  <p className="font-bold text-slate-900 leading-tight">Restoran (Merchant)</p>
                  <p className="text-[10px] text-slate-500 truncate max-w-[140px]">{merchantProfile.nama_merchant}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs shrink-0 shadow-xs animate-bounce" style={{ animationDuration: '2s' }}>
                  🛵
                </span>
                <div>
                  <p className="font-bold text-blue-700 leading-tight">Driver (Live Position)</p>
                  <p className="text-[10px] text-slate-500">{selectedOrder?.driver?.nama || 'Driver Active'}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs shrink-0 shadow-xs">
                  🏠
                </span>
                <div>
                  <p className="font-bold text-emerald-800 leading-tight">Alamat Pemesan (User)</p>
                  <p className="text-[10px] text-slate-500 truncate max-w-[140px]">{selectedOrder?.nama || 'Pemesan'}</p>
                </div>
              </div>
            </div>

            {/* Overlay Driver Tracking Details Card */}
            {selectedOrder && (
              <div className="absolute top-4 left-4 right-4 md:right-auto md:w-80 bg-white/95 backdrop-blur-xs shadow-xl border border-slate-200 rounded-2xl p-4 z-[400]">
                <div className="flex items-center gap-3 mb-3 border-b border-slate-100 pb-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                    <Bike className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {selectedOrder.driver?.nama || 'Menunggu Driver'}
                    </p>
                    <p className="text-[10px] font-medium text-slate-500">
                      Plat: {selectedOrder.driver?.plat_nomor || '-'}
                    </p>
                    {selectedOrder.driver?.no_hp && (
                      <p className="text-[10px] text-slate-600 flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3 text-emerald-600" /> {selectedOrder.driver.no_hp}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center text-center">
                  <div>
                    <p className="text-[10px] text-slate-500 font-bold uppercase mb-0.5">Status</p>
                    <p className="text-xs font-bold text-[#BD4444]">{selectedOrder.status_order}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 font-bold uppercase mb-0.5">Jarak Driver</p>
                    <p className="text-xs font-bold text-slate-900">
                      {distKm ? `${distKm.toFixed(1)} km` : '--'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 font-bold uppercase mb-0.5">Estimasi</p>
                    <p className="text-xs font-bold text-slate-900">
                      {etaMinutes ? `${etaMinutes} Menit` : '--'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
