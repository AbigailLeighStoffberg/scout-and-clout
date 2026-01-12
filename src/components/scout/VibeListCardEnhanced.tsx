import { motion } from "framer-motion";
import { Eye, Heart, Bookmark, ArrowUpRight, Sparkles, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface VibeListCardEnhancedProps {
  vibeList: {
    id: string;
    title: string;
    description: string;
    theme: string;
    followers: number;
    views: number;
    saves: number;
    proTip?: string;
  };
  coverImage?: string;
  isTrending?: boolean;
}

const themeCoverImages: Record<string, string> = {
  foodie: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80",
  romantic: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80",
  adventure: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=600&q=80",
  nightlife: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&q=80",
};

export function VibeListCardEnhanced({ 
  vibeList, 
  coverImage,
  isTrending = false 
}: VibeListCardEnhancedProps) {
  const image = coverImage || themeCoverImages[vibeList.theme] || themeCoverImages.foodie;

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      transition={{ duration: 0.2 }}
      className="group cursor-pointer h-full"
    >
      <div className="relative overflow-hidden rounded-2xl bg-card/40 backdrop-blur-2xl border border-white/10 h-full flex flex-col">
        {/* Banner Image - Fixed Height */}
        <div className="relative h-36 overflow-hidden flex-shrink-0">
          <img
            src={image}
            alt={vibeList.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
          
          {/* Badges */}
          <div className="absolute top-3 right-3 flex flex-col gap-2">
            {isTrending && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold text-white shadow-lg"
                style={{ background: "linear-gradient(to right, #A759D8, #DB529F)" }}
              >
                <TrendingUp className="h-3 w-3" />
                Trending
              </motion.div>
            )}
            {vibeList.proTip && (
              <div className="flex items-center gap-1 rounded-full bg-[#A759D8]/90 px-2.5 py-1 text-xs font-semibold text-white shadow-lg backdrop-blur-sm">
                <Sparkles className="h-3 w-3" />
                Pro Tip
              </div>
            )}
          </div>
        </div>

        {/* Dark Glass Details - Flex grow to fill remaining space */}
        <div className="relative p-4 glass-dark flex-1 flex flex-col">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="font-heading font-semibold text-lg text-foreground group-hover:text-[#18C5DC] transition-colors">
                {vibeList.title}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                {vibeList.description}
              </p>
            </div>
            <ArrowUpRight className="h-5 w-5 text-muted-foreground group-hover:text-[#18C5DC] transition-colors flex-shrink-0 ml-2" />
          </div>

          <div className="flex items-center gap-4 text-sm mt-auto">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Eye className="h-4 w-4" />
              <span>{vibeList.views.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Heart className="h-4 w-4" />
              <span>{vibeList.followers.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Bookmark className="h-4 w-4" />
              <span>{vibeList.saves}</span>
            </div>
            <div className="ml-auto">
              <span className="text-xs font-medium text-[#18C5DC]">
                +{Math.floor(vibeList.views * 0.1)} Impact
              </span>
            </div>
          </div>

          {vibeList.proTip && (
            <div className="mt-3 rounded-xl bg-[#A759D8]/10 border border-[#A759D8]/20 p-3">
              <p className="text-xs text-[#18C5DC]">{vibeList.proTip}</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}