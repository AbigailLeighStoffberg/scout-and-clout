import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  LayoutDashboard,
  Gift,
  Map,
  Users,
  BarChart3,
  PieChart,
  QrCode,
  TrendingUp,
  Rocket,
  Sparkles,
  Settings,
  LogOut,
  RefreshCw,
  List,
  Zap,
  Target,
  DollarSign,
  Wrench,
  Video,
  Handshake,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/useAppStore";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface MobileTopNavProps {
  variant: "merchant" | "creator";
  onOpenChat?: () => void;
}

const merchantNavItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/merchant", isAnchor: false },
  { icon: Rocket, label: "Active Drops", href: "/merchant#active-drops", isAnchor: true },
  { icon: BarChart3, label: "Analytics", href: "/merchant#analytics", isAnchor: true },
  { icon: PieChart, label: "Traffic Sources", href: "/merchant#traffic", isAnchor: true },
  { icon: Users, label: "Top Influencers", href: "/merchant#influencers", isAnchor: true },
  { icon: QrCode, label: "QR Station", href: "/merchant#qr-station", isAnchor: true },
  { icon: TrendingUp, label: "Merch Analytics", href: "/merchant#merch-analytics", isAnchor: true },
  { icon: Sparkles, label: "Drop Studio", href: "/merchant#create-drop", isAnchor: true },
  { icon: Settings, label: "Settings", href: "/merchant/settings", isAnchor: false },
];

const creatorNavItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/scout", isAnchor: false },
  { icon: DollarSign, label: "Earnings", href: "/scout#earnings", isAnchor: true },
  { icon: List, label: "My Quest Lines", href: "/scout#gigs", isAnchor: true },
  { icon: Wrench, label: "Workbench", href: "/scout#workbench", isAnchor: true },
  { icon: Sparkles, label: "Quest Creator", href: "/scout#gig-creator", isAnchor: true },
  { icon: QrCode, label: "Merch QR", href: "/scout#merch-qr", isAnchor: true },
  { icon: Video, label: "Recent Content", href: "/scout#recent-content", isAnchor: true },
  { icon: Handshake, label: "Gigs", href: "/scout#missions", isAnchor: true },
  { icon: Settings, label: "Settings", href: "/scout/settings", isAnchor: false },
];

export function MobileTopNav({ variant, onOpenChat }: MobileTopNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, switchRole } = useAppStore();
  const { toast } = useToast();
  
  const isMerchant = variant === "merchant";
  const navItems = isMerchant ? merchantNavItems : creatorNavItems;
  const primaryColor = isMerchant ? "#1DB09B" : "#A759D8";

  const handleNavClick = (href: string, isAnchor: boolean) => {
    if (isAnchor) {
      const id = href.split('#')[1];
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
    setIsOpen(false);
  };

  const handleRoleSwitch = () => {
    const newRole = isMerchant ? "curator" : "merchant";
    switchRole(newRole);
    toast({
      title: `Switched to ${isMerchant ? "Influencer" : "Partner"} Mode`,
      description: `You're now viewing as ${isMerchant ? "an Influencer" : "a Partner"}`,
    });
    navigate(isMerchant ? "/scout" : "/merchant");
    setIsOpen(false);
  };

  return (
    <>
      {/* Top Navigation Bar */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 md:hidden glass border-b border-border/50 backdrop-blur-2xl safe-area-inset-top"
      >
        <div className="flex items-center justify-between px-4 py-3">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div 
              className="flex h-8 w-8 items-center justify-center rounded-lg"
              style={{ 
                background: isMerchant 
                  ? primaryColor 
                  : 'linear-gradient(135deg, #A759D8, #DB529F)' 
              }}
            >
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="font-heading font-bold text-sm text-white">
              {isMerchant ? "Partner" : "Influencer"} Studio
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Chat with AI button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onOpenChat}
              className="h-9 w-9 rounded-lg"
              style={{ color: primaryColor }}
            >
              <MessageSquare className="h-5 w-5" />
            </Button>

            {/* Hamburger Menu */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
              className="h-9 w-9 rounded-lg"
            >
              {isOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </motion.nav>

      {/* Slide-out Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
            />

            {/* Menu Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 z-50 w-72 glass-dark border-l border-border/50 md:hidden overflow-y-auto"
            >
              <div className="p-4 pt-16">
                {/* Role Switcher Button */}
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={handleRoleSwitch}
                  className="w-full mb-6 flex items-center gap-3 p-3 rounded-xl border transition-colors"
                  style={{ 
                    borderColor: `${primaryColor}50`,
                    background: `${primaryColor}10`,
                  }}
                >
                  <div 
                    className="h-10 w-10 rounded-lg flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, #1DB09B, #18C5DC, #A759D8, #DB529F)' }}
                  >
                    <RefreshCw className="h-5 w-5 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-white">
                      Switch to {isMerchant ? "Influencer" : "Partner"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Change studio view
                    </p>
                  </div>
                </motion.button>

                {/* Navigation Items */}
                <p className="px-2 mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Menu
                </p>
                <ul className="space-y-1">
                  {navItems.map((item) => {
                    const isActive = item.isAnchor 
                      ? location.hash === `#${item.href.split('#')[1]}`
                      : location.pathname === item.href && !location.hash;
                    return (
                      <li key={item.href}>
                        <Link
                          to={item.href}
                          onClick={() => handleNavClick(item.href, item.isAnchor)}
                          className={cn(
                            "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                            isActive
                              ? "text-white"
                              : "text-muted-foreground hover:text-white hover:bg-white/5"
                          )}
                          style={isActive ? { 
                            backgroundColor: `${primaryColor}20`,
                            boxShadow: `0 0 15px ${primaryColor}30`
                          } : {}}
                        >
                          <item.icon 
                            className="h-5 w-5" 
                            style={isActive ? { color: primaryColor } : {}}
                          />
                          {item.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>

                {/* User Profile & Logout */}
                <div className="mt-6 pt-6 border-t border-border/50">
                  <div className="flex items-center gap-3 rounded-xl p-3 mb-3"
                    style={{ backgroundColor: `${primaryColor}10` }}
                  >
                    {((user as any)?.partner_profile_pic || user?.profile_pic) ? (
                      <img
                        src={isMerchant 
                          ? ((user as any)?.partner_profile_pic || user?.profile_pic)
                          : user?.profile_pic
                        }
                        alt={user?.name}
                        className="h-10 w-10 rounded-full object-cover object-top ring-2"
                        style={{ borderColor: `${primaryColor}50` }}
                      />
                    ) : (
                      <div 
                        className="h-10 w-10 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: primaryColor }}
                      >
                        <Sparkles className="h-5 w-5 text-white" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {isMerchant 
                          ? ((user as any)?.business_name || (user as any)?.businessName || user?.name || "Partner")
                          : (user?.name || user?.username || "Influencer")
                        }
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {isMerchant ? "Partner Account" : "Influencer Account"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => { logout(); setIsOpen(false); }}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-red-500/10 hover:text-red-400 transition-colors"
                  >
                    <LogOut className="h-5 w-5" />
                    Sign Out
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
