import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Loader2 } from "lucide-react";
import { api } from "@/services/api";
import { useAppStore } from "@/store/useAppStore";

// Analytics color coding per memory
const TEAL = "#1DB09B";      // Direct Scans / Revenue
const CYAN = "#18C5DC";      // App Discovery

export function CombinedAnalyticsChart() {
  const { user } = useAppStore();
  const [data, setData] = useState<Array<{ name: string; revenue: number; scans: number }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const userId = (user as any)?.id || (user as any)?.user_id;
      
      if (userId) {
        try {
          const response = await api.getPartnerDashboard(String(userId));
          console.log('Partner Dashboard API response:', response);
          if (response.success && response.data?.chart_data) {
            // Map API fields (date, rev, scans) to chart fields (name, revenue, scans)
            const formattedData = response.data.chart_data.map((item: any) => ({
              name: item.date || item.name,
              revenue: Number(item.rev || item.revenue || 0),
              scans: Number(item.scans || 0)
            }));
            setData(formattedData);
          }
        } catch (error) {
          console.error('Error fetching partner dashboard:', error);
        }
      }
      setLoading(false);
    };

    fetchData();
  }, [user]);

  if (loading) {
    return (
      <div className="bg-[#0f1929] rounded-2xl p-6 border border-[#1e3a5f]/30 h-[360px] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-[#0f1929] rounded-2xl p-6 border border-[#1e3a5f]/30"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-extrabold text-white" style={{ fontFamily: "Nunito, sans-serif" }}>
            Revenue & Scans Correlation
          </h3>
          <p className="text-sm text-gray-400 font-semibold">Track performance over time</p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ background: TEAL }} />
            <span className="text-gray-300 font-medium">Revenue</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ background: CYAN }} />
            <span className="text-gray-300 font-medium">Scans</span>
          </div>
        </div>
      </div>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={TEAL} stopOpacity={0.3} />
                <stop offset="95%" stopColor={TEAL} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorScans" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={CYAN} stopOpacity={0.3} />
                <stop offset="95%" stopColor={CYAN} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#9ca3af", fontSize: 12, fontWeight: 500 }}
            />
            <YAxis
              yAxisId="left"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#9ca3af", fontSize: 12, fontWeight: 500 }}
              tickFormatter={(value) => `$${value}`}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#9ca3af", fontSize: 12, fontWeight: 500 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#0a0a0a",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "12px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
              }}
              labelStyle={{ color: "#fff", fontWeight: 600 }}
              itemStyle={{ color: "#9ca3af" }}
            />
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="revenue"
              stroke={TEAL}
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorRevenue)"
              name="Revenue"
            />
            <Area
              yAxisId="right"
              type="monotone"
              dataKey="scans"
              stroke={CYAN}
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorScans)"
              name="Scans"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
