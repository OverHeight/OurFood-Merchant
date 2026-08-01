import React, { useEffect, useRef } from 'react';
import { MapPin, Navigation, Compass } from 'lucide-react';

interface OsmLocationPickerProps {
  latitude: number;
  longitude: number;
  onChange: (lat: number, lon: number) => void;
  height?: string;
}

declare global {
  interface Window {
    L: any;
  }
}

export const OsmLocationPicker: React.FC<OsmLocationPickerProps> = ({
  latitude,
  longitude,
  onChange,
  height = '280px',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerInstanceRef = useRef<any>(null);

  const currentLat = latitude || -6.8868;
  const currentLon = longitude || 107.6153;

  useEffect(() => {
    let isSubscribed = true;

    const loadLeaflet = async () => {
      // 1. Inject Leaflet CSS if missing
      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link');
        link.id = 'leaflet-css';
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      // 2. Inject Leaflet JS if missing
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

      // 3. Initialize Leaflet Map
      if (window.L && mapContainerRef.current && !mapInstanceRef.current) {
        const L = window.L;
        const map = L.map(mapContainerRef.current, {
          center: [currentLat, currentLon],
          zoom: 15,
          zoomControl: true,
        });
        mapInstanceRef.current = map;

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; OpenStreetMap',
        }).addTo(map);

        // Custom red pinpoint marker icon
        const customIcon = L.divIcon({
          className: 'custom-pinpoint-icon',
          html: `<div style="background-color: #BD4444; width: 34px; height: 34px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.35); margin-top: -17px; margin-left: -17px; cursor: pointer;">
                  <div style="background-color: white; width: 10px; height: 10px; border-radius: 50%; transform: rotate(45deg);"></div>
                 </div>`,
          iconSize: [34, 34],
          iconAnchor: [17, 34],
        });

        const marker = L.marker([currentLat, currentLon], {
          draggable: true,
          icon: customIcon,
        }).addTo(map);
        markerInstanceRef.current = marker;

        // CLICK ANYWHERE ON MAP TO MOVE PINPOINT
        map.on('click', (e: any) => {
          const { lat, lng } = e.latlng;
          const newLat = parseFloat(lat.toFixed(6));
          const newLon = parseFloat(lng.toFixed(6));
          marker.setLatLng([newLat, newLon]);
          onChange(newLat, newLon);
        });

        // DRAG PINPOINT MARKER TO SET LOCATION
        marker.on('dragend', () => {
          const position = marker.getLatLng();
          const newLat = parseFloat(position.lat.toFixed(6));
          const newLon = parseFloat(position.lng.toFixed(6));
          onChange(newLat, newLon);
        });
      }
    };

    loadLeaflet();

    return () => {
      isSubscribed = false;
    };
  }, []);

  // Sync map & marker when coordinates update externally
  useEffect(() => {
    if (mapInstanceRef.current && markerInstanceRef.current) {
      markerInstanceRef.current.setLatLng([currentLat, currentLon]);
      mapInstanceRef.current.panTo([currentLat, currentLon]);
    }
  }, [currentLat, currentLon]);

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLat = parseFloat(position.coords.latitude.toFixed(6));
          const newLon = parseFloat(position.coords.longitude.toFixed(6));
          onChange(newLat, newLon);
          if (mapInstanceRef.current && markerInstanceRef.current) {
            markerInstanceRef.current.setLatLng([newLat, newLon]);
            mapInstanceRef.current.setView([newLat, newLon], 16);
          }
        },
        (error) => {
          console.warn('Geolocation error:', error);
          alert('Gagal mendapatkan lokasi GPS. Pastikan izin lokasi diaktifkan pada peramban Anda.');
        }
      );
    } else {
      alert('Browser Anda tidak mendukung Geolocation.');
    }
  };

  const PRESETS = [
    { label: 'Unikom Bandung', lat: -6.8868, lon: 107.6153 },
    { label: 'Alun-alun Bandung', lat: -6.9218, lon: 107.6071 },
    { label: 'Monas Jakarta', lat: -6.1754, lon: 106.8272 },
  ];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-slate-700 uppercase flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5 text-rose-500" />
          Pinpoint Lokasi Outlet (Klik / Geser Pin di Peta)
        </label>
        <button
          type="button"
          onClick={handleGetCurrentLocation}
          className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
        >
          <Navigation className="w-3 h-3 text-indigo-500" />
          <span>Lokasi Saya (GPS)</span>
        </button>
      </div>

      {/* Interactive Leaflet OpenStreetMap Container */}
      <div
        className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-inner bg-slate-100 z-0"
        style={{ height }}
      >
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* Floating coordinate badge */}
        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-lg text-[10px] font-bold text-slate-700 shadow-sm border border-slate-200/80 flex items-center gap-1 z-[400] pointer-events-none">
          <Compass className="w-3 h-3 text-emerald-600 animate-spin" style={{ animationDuration: '6s' }} />
          <span>{currentLat.toFixed(5)}, {currentLon.toFixed(5)}</span>
        </div>
      </div>

      <p className="text-[10px] text-slate-400 font-medium">
        💡 <span className="font-bold text-slate-600">Petunjuk:</span> Klik di mana saja pada peta atau geser jarum merah untuk menentukan lokasi persis outlet Anda.
      </p>

      {/* Presets & Manual Numeric Adjustment */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] font-bold text-slate-400">Preset:</span>
          {PRESETS.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => onChange(p.lat, p.lon)}
              className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-md transition-colors cursor-pointer"
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <span className="text-[10px] font-bold text-slate-400">Lat:</span>
            <input
              type="number"
              step="0.000001"
              value={currentLat}
              onChange={(e) => onChange(parseFloat(e.target.value) || 0, currentLon)}
              className="w-24 px-1.5 py-0.5 text-[11px] font-mono rounded border border-slate-200 focus:border-[#BD4444] outline-none"
            />
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[10px] font-bold text-slate-400">Lon:</span>
            <input
              type="number"
              step="0.000001"
              value={currentLon}
              onChange={(e) => onChange(currentLat, parseFloat(e.target.value) || 0)}
              className="w-24 px-1.5 py-0.5 text-[11px] font-mono rounded border border-slate-200 focus:border-[#BD4444] outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
