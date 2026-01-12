import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, Clock, Trophy, Loader2, AlertCircle } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { api, type QuestData } from '@/services/api';
import { cn } from '@/lib/utils';

// Demo fallback quests
const demoQuests: QuestData[] = [
  {
    id: 'demo-quest-1',
    merchant_id: 'demo-merchant-1',
    merchant_name: 'Athens Coffee House',
    title: 'Create a Reel at Omonia',
    description: 'Film a 30-second reel showcasing our signature Greek frappe. Tag us and use #OmoniaCoffee',
    impact_reward: 500,
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'available',
    category: 'eat',
  },
  {
    id: 'demo-quest-2',
    merchant_id: 'demo-merchant-2',
    merchant_name: 'Monastiraki Market',
    title: 'Shopping Haul Video',
    description: 'Create a TikTok showing your favorite finds at the flea market. Minimum 2 items featured.',
    impact_reward: 750,
    deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'available',
    category: 'shop',
  },
  {
    id: 'demo-quest-3',
    merchant_id: 'demo-merchant-3',
    merchant_name: 'Plaka Tours',
    title: 'Walking Tour Story',
    description: 'Share your experience on Instagram Stories (minimum 5 stories) featuring the Acropolis views.',
    impact_reward: 1000,
    deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'available',
    category: 'play',
  },
];

const categoryColors: Record<string, string> = {
  eat: 'border-[#18C5DC]/30 bg-[#18C5DC]/10',
  shop: 'border-[#A759D8]/30 bg-[#A759D8]/10',
  play: 'border-[#DB529F]/30 bg-[#DB529F]/10',
  stay: 'border-[#1DB09B]/30 bg-[#1DB09B]/10',
};

const statusColors: Record<string, string> = {
  available: 'text-[#18C5DC]',
  accepted: 'text-[#DB529F]',
  completed: 'text-[#1DB09B]',
  expired: 'text-muted-foreground',
};

interface QuestBoardProps {
  className?: string;
}

export function QuestBoard({ className }: QuestBoardProps) {
  const [quests, setQuests] = useState<QuestData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchQuests() {
      setLoading(true);
      setError(null);
      try {
        const response = await api.getQuests();
        if (response.success && response.data && response.data.length > 0) {
          setQuests(response.data);
        } else {
          // Fallback to demo data
          console.log('Using demo quests - API returned empty or failed');
          setQuests(demoQuests);
        }
      } catch (err) {
        console.error('Failed to fetch quests:', err);
        setQuests(demoQuests);
        setError('Using demo data - could not connect to server');
      } finally {
        setLoading(false);
      }
    }

    fetchQuests();
  }, []);

  const formatDeadline = (dateStr: string) => {
    const deadline = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) return 'Expired';
    if (diffDays === 1) return '1 day left';
    if (diffDays < 7) return `${diffDays} days left`;
    return `${Math.ceil(diffDays / 7)} weeks left`;
  };

  if (loading) {
    return (
      <GlassCard className={className}>
        <div className="flex items-center gap-2 mb-4">
          <Zap className="h-5 w-5 text-[#18C5DC]" />
          <h3 className="font-heading font-semibold">Active Signals</h3>
        </div>
        <div className="h-48 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#18C5DC]" />
        </div>
      </GlassCard>
    );
  }

  if (quests.length === 0) {
    return (
      <GlassCard className={className}>
        <div className="flex items-center gap-2 mb-4">
          <Zap className="h-5 w-5 text-[#18C5DC]" />
          <h3 className="font-heading font-semibold">Active Signals</h3>
        </div>
        <div className="h-48 flex flex-col items-center justify-center text-center">
          <AlertCircle className="h-10 w-10 text-muted-foreground mb-3" />
          <p className="text-muted-foreground">No Active Signals</p>
          <p className="text-sm text-muted-foreground mt-1">
            Check back later for new quests from partners
          </p>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className={className}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-[#18C5DC] animate-pulse" />
          <h3 className="font-heading font-semibold">Active Signals</h3>
        </div>
        <span className="text-xs text-muted-foreground">
          {quests.filter(q => q.status === 'available').length} available
        </span>
      </div>

      {error && (
        <div className="mb-4 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
          <p className="text-xs text-amber-400">{error}</p>
        </div>
      )}

      <div className="space-y-3">
        {quests.map((quest, index) => (
          <motion.div
            key={quest.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            className={cn(
              'p-4 rounded-xl border transition-all cursor-pointer',
              categoryColors[quest.category]
            )}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <span className="text-xs text-muted-foreground uppercase tracking-wider">
                  {quest.merchant_name}
                </span>
                <h4 className="font-semibold text-white mt-0.5">{quest.title}</h4>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 text-[#18C5DC]">
                  <Trophy className="h-4 w-4" />
                  <span className="font-bold">+{quest.impact_reward}</span>
                </div>
                <span className="text-xs text-muted-foreground">points</span>
              </div>
            </div>

            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {quest.description}
            </p>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                <span>{formatDeadline(quest.deadline)}</span>
              </div>
              
              <Button
                variant="scout"
                size="sm"
                disabled={quest.status !== 'available'}
                className="text-xs"
              >
                {quest.status === 'available' 
                  ? 'Accept' 
                  : quest.status === 'accepted' 
                    ? 'In Progress' 
                    : quest.status}
              </Button>
            </div>

            {quest.status !== 'available' && (
              <div className="mt-2 pt-2 border-t border-slate-700/50">
                <span className={cn('text-xs font-medium capitalize', statusColors[quest.status])}>
                  {quest.status}
                </span>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </GlassCard>
  );
}
