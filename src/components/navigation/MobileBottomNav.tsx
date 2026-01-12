import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Gift,
  Map,
  Users,
  List,
  Target,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileBottomNavProps {
  variant: "merchant" | "creator" | "partner";
}

const merchantNavItems = [
  { icon: LayoutDashboard, label: "Home", href: "/merchant" },
  { icon: Gift, label: "Drops", href: "/merchant/drops" },
  { icon: Map, label: "Map", href: "/merchant/map" },
  { icon: Users, label: "Influencers", href: "/merchant/influencers" },
];

const creatorNavItems = [
  { icon: LayoutDashboard, label: "Home", href: "/scout" },
  { icon: List, label: "Lists", href: "/scout/vibelists" },
  { icon: Zap, label: "Feed", href: "/scout/feed" },
  { icon: Target, label: "Missions", href: "/scout/missions" },
];

export function MobileBottomNav({ variant }: MobileBottomNavProps) {
  const location = useLocation();
  const isPartner = variant === "merchant" || variant === "partner";
  const navItems = isPartner ? merchantNavItems : creatorNavItems;

  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 md:hidden",
        "glass border-t border-border/50 backdrop-blur-2xl",
        "safe-area-inset-bottom"
      )}
    >
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "relative flex flex-col items-center gap-1 rounded-xl px-4 py-2 transition-all",
                isActive
                  ? isPartner
                    ? "text-[#1DB09B]"
                    : "text-[#A759D8]"
                  : "text-muted-foreground"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId={`mobile-nav-bg-${variant}`}
                  className={cn(
                    "absolute inset-0 rounded-xl",
                    isPartner
                      ? "bg-[#1DB09B]/10"
                      : "bg-[#A759D8]/10"
                  )}
                  transition={{ type: "spring", duration: 0.4 }}
                />
              )}
              <item.icon className="relative z-10 h-5 w-5" />
              <span className="relative z-10 text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </motion.nav>
  );
}
