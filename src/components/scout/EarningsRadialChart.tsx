import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RadialBarChart,
  RadialBar,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Wallet, ArrowUpRight, CheckCircle, Gift, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { api } from "@/services/api";
import { useAppStore } from "@/store/useAppStore";
import { cn } from "@/lib/utils";

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
  const [isGigRewardsOpen, setIsGigRewardsOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const userId = (user as any)?.id || (user as any)?.user_id;
      
      if (userId) {
        try {
          const response = await api.getInfluencerDashboard(String(userId));
          console.log('Influencer Dashboard API response:', response);
          
          if (response.success && response.data) {
            const balance = response.data.available_balance ?? response.data.total_balance ?? response.data.balance ?? 0;
            setTotalBalance(Number(balance));

            const monthlyData =
              response.data.monthly_breakdown ??
              response.data.earnings_chart ??
              [];

            const formattedMonthly = (monthlyData as any[]).slice(0, 6).map((item: any, index: number) => ({
              name: String(item.month ?? item.name ?? `M${index + 1}`),
              earnings: Number(item.total ?? item.earnings ?? 0),
              fill: chartColors[index % chartColors.length],
            }));

            setEarningsData(
              formattedMonthly.length
                ? formattedMonthly
                : [
                    { name: "Jan", earnings: 120, fill: chartColors[0] },
                    { name: "Feb", earnings: 340, fill: chartColors[1] },
                    { name: "Mar", earnings: 220, fill: chartColors[2] },
                  ]
            );

            const gigs = response.data.gig_rewards ?? response.data.gig_history ?? [];
            const formattedGigs = (gigs as any[]).slice(0, 8).map((gig: any, index: number) => ({
              id: gig.id || index,
              name: gig.gig_name || gig.name || "Gig",
              status: gig.status || "completed",
              reward:
                typeof gig.reward === "string" && gig.reward.startsWith("$")
                  ? gig.reward
                  : `$${Number(gig.reward || 0).toLocaleString()}`,
              date: gig.date || new Date().toISOString().split("T")[0],
            }));

            setGigHistory(
              formattedGigs.length
                ? formattedGigs
                : [
                    {
                      id: 1,
                      name: "Downtown Foodie Trail",
                      status: "completed",
                      reward: "$50",
                      date: new Date().toISOString().split("T")[0],
                    },
                  ]
            );
          } else {
            setTotalBalance(0);
            setEarningsData([
              { name: "Jan", earnings: 120, fill: chartColors[0] },
              { name: "Feb", earnings: 340, fill: chartColors[1] },
              { name: "Mar", earnings: 220, fill: chartColors[2] },
            ]);
            setGigHistory([
              {
                id: 1,
                name: "Downtown Foodie Trail",
                status: "completed",
                reward: "$50",
                date: new Date().toISOString().split("T")[0],
              },
            ]);
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
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-xl" style={{ background: 'linear-gradient(135deg, #A759D8, #DB529F)' }}>
            <Wallet className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
          </div>
          <div>
            <h3 className="font-heading font-semibold text-white text-sm sm:text-base">Earnings</h3>
            <p className="text-[10px] sm:text-xs text-white/70">Growth by Month</p>
          </div>
        </div>
      </div>

      {/* Total Balance Display */}
      <div className="mb-4 sm:mb-6 p-3 sm:p-4 rounded-xl border border-[#A759D8]/20" style={{ background: "linear-gradient(to right, rgba(167,89,216,0.2), rgba(219,82,159,0.2))" }}>
        <p className="text-xs sm:text-sm text-white/70 mb-1">Available Balance</p>
        <div className="flex items-center justify-between gap-2">
          <p className="text-2xl sm:text-3xl font-bold font-heading text-white">
            ${totalBalance.toLocaleString()}
          </p>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button variant="scout" size="sm" className="rounded-full text-xs sm:text-sm">
              <ArrowUpRight className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />
              Withdraw
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Radial Bar Chart Section - Responsive layout */}
      <div className="h-[200px] sm:h-[260px] relative flex">
        <div className="flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              cx="50%"
              cy="50%"
              innerRadius="25%"
              outerRadius="100%"
              barSize={12}
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
        </div>
        
        {/* Dynamic Legend - Always visible, adjusted sizing */}
        <div className="flex flex-col justify-center gap-1 sm:gap-2 pl-2 sm:pl-4 min-w-[100px] sm:min-w-[140px]">
          {[...earningsData].reverse().map((item) => (
            <div key={item.name} className="flex items-center gap-1.5 sm:gap-2">
              <div 
                className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-sm flex-shrink-0" 
                style={{ backgroundColor: item.fill }}
              />
              <span className="text-[10px] sm:text-xs text-muted-foreground w-12 sm:w-16 truncate">{item.name}</span>
              <span className="text-[10px] sm:text-xs text-white font-medium">${item.earnings.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Gig Rewards History - Collapsible on mobile */}
      <div className="mt-4 sm:mt-6">
        <button 
          onClick={() => setIsGigRewardsOpen(!isGigRewardsOpen)}
          className="w-full flex items-center justify-between gap-2 mb-3 sm:mb-4 md:cursor-default"
        >
          <div className="flex items-center gap-2">
            <Gift className="h-4 w-4 text-[#18C5DC]" />
            <h4 className="font-heading font-semibold text-sm">Gig Rewards</h4>
          </div>
          <ChevronDown className={cn(
            "h-4 w-4 text-muted-foreground transition-transform md:hidden",
            isGigRewardsOpen && "rotate-180"
          )} />
        </button>
        
        {/* Desktop: always visible, Mobile: collapsible */}
        <AnimatePresence>
          <motion.div
            initial={false}
            animate={{ 
              height: isGigRewardsOpen ? "auto" : 0,
              opacity: isGigRewardsOpen ? 1 : 0 
            }}
            className={cn(
              "overflow-hidden md:!h-auto md:!opacity-100",
              !isGigRewardsOpen && "md:overflow-visible"
            )}
          >
            <div className="overflow-hidden rounded-xl border border-white/10">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-white/5">
                      <th className="text-left px-2 sm:px-3 py-2 text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wider">Gig</th>
                      <th className="text-left px-2 sm:px-3 py-2 text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                      <th className="text-left px-2 sm:px-3 py-2 text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wider">Reward</th>
                      <th className="text-left px-2 sm:px-3 py-2 text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gigHistory.length > 0 ? (
                      gigHistory.map((gig) => (
                        <tr key={gig.id} className="border-t border-white/5 hover:bg-white/5 transition-colors">
                          <td className="px-2 sm:px-3 py-2 font-medium text-xs sm:text-sm max-w-[80px] sm:max-w-none truncate">{gig.name}</td>
                          <td className="px-2 sm:px-3 py-2">
                            <span className="inline-flex items-center gap-1 text-[8px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded-full bg-[#1DB09B]/20 text-[#1DB09B] font-bold">
                              <CheckCircle className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                              <span className="hidden sm:inline">{gig.status.toUpperCase()}</span>
                              <span className="sm:hidden">✓</span>
                            </span>
                          </td>
                          <td className="px-2 sm:px-3 py-2">
                            <span className="text-[#1DB09B] font-bold text-xs sm:text-sm">{gig.reward}</span>
                          </td>
                          <td className="px-2 sm:px-3 py-2 text-muted-foreground text-[10px] hidden sm:table-cell">{gig.date}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-3 py-8 text-center text-muted-foreground italic text-xs sm:text-sm">
                          No rewards found. Start scouting to earn!
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </GlassCard>
  );
}