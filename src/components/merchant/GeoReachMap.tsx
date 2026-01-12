import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Circle, useMap } from "react-leaflet";
import L from "leaflet";
import { MapPin, Loader2 } from "lucide-react";
import "leaflet/dist/leaflet.css";

// Fix default marker icon issue with Leaflet in React
delete (L.Icon.Default.prototype as any)._getIconUrl;

// Custom teal marker icon
const tealIcon = new L.DivIcon({
  className: 'custom-marker',
  html: `
    <div style="
      width: 32px;
      height: 32px;
      background: #1DB09B;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 4px 12px rgba(29, 176, 155, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
        <circle cx="12" cy="10" r="3"/>
      </svg>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

// Component to recenter map when coordinates change
function MapRecenter({ coords }: { coords: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(coords, 13);
  }, [coords, map]);
  return null;
}

interface GeoReachMapProps {
  className?: string;
}

export function GeoReachMap({ className }: GeoReachMapProps) {
  const [coords, setCoords] = useState<[number, number]>([51.5074, -0.1278]); // Default: London
  const [loading, setLoading] = useState(true);
  const [locationName, setLocationName] = useState("London, UK");

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCoords([latitude, longitude]);
          setLocationName("Your Location");
          setLoading(false);
        },
        (error) => {
          console.log("Geolocation permission denied, using default:", error.message);
          setLoading(false);
        },
        { timeout: 5000, enableHighAccuracy: false }
      );
    } else {
      setLoading(false);
    }
  }, []);

  return (
    <div className={`rounded-2xl border border-white/10 overflow-hidden bg-[#1A1A1A] ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-[#1DB09B] flex items-center justify-center">
              <MapPin className="h-4 w-4 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-sm">Geo-Reach</h3>
              <p className="text-xs text-gray-400">Your campaign coverage area</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-[#8b5cf6] animate-pulse" />
            <span className="text-xs text-gray-400">{locationName}</span>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative h-[400px]">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-[#1A1A1A]">
            <Loader2 className="h-8 w-8 text-[#1DB09B] animate-spin" />
          </div>
        ) : (
          <>
            <MapContainer
              center={coords}
              zoom={13}
              style={{ height: "100%", width: "100%" }}
              zoomControl={false}
              attributionControl={false}
            >
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
              />
              <MapRecenter coords={coords} />
              <Circle
                center={coords}
                radius={2000}
                pathOptions={{
                  color: "#8b5cf6",
                  fillColor: "#8b5cf6",
                  fillOpacity: 0.2,
                  weight: 2,
                }}
              />
              <Marker position={coords} icon={tealIcon} />
            </MapContainer>
            
            {/* Map Legend - Outside MapContainer */}
            <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-sm rounded-lg p-3 border border-white/10 z-[1000]">
              <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-[#1DB09B]" />
                  <span className="text-gray-300">Your Business</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-[#8b5cf6]/40 border border-[#8b5cf6]" />
                  <span className="text-gray-300">2km Reach</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
