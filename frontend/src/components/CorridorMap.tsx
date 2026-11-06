import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';

// Fix default marker icon issue in Leaflet + Vite
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface AlignmentItem {
  id: number;
  corridor_code: string;
  name: string;
  length_km: number;
  start_point?: string;
  end_point?: string;
  coordinates_geojson?: any;
  investment_cr?: number;
}

interface CorridorMapProps {
  alignments?: AlignmentItem[];
  height?: string;
}

// Major Tamil Nadu Hubs coordinates for alignment polylines
const HUB_COORDS: Record<string, [number, number]> = {
  chennai: [13.0827, 80.2707],
  kanchipuram: [12.8342, 79.7036],
  chengalpattu: [12.6841, 79.9836],
  tiruchirappalli: [10.7905, 78.7047],
  thanjavur: [10.7870, 79.1378],
  madurai: [9.9252, 78.1198],
  tuticorin: [8.7642, 78.1348],
  salem: [11.6643, 78.1460],
  coimbatore: [11.0168, 76.9558],
  tirunelveli: [8.7139, 77.7567],
  vellore: [12.9165, 79.1325],
  cuddalore: [11.7480, 79.7714]
};

// Default corridor paths across TN
const DEFAULT_CORRIDORS: { name: string; code: string; color: string; path: [number, number][] }[] = [
  {
    name: 'Chennai - Kanchipuram - Vellore Industrial Corridor',
    code: 'CK-01',
    color: '#0284c7',
    path: [HUB_COORDS.chennai, HUB_COORDS.kanchipuram, HUB_COORDS.vellore]
  },
  {
    name: 'Chennai - Chengalpattu - Cuddalore Coastal Corridor (ECR)',
    code: 'CK-02',
    color: '#059669',
    path: [HUB_COORDS.chennai, HUB_COORDS.chengalpattu, HUB_COORDS.cuddalore]
  },
  {
    name: 'Salem - Tiruchirappalli - Thanjavur Central Delta Corridor',
    code: 'CK-03',
    color: '#d97706',
    path: [HUB_COORDS.salem, HUB_COORDS.tiruchirappalli, HUB_COORDS.thanjavur]
  },
  {
    name: 'Madurai - Tirunelveli - Tuticorin Port Connectivity Corridor',
    code: 'CK-04',
    color: '#dc2626',
    path: [HUB_COORDS.madurai, HUB_COORDS.tirunelveli, HUB_COORDS.tuticorin]
  },
  {
    name: 'Coimbatore - Salem Agro-Industrial Expressway',
    code: 'CK-05',
    color: '#7c3aed',
    path: [HUB_COORDS.coimbatore, HUB_COORDS.salem]
  }
];

export const CorridorMap: React.FC<CorridorMapProps> = ({ height = '360px' }) => {
  // Center of Tamil Nadu
  const center: [number, number] = [11.1271, 78.6569];

  return (
    <div className="w-full rounded-xl overflow-hidden border border-slate-700 shadow-lg relative z-0" style={{ height }}>
      <MapContainer
        center={center}
        zoom={7}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Major City Markers */}
        {Object.entries(HUB_COORDS).map(([city, coords]) => (
          <Marker key={city} position={coords} icon={defaultIcon}>
            <Popup>
              <div className="text-xs">
                <strong className="capitalize text-slate-900 block">{city} Hub</strong>
                <span className="text-slate-500">Tamil Nadu Highways Jurisdiction</span>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Corridor Polylines */}
        {DEFAULT_CORRIDORS.map((corridor) => (
          <Polyline
            key={corridor.code}
            positions={corridor.path}
            pathOptions={{ color: corridor.color, weight: 4, opacity: 0.85 }}
          >
            <Popup>
              <div className="text-xs">
                <strong className="text-slate-900 block font-semibold">{corridor.code}: {corridor.name}</strong>
                <span className="text-emerald-700 font-medium">Strategic Economic Highway</span>
              </div>
            </Popup>
          </Polyline>
        ))}
      </MapContainer>
    </div>
  );
};
