import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  RadialBarChart,
  RadialBar,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Wallet, ArrowUpRight, CheckCircle, Gift, Loader2 } from "lucide-react";
import { api } from "@/services/api";
import { useAppStore } from "@/store/useAppStore";

// Color palette for chart bars based on your UI
const chartColors = [
  "#1DB09B", // Teal
  "#A759D8", // Purple
  "#DB529F", // Pink
  "hsl(210, 90%, 55%)", // Blue
  "hsl(35, 90%, 55%)",  // Orange
];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="glass-dark rounded-xl p-3 shadow-xl border border-white/10">
        <p className="font-semibold text-white text-sm">{data.name}</p>
        <p className="text-[#18C5DC] font-bold">${data.earnings.toLocaleString()}</p>
      </div>
    );
  }
  return null;
};

export function EarningsRadialChart() {
  const { user } = useAppStore();
  const [earningsData, setEarningsData] = useState<Array<{ name: string; earnings: number; fill: string }>>([]);
  const [gigHistory, setGigHistory] = useState<Array<{ id: number; name: string; status: string; reward: string; date: string }>>([]);
  const [totalBalance, setTotalBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const userId = (user as any)?.id || (user as any)?.user_id;
      
      if (userId) {
        try {
          const response = await api.getInfluencerDashboard(String(userId));
          console.log('Influencer Dashboard API response:', response);
          
          if (response.success && response.data) {
            // 1. Map Balance - prioritizing 'available_balance' from API v26.5
            const balance = response.data.available_balance ?? 0;
            setTotalBalance(Number(balance));
            
            // 2. Map Monthly Breakdown for Radial Chart
            // The API sends 'month' and 'total'
            const monthlyData = response.data.monthly_breakdown || [];
            if (monthlyData.length > 0) {
              const formatted = monthlyData.map((item: any, index: number) => ({
                name: item.month,
                earnings: Number(item.total || 0),
                fill: chartColors[index % chartColors.length],
              }));
              setEarningsData(formatted);
            }
            
            // 3. Map Gig Rewards Table
            // The API sends 'gig_name', 'status', 'reward', and 'date'
            const gigs = response.data.gig_rewards || [];
            if (gigs.length > 0) {
              const formattedGigs = gigs.map((gig: any, index: number) => ({
                id: gig.id || index,
                name: gig.gig_name || 'Downtown Foodie Trail',
                status: gig.status || 'completed',
                // Handle currency formatting if needed
                reward: typeof gig.reward === 'string' && gig.reward.startsWith('$') 
                  ? gig.reward 
                  : `$${Number(gig.reward).toLocaleString()}`,
                date: gig.date || new Date().toISOString().split('T')[0]
              }));
              setGigHistory(formattedGigs);
            }
          }
        } catch (error) {
          console.error('Error fetching influencer dashboard:', error);
        }
      }
      setLoading(false);
    };
    
    fetchData();
  }, [user]);

  if (loading) {
    return (
      <GlassCard className="h-full flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </GlassCard>
    );
  }

  return (
    <GlassCard className="h-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: 'linear-gradient(135deg, #A759D8, #DB529F)' }}>
            <Wallet className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-heading font-semibold text-white">Earnings</h3>
            <p className="text-xs text-white/70">Growth by Month</p>
          </div>
        </div>
      </div>

      {/* Total Balance Display */}
      <div className="mb-6 p-4 rounded-xl border border-[#A759D8]/20" style={{ background: "linear-gradient(to right, rgba(167,89,216,0.2), rgba(219,82,159,0.2))" }}>
        <p className="text-sm text-white/70 mb-1">Available Balance</p>
        <div className="flex items-center justify-between">
          <p className="text-3xl font-bold font-heading text-white">
            ${totalBalance.toLocaleString()}
          </p>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button variant="scout" size="sm" className="rounded-full">
              <ArrowUpRight className="mr-1 h-4 w-4" />
              Withdraw
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Radial Bar Chart Section */}
      <div className="h-[260px] relative">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            cx="30%"
            cy="50%"
            innerRadius="20%"
            outerRadius="100%"
            barSize={18}
            data={earningsData}
            startAngle={180}
            endAngle={-90}
          >
            <RadialBar
              background={{ fill: 'hsl(225, 15%, 12%)' }}
              dataKey="earnings"
              cornerRadius={10}
            />
            <Tooltip content={<CustomTooltip />} />
          </RadialBarChart>
        </ResponsiveContainer>
        
        {/* Dynamic Legend */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 space-y-2">
          {[...earningsData].reverse().map((item) => (
            <div key={item.name} className="flex items-center gap-2">
              <div 
                className="h-3 w-3 rounded-sm" 
                style={{ backgroundColor: item.fill }}
              />
              <span className="text-xs text-muted-foreground w-16">{item.name}</span>
              <span className="text-xs text-white font-medium">${item.earnings.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Gig Rewards History Table */}
      <div className="mt-6">
        <div className="flex items-center gap-2 mb-4">
          <Gift className="h-4 w-4 text-[#18C5DC]" />
          <h4 className="font-heading font-semibold text-sm">Gig Rewards</h4>
        </div>
        
        <div className="overflow-hidden rounded-xl border border-white/10">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-white/5">
                  <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">Gig Name</th>
                  <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">Reward</th>
                  <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody>
                {gigHistory.length > 0 ? (
                  gigHistory.map((gig) => (
                    <tr key={gig.id} className="border-t border-white/5 hover:bg-white/5 transition-colors">
                      <td className="px-3 py-2.5 font-medium">{gig.name}</td>
                      <td className="px-3 py-2.5">
                        <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-[#1DB09B]/20 text-[#1DB09B] font-bold">
                          <CheckCircle className="h-3 w-3" />
                          {gig.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-3 py-2.5">
                        <span className="text-[#1DB09B] font-bold">{gig.reward}</span>
                      </td>
                      <td className="px-3 py-2.5 text-muted-foreground text-[10px]">{gig.date}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-3 py-8 text-center text-muted-foreground italic">
                      No rewards found. Start scouting to earn!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}