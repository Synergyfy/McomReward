'use client';

import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import Link from 'next/link';

interface MapDeal {
  id: string;
  title: string;
  latitude?: number | null;
  longitude?: number | null;
  business?: { name?: string } | null;
}

const DEFAULT_CENTER: [number, number] = [51.505, -0.09];

const markerIcon = (emoji = '🎯') =>
  L.divIcon({
    className: '',
    html: `<div style="width:34px;height:34px;background:#f97316;border:2px solid #fff;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,.3);font-size:16px">${emoji}</div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 34],
    popupAnchor: [0, -34],
  });

export default function LocalDiscoveryMap({ deals }: { deals: MapDeal[] }) {
  const located = deals.filter((d) => d.latitude != null && d.longitude != null);

  const center: [number, number] =
    located.length > 0
      ? [located[0].latitude as number, located[0].longitude as number]
      : DEFAULT_CENTER;

  return (
    <div className="h-full w-full">
      <MapContainer
        center={center}
        zoom={located.length > 0 ? 13 : 11}
        className="h-full w-full"
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {located.map((deal) => (
          <Marker
            key={deal.id}
            position={[deal.latitude as number, deal.longitude as number]}
            icon={markerIcon('🍽️')}
          >
            <Popup>
              <Link
                href={`/deals/${deal.id}`}
                className="text-sm font-semibold text-orange-600 hover:underline"
              >
                {deal.title}
              </Link>
              {deal.business?.name && (
                <p className="text-xs text-gray-500">{deal.business.name}</p>
              )}
            </Popup>
          </Marker>
        ))}
        {located.length === 0 && (
          <Popup position={center}>
            <p className="text-sm text-gray-600">No mapped deals nearby yet.</p>
          </Popup>
        )}
      </MapContainer>
    </div>
  );
}