import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TrendingUp, DollarSign, Eye, Loader2 } from "lucide-react";
import { api, toAbsoluteUrl } from "@/services/api";
import { useAppStore } from "@/store/useAppStore";

const PARTNER_COLOR = "#1DB09B";

interface Influencer {
  id: number;
  name: string;
  avatar: string;
  traffic: number;
  sales: number;
  revenue: number;
  trend: number;
}

export function TopInfluencersLeaderboard() {
  const { user } = useAppStore();
  const [topInfluencers, setTopInfluencers] = useState<Influencer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const userId = (user as any)?.id || (user as any)?.user_id;
      
      if (userId) {
        try {
          const response = await api.getPartnerDashboard(String(userId));
          if (response.success && response.data?.top_influencers) {
            // Real people placeholder images
            const realAvatars = [
              'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face',
              'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
              'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
              'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face'
            ];
            
            const formattedData = response.data.top_influencers.map((inf: any, index: number) => ({
              ...inf,
              id: inf.id || index,
              avatar: inf.avatar 
                ? (inf.avatar.startsWith('http') ? inf.avatar : toAbsoluteUrl(inf.avatar))
                : realAvatars[index % realAvatars.length],
              traffic: Number(inf.traffic) || 0,
              sales: Number(inf.sales) || 0,
              revenue: Number(inf.revenue) || 0,
              trend: inf.trend ? parseFloat(Number(inf.trend).toFixed(2)) : 0,
            }));
            setTopInfluencers(formattedData);
          }
        } catch (error) {
          console.error('Error fetching top influencers:', error);
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
      transition={{ duration: 0.5, delay: 0.3 }}
      whileHover={{ y: -2 }}
      className="bg-[#0f1929] rounded-2xl border border-[#1e3a5f]/30 p-6 h-full"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-extrabold text-white font-heading">
          Top Influencers
        </h3>
        <span className="text-xs text-gray-400 bg-white/5 px-2 py-1 rounded-full border border-white/10">
          By Revenue
        </span>
      </div>

      <div className="space-y-3">
        {topInfluencers.map((influencer, index) => (
          <motion.div
            key={influencer.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 * index }}
            whileHover={{ scale: 1.02, x: 5 }}
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
          >
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold bg-white/5 text-gray-500">
              {index + 1}
            </div>

            <img
              src={influencer.avatar}
              alt={influencer.name}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-white/10"
            />

            <div className="flex-1 min-w-0">
              <p className="font-semibold text-white truncate">{influencer.name}</p>
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  {(influencer.traffic || 0).toLocaleString()} 
                </span>
                <span className="flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  {influencer.sales} sales
                </span>
              </div>
            </div>

            <div className="text-right">
              <p className="font-bold" style={{ color: PARTNER_COLOR }}>${(influencer.revenue || 0).toLocaleString()}</p>
              <div className="flex items-center gap-0.5 text-xs justify-end text-gray-500">
                <TrendingUp className={`h-3 w-3 ${influencer.trend < 0 ? 'rotate-180' : ''}`} />
                {influencer.trend >= 0 ? '+' : ''}{influencer.trend}%
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}