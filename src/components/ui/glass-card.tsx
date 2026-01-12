import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  glow?: "pink" | "purple" | "cyan" | "none";
  hover?: boolean;
}

export function GlassCard({
  children,
  className,
  glow = "none",
  hover = true,
}: GlassCardProps) {
  const glowClasses = {
    pink: "hover:glow-pink",
    purple: "hover:glow-purple",
    cyan: "hover:glow-cyan",
    none: "",
  };

  return (
    <div
      className={cn(
        "glass-dark rounded-xl p-6 transition-all duration-300",
        hover && "hover:scale-[1.02] hover:bg-card/60",
        glowClasses[glow],
        className
      )}
    >
      {children}
    </div>
  );
}
