import { useEffect } from "react";
import { motion } from "framer-motion";
import {
  Handshake,
  Plus,
  ArrowUpRight,
  List,
} from "lucide-react";
import { ScoutSidebar } from "@/components/navigation/ScoutSidebar";
import { MobileBottomNav } from "@/components/navigation/MobileBottomNav";
import { RoleSwitcher } from "@/components/navigation/RoleSwitcher";
import { VibeAIChatbot } from "@/components/chat/VibeAIChatbot";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { VibeListCardEnhanced } from "@/components/scout/VibeListCardEnhanced";
import { InfluencerWorkbench } from "@/components/scout/InfluencerWorkbench";
import { QuestCreator } from "@/components/scout/QuestCreator";
import { InfluencerMerchQR } from "@/components/scout/InfluencerMerchQR";
import { ProfileHeader } from "@/components/scout/ProfileHeader";
import { EarningsRadialChart } from "@/components/scout/EarningsRadialChart";
import { RecentContent } from "@/components/scout/RecentContent";
import { StaggeredFadeIn, FadeUpItem } from "@/components/effects/StaggeredFadeIn";
import { useAppStore } from "@/store/useAppStore";
import {
  mockVibeLists,
  mockMissions,
} from "@/data/mockData";
import { cn } from "@/lib/utils";

function CollabCard({ mission }: { mission: typeof mockMissions[0] }) {
  const statusColors = {
    available: "border-[#A759D8]/30 bg-[#A759D8]/10",
    accepted: "border-[#DB529F]/30 bg-[#DB529F]/10",
    completed: "border-muted bg-muted/50",
    expired: "border-muted bg-muted/30",
  };

  return (
    <motion.div whileHover={{ scale: 1.02, y: -2 }} transition={{ duration: 0.2 }} className="h-full">
      <GlassCard className={cn("border h-full flex flex-col shadow-xl", statusColors[mission.status])}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Handshake className="h-4 w-4 text-[#18C5DC]" />
              <span className="text-xs text-muted-foreground uppercase tracking-wider">{mission.merchantName}</span>
            </div>
            <h4 className="font-semibold">{mission.title}</h4>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-[#18C5DC]">+{mission.impactReward}</p>
            <p className="text-xs text-muted-foreground">Points</p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">{mission.description}</p>
        <Button variant="scout" size="sm" className="w-full mt-auto" disabled={mission.status !== "available"}>
          {mission.status === "available" ? "Accept Gig" : mission.status === "accepted" ? "In Progress" : "Completed"}
        </Button>
      </GlassCard>
    </motion.div>
  );
}

export default function ScoutDashboard() {
  const { setDarkMode } = useAppStore();

  useEffect(() => {
    setDarkMode(true);
    document.documentElement.classList.add("dark");
    return () => { document.documentElement.classList.remove("dark"); };
  }, [setDarkMode]);

  return (
    <div className="min-h-screen bg-background">
      <ScoutSidebar />

      <main className="md:ml-64 p-4 md:p-8 pb-24 md:pb-8">
        <StaggeredFadeIn staggerDelay={0.08}>
          {/* Profile Header with Cover Image */}
          <FadeUpItem>
            <ProfileHeader className="mb-4" />
          </FadeUpItem>

          {/* Role switcher (mobile-visible) */}
          <FadeUpItem>
            <div className="md:hidden mb-6">
              <RoleSwitcher variant="curator" />
            </div>
          </FadeUpItem>

          {/* Row 1: Earnings + My Published Gigs - Same height */}
          <FadeUpItem>
            <div className="grid gap-6 lg:grid-cols-2 mb-6">
              <div id="earnings" className="scroll-mt-6">
                <EarningsRadialChart />
              </div>
              
              <div id="gigs" className="flex flex-col scroll-mt-6">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="font-heading text-xl font-semibold flex items-center gap-2">
                    <List className="h-5 w-5 text-[#18C5DC]" />
                    My Quest Lines
                  </h2>
                  <div className="flex items-center gap-2">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button variant="scout" size="sm">
                        <Plus className="mr-1 h-4 w-4" />
                        Create
                      </Button>
                    </motion.div>
                    <Button variant="ghost" className="text-[#18C5DC]">View All<ArrowUpRight className="ml-1 h-4 w-4" /></Button>
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

          {/* Row 2: Influencer Workbench (Collapsible) */}
          <FadeUpItem>
            <div id="workbench" className="mb-6 scroll-mt-6">
              <InfluencerWorkbench />
            </div>
          </FadeUpItem>

          {/* Row 3: Quest Creator (Collapsible) */}
          <FadeUpItem>
            <div id="gig-creator" className="mb-6 scroll-mt-6">
              <QuestCreator />
            </div>
          </FadeUpItem>

          {/* Row 4: Merch QR - Full width */}
          <FadeUpItem>
            <div id="merch-qr" className="mb-6 scroll-mt-6">
              <InfluencerMerchQR />
            </div>
          </FadeUpItem>

          {/* Row 5: Gigs - Full width */}
          <FadeUpItem>
            <div id="missions" className="mb-6 scroll-mt-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-heading text-xl font-semibold flex items-center gap-2">
                  <Handshake className="h-5 w-5 text-[#18C5DC]" />
                  Gigs
                </h2>
                <Button variant="ghost" className="text-[#18C5DC]">View All<ArrowUpRight className="ml-1 h-4 w-4" /></Button>
              </div>
              <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
                {mockMissions.slice(0, 3).map((mission) => (
                  <CollabCard key={mission.id} mission={mission} />
                ))}
              </div>
            </div>
          </FadeUpItem>

          {/* Row 6: Recent Content - TikTok Embeds */}
          <FadeUpItem>
            <div id="recent-content" className="scroll-mt-6">
              <RecentContent />
            </div>
          </FadeUpItem>
        </StaggeredFadeIn>
      </main>

      <MobileBottomNav variant="creator" />
      <VibeAIChatbot />
    </div>
  );
}
