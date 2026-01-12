import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  DollarSign,
  List,
  Wrench,
  Sparkles as SparklesIcon,
  QrCode,
  Video,
  Handshake,
  Settings,
  LogOut,
  Sparkles,
  ChevronRight,
  Trophy,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/useAppStore";
import { RoleSwitcher } from "./RoleSwitcher";
import type { CuratorProfile, CuratorLevel } from "@/types";
import { mockCurator } from "@/data/mockData";

const curatorNavItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/scout", isAnchor: false },
  { icon: DollarSign, label: "Earnings", href: "/scout#earnings", isAnchor: true },
  { icon: List, label: "My Quest Lines", href: "/scout#gigs", isAnchor: true },
  { icon: Wrench, label: "Workbench", href: "/scout#workbench", isAnchor: true },
  { icon: SparklesIcon, label: "Quest Creator", href: "/scout#gig-creator", isAnchor: true },
  { icon: QrCode, label: "Merch QR", href: "/scout#merch-qr", isAnchor: true },
  { icon: Video, label: "Recent Content", href: "/scout#recent-content", isAnchor: true },
  { icon: Handshake, label: "Gigs", href: "/scout#missions", isAnchor: true },
  { icon: Settings, label: "Settings", href: "/scout/settings", isAnchor: false },
];

const levelColors: Record<CuratorLevel, string> = {
  rookie: "from-gray-400 to-gray-600",
  explorer: "from-green-400 to-emerald-600",
  pathfinder: "from-blue-400 to-cyan-600",
  trailblazer: "from-purple-400 to-pink-600",
  legendary: "from-yellow-400 to-orange-600",
};

const levelProgress: Record<CuratorLevel, { current: number; next: number; nextLevel: string }> = {
  rookie: { current: 0, next: 1000, nextLevel: "Explorer" },
  explorer: { current: 1000, next: 5000, nextLevel: "Pathfinder" },
  pathfinder: { current: 5000, next: 15000, nextLevel: "Trailblazer" },
  trailblazer: { current: 15000, next: 50000, nextLevel: "Legendary" },
  legendary: { current: 50000, next: 100000, nextLevel: "Max Level" },
};

function SidebarImpactScore() {
  const curator = mockCurator;
  const progress = levelProgress[curator.level];
  const progressPercent = Math.min(
    ((curator.impactScore - progress.current) / (progress.next - progress.current)) * 100,
    100
  );

  return (
    <div className="rounded-xl bg-[#A759D8]/10 border border-[#A759D8]/20 p-3">
      <div className="flex items-center gap-2 mb-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: 'linear-gradient(135deg, #A759D8, #DB529F)' }}>
          <Trophy className="h-4 w-4 text-white" />
        </div>
        <div>
          <p className="text-xs text-white/70">Impact Score</p>
          <p className="text-lg font-bold text-white">{curator.impactScore.toLocaleString()}</p>
        </div>
        <span className={cn("ml-auto rounded-full bg-gradient-to-r px-2 py-0.5 text-[10px] font-semibold text-white capitalize", levelColors[curator.level])}>
          {curator.level}
        </span>
      </div>
      
      {/* Mini progress bar */}
      <div className="h-1.5 rounded-full bg-slate-900 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
          className="h-full rounded-full"
          style={{ background: "linear-gradient(90deg, #A759D8, #DB529F)" }}
        />
      </div>
      <p className="text-[10px] text-muted-foreground mt-1">
        {(progress.next - curator.impactScore).toLocaleString()} to {progress.nextLevel}
      </p>
    </div>
  );
}

export function ScoutSidebar() {
  const location = useLocation();
  const { user, logout } = useAppStore();

  const handleNavClick = (href: string, isAnchor: boolean) => {
    if (isAnchor) {
      const id = href.split('#')[1];
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="fixed left-0 top-0 z-40 hidden md:flex h-screen w-64 flex-col bg-sidebar border-r border-sidebar-border"
    >
      {/* Logo - matches auth page influencer style (gradient) */}
      <div className="flex items-center gap-3 border-b border-[#A759D8]/20 px-6 py-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: 'linear-gradient(135deg, #A759D8, #DB529F)' }}>
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="font-heading font-bold text-lg text-sidebar-foreground">VibeCheck</h1>
          <p className="text-xs bg-gradient-to-r from-[#A759D8] to-[#DB529F] bg-clip-text text-transparent">Influencer Studio</p>
        </div>
      </div>

      {/* Impact Score Card - Above Menu */}
      <div className="px-4 pt-4">
        <SidebarImpactScore />
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4">
        <p className="px-4 mb-3 text-xs font-medium uppercase tracking-wider text-shared-text/60">
          Menu
        </p>
        <ul className="space-y-1">
          {curatorNavItems.map((item) => {
            const isActive = item.isAnchor 
              ? location.hash === `#${item.href.split('#')[1]}`
              : location.pathname === item.href && !location.hash;
            return (
              <li key={item.href}>
                <Link
                  to={item.href}
                  onClick={() => handleNavClick(item.href, item.isAnchor)}
                  className={cn(
                    "group relative flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-[#A759D8]/20 text-shared-text shadow-[0_0_15px_rgba(167,89,216,0.3)]"
                      : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className={cn(
                      "h-5 w-5 transition-colors",
                      isActive ? "text-shared-text" : "text-muted-foreground group-hover:text-sidebar-accent-foreground"
                    )} />
                    {item.label}
                  </div>
                  {isActive && (
                    <ChevronRight className="h-4 w-4 text-shared-text" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Profile & Role Switcher */}
      <div className="border-t border-[#A759D8]/20 p-4 space-y-3">
        <RoleSwitcher variant="curator" />
        
        <div className="flex items-center gap-3 rounded-xl bg-[#A759D8]/10 p-3">
          {user?.profile_pic ? (
            <img
              src={user.profile_pic}
              alt={user.name}
              className="h-10 w-10 rounded-full object-cover object-top ring-2 ring-[#A759D8]/50"
            />
          ) : (
            <div className="h-10 w-10 rounded-full gradient-influencer" />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">{user?.name || user?.username}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
        >
          <LogOut className="h-5 w-5" />
          Sign Out
        </button>
      </div>
    </motion.aside>
  );
}
