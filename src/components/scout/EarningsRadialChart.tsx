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

// Color palette for chart bars
const chartColors = [
  "hsl(210, 90%, 55%)",
  "hsl(35, 90%, 55%)",
  "#DB529F",
  "#A759D8",
  "#1DB09B",
];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="glass-dark rounded-xl p-3 shadow-xl border border-white/10">
        <p className="font-semibold text-white text-sm">{data.name}</p>
        <p className="text-[#18C5DC] font-bold">${data.earnings}</p>
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
            // Set total balance - check all possible field names
            const balance = response.data.available_balance || response.data.total_balance || response.data.balance || 0;
            setTotalBalance(Number(balance));
            
            // Set earnings chart data - map 'monthly_breakdown' OR 'earnings_chart'
            const monthlyData = response.data.monthly_breakdown || response.data.earnings_chart || [];
            if (monthlyData.length > 0) {
              const formatted = monthlyData.map((item: any, index: number) => ({
                name: item.month,
                earnings: Number(item.total || item.earnings || 0),
                fill: chartColors[index % chartColors.length],
              }));
              setEarningsData(formatted);
            }
            
            // Set gig history - map 'gig_rewards' OR 'gig_history'
            const gigs = response.data.gig_rewards || response.data.gig_history || [];
            if (gigs.length > 0) {
              const formattedGigs = gigs.map((gig: any, index: number) => ({
                id: gig.id || index,
                name: gig.gig_name || gig.name || 'Unknown Gig',
                status: gig.status || 'completed',
                reward: gig.reward ? `$${gig.reward}` : '$0',
                date: gig.date || ''
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

      {/* Total Balance */}
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

      {/* Radial Bar Chart - styled like reference image */}
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
        
        {/* Legend on right side like reference */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 space-y-2">
          {[...earningsData].reverse().map((item) => (
            <div key={item.name} className="flex items-center gap-2">
              <div 
                className="h-3 w-3 rounded-sm" 
                style={{ backgroundColor: item.fill }}
              />
              <span className="text-xs text-muted-foreground">{item.name}</span>
              <span className="text-xs text-white font-medium">${item.earnings}</span>
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
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-white/5">
                <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground">Gig Name</th>
                <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground">Status</th>
                <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground">Reward</th>
                <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground">Date</th>
              </tr>
            </thead>
            <tbody>
              {gigHistory.map((gig) => (
                <tr key={gig.id} className="border-t border-white/5 hover:bg-white/5 transition-colors">
                  <td className="px-3 py-2.5 font-medium">{gig.name}</td>
                  <td className="px-3 py-2.5">
                    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-[#A759D8]/20 text-[#18C5DC]">
                      <CheckCircle className="h-3 w-3" />
                      {gig.status.charAt(0).toUpperCase() + gig.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className="text-[#18C5DC] font-medium">{gig.reward}</span>
                  </td>
                  <td className="px-3 py-2.5 text-muted-foreground text-xs">{gig.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </GlassCard>
  );
}
