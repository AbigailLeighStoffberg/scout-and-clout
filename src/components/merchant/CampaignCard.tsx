import { motion } from "framer-motion";
import { 
  Eye, 
  Ticket, 
  DollarSign, 
  MoreHorizontal,
  Zap,
  Users,
  Calendar,
  CheckCircle,
  Clock
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type CampaignStatus = "live" | "scheduled" | "ended";
export type CampaignType = "drop" | "mission";

export interface CampaignData {
  id: string;
  title: string;
  status: CampaignStatus;
  type: CampaignType;
  thumbnail?: string;
  views: number;
  claims: number;
  spend: number;
  startDate?: string;
  endDate?: string;
}

interface CampaignCardProps {
  campaign: CampaignData;
  onEdit?: (id: string) => void;
  onViewAnalytics?: (id: string) => void;
  onEndCampaign?: (id: string) => void;
}

const statusConfig: Record<CampaignStatus, { label: string; color: string; icon: React.ElementType }> = {
  live: { 
    label: "Live", 
    color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    icon: CheckCircle
  },
  scheduled: { 
    label: "Scheduled", 
    color: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    icon: Clock
  },
  ended: { 
    label: "Ended", 
    color: "bg-gray-500/20 text-gray-400 border-gray-500/30",
    icon: Calendar
  },
};

const typeConfig: Record<CampaignType, { label: string; color: string; icon: React.ElementType }> = {
  drop: { 
    label: "Loot Drop", 
    color: "text-[#1DB09B]",
    icon: Zap
  },
  mission: { 
    label: "Influencer Mission", 
    color: "text-[#A759D8]",
    icon: Users
  },
};

export function CampaignCard({ campaign, onEdit, onViewAnalytics, onEndCampaign }: CampaignCardProps) {
  const status = statusConfig[campaign.status];
  const type = typeConfig[campaign.type];
  const StatusIcon = status.icon;
  const TypeIcon = type.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="group relative bg-[#1A1A1A] rounded-2xl border border-white/5 overflow-hidden transition-all duration-300 hover:border-[#1DB09B]/30 hover:shadow-[0_0_30px_rgba(29,176,155,0.15)]"
    >
      {/* Thumbnail */}
      <div className="relative h-32 bg-gradient-to-br from-[#0f1929] to-[#0a1220] overflow-hidden">
        {campaign.thumbnail ? (
          <img 
            src={campaign.thumbnail} 
            alt={campaign.title}
            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <TypeIcon className={cn("h-12 w-12 opacity-30", type.color)} />
          </div>
        )}
        
        {/* Status Badge - Top Right */}
        <div className="absolute top-3 right-3">
          <Badge className={cn("border", status.color)}>
            <StatusIcon className="h-3 w-3 mr-1" />
            {status.label}
          </Badge>
        </div>

        {/* Meatball Menu */}
        <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="h-8 w-8 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center hover:bg-black/80 transition-colors">
                <MoreHorizontal className="h-4 w-4 text-white" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="bg-[#1A1A1A] border-white/10">
              <DropdownMenuItem 
                onClick={() => onEdit?.(campaign.id)}
                className="text-gray-300 hover:text-white focus:text-white"
              >
                Edit Details
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onViewAnalytics?.(campaign.id)}
                className="text-gray-300 hover:text-white focus:text-white"
              >
                View Analytics
              </DropdownMenuItem>
              {campaign.status === "live" && (
                <DropdownMenuItem 
                  onClick={() => onEndCampaign?.(campaign.id)}
                  className="text-red-400 hover:text-red-300 focus:text-red-300"
                >
                  End Campaign
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="space-y-2">
          <h3 className="text-white font-semibold text-lg leading-tight line-clamp-1">
            {campaign.title}
          </h3>
          
          {/* Type Tag */}
          <div className={cn("flex items-center gap-1.5 text-sm font-medium", type.color)}>
            <TypeIcon className="h-4 w-4" />
            <span>{type.label}</span>
          </div>
        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/5">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-gray-400 mb-1">
              <Eye className="h-3.5 w-3.5" />
            </div>
            <p className="text-white font-semibold text-sm">{campaign.views.toLocaleString()}</p>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider">Views</p>
          </div>
          <div className="text-center border-x border-white/5">
            <div className="flex items-center justify-center gap-1 text-gray-400 mb-1">
              <Ticket className="h-3.5 w-3.5" />
            </div>
            <p className="text-white font-semibold text-sm">{campaign.claims.toLocaleString()}</p>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider">Claims</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-gray-400 mb-1">
              <DollarSign className="h-3.5 w-3.5" />
            </div>
            <p className="text-white font-semibold text-sm">${campaign.spend.toLocaleString()}</p>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider">Spend</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
