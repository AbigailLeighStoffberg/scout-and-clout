import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Shirt, TrendingUp, Users, ShoppingBag, Loader2 } from "lucide-react";
import { api } from "@/services/api";
import { useAppStore } from "@/store/useAppStore";

const PARTNER_COLOR = "#1DB09B";

export function InfluencerMerchAnalytics() {
  const { user } = useAppStore();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const userId = (user as any)?.id || (user as any)?.user_id;
      if (userId) {
        try {
          const response = await api.getPartnerDashboard(String(userId));
          if (response.success && response.data?.top_influencers) {
            const formatted = response.data.top_influencers.map((inf: any) => ({
              id: inf.id,
              influencer: inf.name,
              avatar: inf.avatar,
              // SAFETY FIX: Default to 0 if missing
              scans: Number(inf.scans) || Number(inf.traffic) || 0,
              sales: Number(inf.sales) || 0,
              revenue: Number(inf.revenue) || 0
            }));
            setData(formatted);
          }
        } catch (error) { console.error(error); }
      }
      setLoading(false);
    };
    fetchData();
  }, [user]);

  // SAFETY FIX: Ensure no NaN results
  const totalMerchScans = data.reduce((sum, item) => sum + (item.scans || 0), 0);
  const totalMerchSales = data.reduce((sum, item) => sum + (item.sales || 0), 0);
  const totalMerchRevenue = data.reduce((sum, item) => sum + (item.revenue || 0), 0);

  if (loading) return <div className="flex h-full items-center justify-center p-6"><Loader2 className="animate-spin text-gray-500" /></div>;

  return (
    <div className="bg-[#0f1929] rounded-2xl border border-[#1e3a5f]/30 p-6 h-full">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: PARTNER_COLOR }}>
          <Shirt className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="font-heading font-semibold text-white">Influencer Merch Analytics</h3>
          <p className="text-xs text-gray-400">Sales from influencer merchandise</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="rounded-xl bg-[#0a1220] border border-[#1e3a5f]/30 p-4 text-center">
          <div className="flex justify-center mb-1"><Users className="h-4 w-4" style={{ color: PARTNER_COLOR }} /></div>
          <p className="text-2xl font-bold text-white">{totalMerchScans}</p>
          <p className="text-xs text-gray-500">QR Scans</p>
        </div>
        <div className="rounded-xl bg-[#0a1220] border border-[#1e3a5f]/30 p-4 text-center">
          <div className="flex justify-center mb-1"><ShoppingBag className="h-4 w-4" style={{ color: PARTNER_COLOR }} /></div>
          <p className="text-2xl font-bold text-white">{totalMerchSales}</p>
          <p className="text-xs text-gray-500">Sales</p>
        </div>
        <div className="rounded-xl bg-[#0a1220] border border-[#1e3a5f]/30 p-4 text-center">
          <div className="flex justify-center mb-1"><TrendingUp className="h-4 w-4" style={{ color: PARTNER_COLOR }} /></div>
          <p className="text-2xl font-bold text-white">${totalMerchRevenue}</p>
          <p className="text-xs text-gray-500">Revenue</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-[#1e3a5f]/30">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#0a1220]">
              <th className="text-left px-3 py-2 text-xs font-medium text-gray-400">Influencer</th>
              <th className="text-right px-3 py-2 text-xs font-medium text-gray-400">Scans</th>
              <th className="text-right px-3 py-2 text-xs font-medium text-gray-400">Sales</th>
              <th className="text-right px-3 py-2 text-xs font-medium text-gray-400">Revenue</th>
            </tr>
          </thead>
          <tbody>
            {data.map((stat, index) => (
              <motion.tr key={stat.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: index * 0.1 }} className="border-t border-[#1e3a5f]/30 hover:bg-[#0a1220]">
                <td className="px-3 py-2.5 flex items-center gap-2">
                  <img src={stat.avatar} alt={stat.influencer} className="h-7 w-7 rounded-full object-cover" />
                  <span className="font-medium text-white">{stat.influencer}</span>
                </td>
                <td className="px-3 py-2.5 text-right text-gray-400">{stat.scans}</td>
                <td className="px-3 py-2.5 text-right text-gray-400">{stat.sales}</td>
                <td className="px-3 py-2.5 text-right"><span style={{ color: PARTNER_COLOR }}>${stat.revenue}</span></td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}