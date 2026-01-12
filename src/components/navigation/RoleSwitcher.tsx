import { motion } from "framer-motion";
import { Building2, User, ArrowLeftRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "@/store/useAppStore";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface RoleSwitcherProps {
  variant?: "merchant" | "curator";
}

export function RoleSwitcher({ variant = "curator" }: RoleSwitcherProps) {
  const navigate = useNavigate();
  const { user, switchRole, activeRole } = useAppStore();

  // Only show if user has multiple roles
  const hasMultipleRoles = !!user?.roles && user.roles.length > 1;
  if (!hasMultipleRoles) return null;

  const isMerchant = activeRole === "merchant";
  const otherRole = isMerchant ? "curator" : "merchant";
  const otherLabel = isMerchant ? "Influencer" : "Partner";

  const handleSwitch = () => {
    switchRole(otherRole);
    toast.success(`Switched to ${otherLabel} Studio`);
    navigate(otherRole === "merchant" ? "/merchant" : "/scout");
  };

  const colors = {
    merchant: {
      bg: "bg-[#1DB09B]/10 hover:bg-[#1DB09B]/20",
      border: "border-[#1DB09B]/30",
      text: "text-[#18C5DC]",
      icon: "text-[#1DB09B]",
    },
    curator: {
      bg: "bg-[#A759D8]/10 hover:bg-[#A759D8]/20",
      border: "border-[#A759D8]/30",
      text: "text-white",
      icon: "text-[#DB529F]",
    },
  };

  const style = colors[variant];

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleSwitch}
      className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all border border-white/20 text-white"
      style={{
        background: "linear-gradient(135deg, #1DB09B, #18C5DC, #DB529F)",
      }}
    >
      <div className="flex items-center gap-2">
        {isMerchant ? (
          <User className="h-4 w-4 text-white" />
        ) : (
          <Building2 className="h-4 w-4 text-white" />
        )}
        <span>Switch to {otherLabel}</span>
      </div>
      <ArrowLeftRight className="h-4 w-4 ml-auto opacity-70" />
    </motion.button>
  );
}