import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Navigation, Loader2 } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { api, type DropData } from '@/services/api';

// Demo fallback data for Omonia, Athens
const demoDrops: DropData[] = [
  {
    id: 'demo-1',
    merchant_id: 'demo-merchant-1',
    title: 'Omonia Café Special',
    description: 'Authentic Greek coffee and pastries in the heart of Athens',
    category: 'eat',
    status: 'live',
    original_price: 15,
    drop_price: 8,
    discount: 47,
    remaining_stock: 25,
    total_stock: 50,
    lat: 37.9838,
    lng: 23.7275,
    address: 'Omonia Square',
    city: 'Athens',
    image_url: undefined,
    start_date: new Date().toISOString(),
    end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'demo-2',
    merchant_id: 'demo-merchant-2',
    title: 'Monastiraki Market Deal',
    description: 'Exclusive discounts at the famous flea market',
    category: 'shop',
    status: 'live',
    original_price: 50,
    drop_price: 30,
    discount: 40,
    remaining_stock: 15,
    total_stock: 30,
    lat: 37.9762,
    lng: 23.7256,
    address: 'Monastiraki Square',
    city: 'Athens',
    image_url: undefined,
    start_date: new Date().toISOString(),
    end_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'demo-3',
    merchant_id: 'demo-merchant-3',
    title: 'Plaka Walking Tour',
    description: 'Guided tour through the historic Plaka neighborhood',
    category: 'play',
    status: 'live',
    original_price: 35,
    drop_price: 20,
    discount: 43,
    remaining_stock: 10,
    total_stock: 20,
    lat: 37.9722,
    lng: 23.7310,
    address: 'Plaka District',
    city: 'Athens',
    image_url: undefined,
    start_date: new Date().toISOString(),
    end_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const categoryColors: Record<string, string> = {
  eat: '#18C5DC',
  shop: '#A759D8',
  play: '#DB529F',
  stay: '#1DB09B',
};

interface MapViewProps {
  className?: string;
}

export function MapView({ className }: MapViewProps) {
  const [drops, setDrops] = useState<DropData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDrop, setSelectedDrop] = useState<DropData | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchDrops() {
      setLoading(true);
      try {
        const response = await api.getDrops();
        if (response.success && response.data && response.data.length > 0) {
          setDrops(response.data);
        } else {
          // Fallback to demo data if API returns empty or fails
          console.log('Using demo data - API returned empty or failed');
          setDrops(demoDrops);
        }
      } catch (error) {
        console.error('Failed to fetch drops:', error);
        setDrops(demoDrops);
      } finally {
        setLoading(false);
      }
    }

    fetchDrops();
  }, []);

  // Calculate map center from drops
  const center = drops.length > 0
    ? {
        lat: drops.reduce((sum, d) => sum + d.lat, 0) / drops.length,
        lng: drops.reduce((sum, d) => sum + d.lng, 0) / drops.length,
      }
    : { lat: 37.9838, lng: 23.7275 }; // Default to Omonia

  return (
    <GlassCard className={className}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-heading font-semibold flex items-center gap-2">
          <Navigation className="h-5 w-5 text-[#18C5DC]" />
          Active Drops Map
        </h3>
        <span className="text-xs text-muted-foreground">
          {drops.length} drops nearby
        </span>
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center bg-slate-800/50 rounded-xl">
          <Loader2 className="h-8 w-8 animate-spin text-[#18C5DC]" />
        </div>
      ) : (
        <div className="relative">
          {/* Placeholder Map Visualization */}
          <div
            ref={mapRef}
            className="h-64 bg-slate-800/50 rounded-xl relative overflow-hidden border border-slate-700/50"
            style={{
              background: `
                radial-gradient(circle at 30% 40%, rgba(24, 197, 220, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 70% 60%, rgba(167, 89, 216, 0.1) 0%, transparent 50%),
                linear-gradient(180deg, rgba(15, 23, 42, 0.8) 0%, rgba(15, 23, 42, 0.95) 100%)
              `,
            }}
          >
            {/* Grid overlay for map effect */}
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)
                `,
                backgroundSize: '20px 20px',
              }}
            />

            {/* Drop Markers */}
            {drops.map((drop, index) => {
              // Calculate relative position on the map
              const xPercent = 20 + (index * 25) % 60;
              const yPercent = 20 + (index * 30) % 60;

              return (
                <motion.div
                  key={drop.id}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="absolute cursor-pointer"
                  style={{
                    left: `${xPercent}%`,
                    top: `${yPercent}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                  onClick={() => setSelectedDrop(drop)}
                >
                  <motion.div
                    whileHover={{ scale: 1.2 }}
                    className="relative"
                  >
                    {/* Pulse effect */}
                    <div
                      className="absolute inset-0 rounded-full animate-ping opacity-30"
                      style={{
                        backgroundColor: categoryColors[drop.category],
                        width: 40,
                        height: 40,
                        marginLeft: -8,
                        marginTop: -8,
                      }}
                    />
                    {/* Marker */}
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center shadow-lg"
                      style={{
                        backgroundColor: categoryColors[drop.category],
                        boxShadow: `0 0 20px ${categoryColors[drop.category]}50`,
                      }}
                    >
                      <MapPin className="h-3 w-3 text-white" />
                    </div>
                  </motion.div>
                </motion.div>
              );
            })}

            {/* Center marker */}
            <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="w-3 h-3 rounded-full bg-white/20 border border-white/40" />
            </div>
          </div>

          {/* Selected Drop Info */}
          {selectedDrop && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-3 rounded-xl bg-slate-800/50 border border-slate-700/50"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span
                    className="text-xs font-medium uppercase tracking-wider"
                    style={{ color: categoryColors[selectedDrop.category] }}
                  >
                    {selectedDrop.category}
                  </span>
                  <h4 className="font-semibold text-white">{selectedDrop.title}</h4>
                  <p className="text-sm text-muted-foreground">{selectedDrop.address}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-[#18C5DC]">
                    -{selectedDrop.discount}%
                  </p>
                  <p className="text-xs text-muted-foreground">
                    €{selectedDrop.drop_price}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* Category Legend */}
      <div className="flex flex-wrap gap-3 mt-4">
        {Object.entries(categoryColors).map(([category, color]) => (
          <div key={category} className="flex items-center gap-1.5">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: color }}
            />
            <span className="text-xs text-muted-foreground capitalize">
              {category}
            </span>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
