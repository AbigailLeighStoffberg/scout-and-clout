import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  BarChart3,
  PieChart,
  Users,
  QrCode,
  TrendingUp,
  Rocket,
  Sparkles as SparklesIcon,
  Settings,
  LogOut,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/useAppStore";
import { RoleSwitcher } from "./RoleSwitcher";

const merchantNavItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/merchant", isAnchor: false },
  { icon: Rocket, label: "Active Drops", href: "/merchant#active-drops", isAnchor: true },
  { icon: BarChart3, label: "Analytics", href: "/merchant#analytics", isAnchor: true },
  { icon: PieChart, label: "Traffic Sources", href: "/merchant#traffic", isAnchor: true },
  { icon: Users, label: "Top Influencers", href: "/merchant#influencers", isAnchor: true },
  { icon: QrCode, label: "QR Station", href: "/merchant#qr-station", isAnchor: true },
  { icon: TrendingUp, label: "Merch Analytics", href: "/merchant#merch-analytics", isAnchor: true },
  { icon: SparklesIcon, label: "Drop Studio", href: "/merchant#create-drop", isAnchor: true },
  { icon: Settings, label: "Settings", href: "/merchant/settings", isAnchor: false },
];

export function MerchantSidebar() {
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
      className="fixed left-0 top-0 z-40 hidden md:flex h-screen w-64 flex-col bg-gradient-to-b from-[#0f1929] to-[#0a1220] border-r border-[#1e3a5f]/30"
    >
      {/* Logo - matches auth page partner style */}
      <div className="flex items-center gap-3 border-b border-[#1DB09B]/20 px-6 py-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1DB09B]">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="font-heading font-bold text-lg text-white">VibeCheck</h1>
          <p className="text-xs text-[#1DB09B]">Partner Studio</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4">
        <p className="px-4 mb-3 text-xs font-medium uppercase tracking-wider text-[#18C5DC]/60">
          Menu
        </p>
        <ul className="space-y-1">
          {merchantNavItems.map((item) => {
            const isActive = item.isAnchor 
              ? location.hash === `#${item.href.split('#')[1]}`
              : location.pathname === item.href && !location.hash;
            return (
              <li key={item.href}>
                <Link
                  to={item.href}
                  onClick={() => handleNavClick(item.href, item.isAnchor)}
                  className={cn(
                    "group flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-[#1DB09B]/20 text-[#18C5DC] shadow-[0_0_15px_rgba(29,176,155,0.3)]"
                      : "text-gray-400 hover:bg-white/5 hover:text-white"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className={cn(
                      "h-5 w-5 transition-colors",
                      isActive ? "text-[#18C5DC]" : "text-gray-500 group-hover:text-gray-300"
                    )} />
                    {item.label}
                  </div>
                  {isActive && (
                    <ChevronRight className="h-4 w-4 text-[#18C5DC]" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Profile & Role Switcher */}
      <div className="border-t border-[#1DB09B]/20 p-4 space-y-3">
        <RoleSwitcher variant="merchant" />
        
        <div className="flex items-center gap-3 rounded-xl bg-[#1DB09B]/10 p-3">
          {((user as any)?.partner_profile_pic || user?.profile_pic) ? (
            <img
              src={(user as any)?.partner_profile_pic || user?.profile_pic}
              alt={(user as any)?.business_name || (user as any)?.businessName || user?.name}
              className="h-10 w-10 rounded-full object-cover object-top ring-2 ring-[#1DB09B]/30"
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-[#1DB09B] flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {(user as any)?.business_name || (user as any)?.businessName || user?.name || "Partner Account"}
            </p>
            <p className="text-xs text-[#18C5DC]/60 truncate">Partner Account</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-500 hover:bg-red-500/10 hover:text-red-400 transition-colors"
        >
          <LogOut className="h-5 w-5" />
          Sign Out
        </button>
      </div>
    </motion.aside>
  );
}
