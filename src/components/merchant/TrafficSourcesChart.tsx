import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Users, QrCode, Smartphone, Loader2, Globe, ShoppingBag } from "lucide-react";
import { api } from "@/services/api";
import { useAppStore } from "@/store/useAppStore";

// 1. YOUR CUSTOM COLORS (Restored)
const TEAL = "#1DB09B";   // Direct QR Scans
const CYAN = "#18C5DC";   // App Discovery
const PURPLE = "#A759D8"; // Influencer Merch

// 2. Map API Keys -> Display Names
const nameMap: Record<string, string> = {
  app: "App Discovery",
  qr_direct: "Direct QR Scans",
  merch: "Influencer Merch",
  web: "Web Traffic"
};

// 3. Map API Keys -> YOUR Colors (Enforced)
const colorMap: Record<string, string> = {
  app: CYAN,
  qr_direct: TEAL,
  merch: PURPLE,
  web: "#64748b" // Fallback for web
};

// 4. Map API Keys -> Icons
const icons: Record<string, React.ReactNode> = {
  app: <Smartphone className="h-4 w-4" />,
  qr_direct: <QrCode className="h-4 w-4" />,
  merch: <ShoppingBag className="h-4 w-4" />,
  web: <Globe className="h-4 w-4" />
};

export function TrafficSourcesChart() {
  const { user } = useAppStore();
  const [trafficData, setTrafficData] = useState<Array<{ name: string; key: string; value: number; percentage: number; color: string }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const userId = (user as any)?.id || (user as any)?.user_id;
      
      if (userId) {
        try {
          const response = await api.getPartnerDashboard(String(userId));
          if (response.success && response.data?.traffic_sources) {
            // Calculate total for percentage calculation
            const sources = response.data.traffic_sources;
            const total = sources.reduce((sum: number, item: any) => sum + Number(item.value || 0), 0);
            
            // Format data - use backend percentage if available, otherwise calculate
            const formattedData = sources.map((item: any) => ({
              key: item.name, 
              name: nameMap[item.name] || item.name,
              value: item.value,
              // Use backend percentage if valid, otherwise calculate
              percentage: item.percentage && item.percentage <= 100 
                ? Number(item.percentage) 
                : (total > 0 ? Math.round((Number(item.value) / total) * 100) : 0),
              color: colorMap[item.name] || TEAL
            }));
            
            setTrafficData(formattedData);
          }
        } catch (error) {
          console.error('Error fetching traffic sources:', error);
        }
      }
      setLoading(false);
    };

    fetchData();
  }, [user]);

  if (loading) {
    return (
      <div className="bg-[#0f1929] rounded-2xl border border-[#1e3a5f]/30 p-6 h-full flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      whileHover={{ y: -2 }}
      className="bg-[#0f1929] rounded-2xl border border-[#1e3a5f]/30 p-6 h-full"
    >
      <h3 className="text-lg font-extrabold text-white mb-4 font-heading">
        Traffic Sources
      </h3>

      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={trafficData}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {trafficData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-[#0a0a0a] border border-white/10 text-white px-3 py-2 rounded-lg text-sm">
                      <p className="font-semibold">{data.name}</p>
                      <p className="text-gray-400">{data.value}% of traffic</p>
                    </div>
                  );
                }
                return null;
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-2 mt-4">
        {trafficData.map((item) => (
          <div key={item.name} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: item.color }} 
              />
              <span className="text-sm text-gray-400 flex items-center gap-1.5" style={{ color: item.color }}>
                {icons[item.key] || <Users className="h-4 w-4"/>} 
                {item.name}
              </span>
            </div>
            <span className="text-sm font-semibold text-white">{item.percentage}%</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}