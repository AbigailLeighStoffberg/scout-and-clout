import { useEffect, useState } from "react";
import { ScoutSidebar } from "@/components/navigation/ScoutSidebar";
import { MobileBottomNav } from "@/components/navigation/MobileBottomNav";
import { RoleSwitcher } from "@/components/navigation/RoleSwitcher";
import { VibeAIChatbot } from "@/components/chat/VibeAIChatbot";
import { ProfileHeader } from "@/components/scout/ProfileHeader";
import { EarningsRadialChart } from "@/components/scout/EarningsRadialChart";
import { InfluencerWorkbench } from "@/components/scout/InfluencerWorkbench";
import { QuestCreator } from "@/components/scout/QuestCreator";
import { InfluencerMerchQR } from "@/components/scout/InfluencerMerchQR";
import { RecentContent } from "@/components/scout/RecentContent";
import { StaggeredFadeIn, FadeUpItem } from "@/components/effects/StaggeredFadeIn";
import { useAppStore } from "@/store/useAppStore";
import { Button } from "@/components/ui/button";
import { RefreshCw, Database, Plus, List, ArrowUpRight, Handshake } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { mockVibeLists, mockMissions } from "@/data/mockData";
import { VibeListCardEnhanced } from "@/components/scout/VibeListCardEnhanced";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/glass-card";
import { cn } from "@/lib/utils";

export default function ScoutDashboard() {
  const { user, setDarkMode } = useAppStore();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [refreshKey, setRefreshKey] = useState(0); 
  const [isSeeding, setIsSeeding] = useState(false);

  // 1. Enforce Dark Theme with Purple Influencer Identity
  useEffect(() => {
    setDarkMode(true);
    document.documentElement.classList.add("dark");
    document.documentElement.classList.add("influencer-theme"); 
    
    // Set Purple Brand Color (--primary)
    document.documentElement.style.setProperty('--primary', '270 70% 60%');
    document.body.style.backgroundColor = "#0a0118"; // Deeper purple/black bg
    
    return () => { 
      document.documentElement.style.removeProperty('--primary');
      document.documentElement.classList.remove("influencer-theme");
    };
  }, [setDarkMode]);

  // 2. Dynamic Seed Function (Exactly like Merchant)
  const handleSeedData = async () => {
    const userId = user?.id || user?.user_id; 
    if (!userId) {
      toast({ title: "Error", description: "No user ID found. Please re-login." });
      return;
    }

    setIsSeeding(true);
    try {
      const response = await fetch(`https://vibecheck-api.atwebpages.com/api.php?action=seed_analytics&user_id=${userId}`);
      const data = await response.json();
      
      if (data.status === "success") {
        toast({ title: "Stats Seeded", description: "Your influencer metrics are now live." });
        
        // Refresh Influencer-specific queries
        queryClient.invalidateQueries({ queryKey: ['influencer-stats'] });
        queryClient.invalidateQueries({ queryKey: ['earnings-data'] });
        
        setRefreshKey(prev => prev + 1); 
      }
    } catch (error) {
      console.error("Failed to seed data:", error);
      toast({ title: "Syncing...", description: "Updating your records now.", variant: "default" });
      setRefreshKey(prev => prev + 1);
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0118] text-white selection:bg-purple-500/30" key={refreshKey}>
      <ScoutSidebar />

      <main className="md:ml-64 p-4 md:p-8 pb-24 md:pb-8">
        {/* Top Header Row with Seed Button */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div className="md:hidden">
            <RoleSwitcher variant="curator" />
          </div>
          
          <div className="ml-auto">
            <Button 
              onClick={handleSeedData} 
              disabled={isSeeding}
              variant="outline" 
              size="sm" 
              className="gap-2 border-purple-500/50 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400"
            >
              {isSeeding ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
              {isSeeding ? "Syncing..." : "Seed My Stats"}
            </Button>
          </div>
        </div>

        <StaggeredFadeIn staggerDelay={0.08}>
          <FadeUpItem>
            <ProfileHeader className="mb-4" />
          </FadeUpItem>

          <FadeUpItem>
            <div className="grid gap-6 lg:grid-cols-2 mb-6">
              <div id="earnings" className="scroll-mt-6">
                <EarningsRadialChart key={`earnings-${refreshKey}`} />
              </div>
              
              <div id="gigs" className="flex flex-col scroll-mt-6">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="font-heading text-xl font-semibold flex items-center gap-2">
                    <List className="h-5 w-5 text-purple-400" />
                    My Quest Lines
                  </h2>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" className="text-purple-400">View All <ArrowUpRight className="ml-1 h-4 w-4" /></Button>
                  </div>
                </div>
                <div className="grid gap-4 flex-1">
                  {mockVibeLists.slice(0, 2).map((vibeList, i) => (
                    <VibeListCardEnhanced key={vibeList.id} vibeList={vibeList} isTrending={i === 0} />
                  ))}
                </div>
              </div>
            </div>
          </FadeUpItem>

          <FadeUpItem><InfluencerWorkbench /></FadeUpItem>
          <FadeUpItem><QuestCreator /></FadeUpItem>
          <FadeUpItem><InfluencerMerchQR /></FadeUpItem>
          <FadeUpItem><RecentContent /></FadeUpItem>
        </StaggeredFadeIn>
      </main>

      <MobileBottomNav variant="creator" />
      <VibeAIChatbot />
    </div>
  );
}