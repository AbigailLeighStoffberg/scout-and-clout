import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    isPositive: boolean;
  };
  icon: LucideIcon;
  variant?: "default" | "merchant" | "scout";
  className?: string;
}

export function StatCard({
  title,
  value,
  change,
  icon: Icon,
  variant = "default",
  className,
}: StatCardProps) {
  const variants = {
    default: "bg-card border-border",
    merchant: "bg-card border-vibe-blue/20 hover:border-vibe-blue/40",
    scout: "glass-dark border-vibe-pink/20 hover:border-vibe-pink/40 hover:glow-pink",
  };

  const iconVariants = {
    default: "bg-muted text-muted-foreground",
    merchant: "bg-vibe-blue/10 text-vibe-blue",
    scout: "bg-vibe-pink/20 text-vibe-pink",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "rounded-xl border p-6 transition-all duration-300",
        variants[variant],
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold font-heading tracking-tight">{value}</p>
          {change && (
            <p
              className={cn(
                "text-sm font-medium",
                change.isPositive ? "text-vibe-green" : "text-destructive"
              )}
            >
              {change.isPositive ? "+" : ""}
              {change.value}% from last week
            </p>
          )}
        </div>
        <div
          className={cn(
            "rounded-xl p-3",
            iconVariants[variant]
          )}
        >
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </motion.div>
  );
}
