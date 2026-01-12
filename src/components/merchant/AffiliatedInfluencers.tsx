import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Instagram, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/services/api";
import { useAppStore } from "@/store/useAppStore";

export function AffiliatedInfluencers() {
  const { user } = useAppStore();
  const [influencers, setInfluencers] = useState<any[]>([]);
  const [selectedInfluencer, setSelectedInfluencer] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const userId = (user as any)?.id || (user as any)?.user_id;
      if (userId) {
        try {
          const response = await api.getPartnerDashboard(String(userId));
          if (response.success && response.data?.top_influencers) {
            setInfluencers(response.data.top_influencers);
            setSelectedInfluencer(response.data.top_influencers[0]);
          }
        } catch (e) { console.error(e); }
      }
      setLoading(false);
    };
    fetchData();
  }, [user]);

  if (loading) return <div className="p-6 bg-white rounded-3xl"><Loader2 className="animate-spin text-gray-400" /></div>;
  if (!selectedInfluencer) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 relative overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-extrabold text-slate-800" style={{ fontFamily: "Nunito, sans-serif" }}>Affiliated Influencers</h3>
          <p className="text-sm text-slate-500 font-semibold">Promoting your location</p>
        </div>
        <span className="text-sm font-bold" style={{ color: '#1DB09B' }}>{influencers.length} active</span>
      </div>

      <div className="flex items-center gap-2 mb-6">
        <div className="flex gap-3 overflow-x-auto pb-2 flex-1 scrollbar-hide">
          {influencers.map((influencer) => (
            <motion.button key={influencer.id} whileHover={{ scale: 1.1 }} onClick={() => setSelectedInfluencer(influencer)} className={`relative flex-shrink-0 w-10 h-10 rounded-full overflow-hidden border-2 transition-all ${selectedInfluencer.id === influencer.id ? "border-[#1DB09B]" : "border-transparent"}`}>
              <img src={influencer.avatar} alt={influencer.name} className="w-full h-full object-cover" />
            </motion.button>
          ))}
        </div>
        <Button variant="ghost" size="icon"><ChevronRight className="h-5 w-5" /></Button>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={selectedInfluencer.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-800 rounded-2xl p-4 flex items-center gap-4">
          <img src={selectedInfluencer.avatar} alt={selectedInfluencer.name} className="w-14 h-14 rounded-full object-cover border-2 border-white/20" />
          <div className="flex-1 min-w-0">
            <h4 className="text-white font-bold truncate">{selectedInfluencer.name}</h4>
            <p className="text-slate-400 text-sm">{selectedInfluencer.handle}</p>
            <div className="flex items-center gap-3 mt-1 text-xs">
              <span className="text-slate-300">{selectedInfluencer.followers} followers</span>
              <span className="font-medium" style={{ color: '#1DB09B' }}>{selectedInfluencer.posts} posts</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="icon" variant="ghost" className="h-9 w-9 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 text-white"><Instagram className="h-4 w-4" /></Button>
          </div>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}