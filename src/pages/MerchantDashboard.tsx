import { useEffect, useState } from "react";
import { MerchantSidebar } from "@/components/navigation/MerchantSidebar";
import { MobileBottomNav } from "@/components/navigation/MobileBottomNav";
import { RoleSwitcher } from "@/components/navigation/RoleSwitcher";
import { VibeAIChatbot } from "@/components/chat/VibeAIChatbot";
import { CinematicBanner } from "@/components/merchant/CinematicBanner";
import { CombinedAnalyticsChart } from "@/components/merchant/CombinedAnalyticsChart";
import { TrafficSourcesChart } from "@/components/merchant/TrafficSourcesChart";
import { TopInfluencersLeaderboard } from "@/components/merchant/TopInfluencersLeaderboard";
import { CreateDropStudio } from "@/components/merchant/CreateDropStudio";
import { CreateDropFAB } from "@/components/merchant/CreateDropWidget";
import { QRStationCyberpunk } from "@/components/merchant/QRStationCyberpunk";

import { mockMerchant } from "@/data/mockData";
import { StaggeredFadeIn, FadeUpItem } from "@/components/effects/StaggeredFadeIn";
import { useAppStore } from "@/store/useAppStore";
import { Button } from "@/components/ui/button";
import { RefreshCw, Database } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export default function MerchantDashboard() {
  const { user, setDarkMode } = useAppStore();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [refreshKey, setRefreshKey] = useState(0); 
  const [isSeeding, setIsSeeding] = useState(false);

  // 1. Enforce Dark Theme with Teal Merchant Identity
  useEffect(() => {
    setDarkMode(true);
    document.documentElement.classList.add("dark");
    document.documentElement.classList.remove("influencer-theme"); 
    
    document.documentElement.style.setProperty('--primary', '169 71% 40%');
    document.body.style.backgroundColor = "#0f1929"; 
    
    return () => { 
      document.documentElement.style.removeProperty('--primary');
      document.body.style.backgroundColor = "";
    };
  }, [setDarkMode]);

  // 2. Optimized Seed Function (FIXED: Removed duplicates and syntax errors)
  const handleSeedData = async () => {
    const userId = (user as any)?.id || (user as any)?.user_id; 
    
    if (!userId) {
      toast({ title: "Error", description: "No user ID found. Please re-login." });
      return;
    }

    setIsSeeding(true);
    try {
      const response = await fetch(`https://vibecheck-api.atwebpages.com/api.php?action=seed_analytics&user_id=${userId}`);
      const data = await response.json();
      
      if (data.status === "success") {
        toast({ 
          title: "Database Seeded", 
          description: "Unique analytics generated for your account." 
        });
        
        // Refresh TanStack Query cache
        queryClient.invalidateQueries({ queryKey: ['merchant-stats'] });
        queryClient.invalidateQueries({ queryKey: ['influencer-sales'] });
        
        // Trigger local re-render
        setRefreshKey(prev => prev + 1); 
      }
    } catch (error) {
      console.error("Failed to seed data:", error);
      toast({ 
        title: "Syncing Analytics...", 
        description: "AwardSpace is busy, but data may still be updating.", 
        variant: "default" 
      });
      setRefreshKey(prev => prev + 1);
    } finally {
      setIsSeeding(false);
    }
  };

  const businessName = (user as any)?.business_name || (user as any)?.businessName || mockMerchant.businessName;
  const coverUrl = (user as any)?.partner_cover_url || (user as any)?.cover_url;
  const profilePic = (user as any)?.partner_profile_pic || (user as any)?.profile_pic || user?.avatar;

  return (
    <div className="min-h-screen bg-[#0f1929] text-white selection:bg-teal-500/30" key={refreshKey}>
      <MerchantSidebar />

      <main className="md:ml-64 p-4 md:p-8 pb-24 md:pb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div className="md:hidden">
            <RoleSwitcher variant="merchant" />
          </div>
          
          <div className="ml-auto">
            <Button 
              onClick={handleSeedData} 
              disabled={isSeeding}
              variant="outline" 
              size="sm" 
              className="gap-2 border-teal-500/50 bg-teal-500/10 hover:bg-teal-500/20 text-teal-400"
            >
              {isSeeding ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
              {isSeeding ? "Generating..." : "Seed Unique Analytics"}
            </Button>
          </div>
        </div>

        <StaggeredFadeIn staggerDelay={0.08}>
          <FadeUpItem>
            <CinematicBanner businessName={businessName} coverUrl={coverUrl} profilePic={profilePic} />
          </FadeUpItem>

          <FadeUpItem>
            <div id="analytics" className="grid gap-6 lg:grid-cols-3 mb-6 scroll-mt-6">
              <div className="lg:col-span-2">
                <CombinedAnalyticsChart key={`chart-${refreshKey}`} />
              </div>
              <div id="traffic" className="lg:col-span-1 scroll-mt-6">
                <TrafficSourcesChart key={`traffic-${refreshKey}`} />
              </div>
            </div>
          </FadeUpItem>

          <FadeUpItem>
            <div className="grid gap-6 lg:grid-cols-12 mb-6">
              <div id="influencers" className="lg:col-span-8 scroll-mt-6">
                <TopInfluencersLeaderboard key={`leaderboard-${refreshKey}`} />
              </div>
              <div id="qr-station" className="lg:col-span-4 scroll-mt-6">
                <QRStationCyberpunk />
              </div>
            </div>
          </FadeUpItem>


          <FadeUpItem>
            <div id="create-drop" className="mb-6 scroll-mt-6">
              <CreateDropStudio />
            </div>
          </FadeUpItem>
        </StaggeredFadeIn>
      </main>

      <CreateDropFAB />
      <MobileBottomNav variant="partner" />
      <VibeAIChatbot />
    </div>
  );
}