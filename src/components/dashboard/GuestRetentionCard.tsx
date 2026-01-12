import { motion } from "framer-motion";
import { Users, UserPlus, RefreshCw } from "lucide-react";
import { mockAnalytics } from "@/data/mockData";

export function GuestRetentionCard() {
  const { guestRetention } = mockAnalytics;
  const total = guestRetention.newGuests + guestRetention.returningGuests;
  const newPercent = (guestRetention.newGuests / total) * 100;
  const returningPercent = (guestRetention.returningGuests / total) * 100;

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-vibe-green/10">
          <Users className="h-5 w-5 text-vibe-green" />
        </div>
        <div>
          <h3 className="font-heading font-semibold">Guest Retention</h3>
          <p className="text-sm text-muted-foreground">New vs Returning</p>
        </div>
      </div>

      {/* Visual bar */}
      <div className="mb-6">
        <div className="flex h-4 rounded-full overflow-hidden bg-muted">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${returningPercent}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="bg-vibe-green h-full"
          />
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${newPercent}%` }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
            className="bg-vibe-blue h-full"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl bg-vibe-green/5 border border-vibe-green/10 p-4">
          <div className="flex items-center gap-2 mb-2">
            <RefreshCw className="h-4 w-4 text-vibe-green" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Returning</span>
          </div>
          <p className="text-2xl font-bold text-vibe-green">{guestRetention.returningGuests}</p>
          <p className="text-xs text-muted-foreground mt-1">{returningPercent.toFixed(1)}% of total</p>
        </div>
        <div className="rounded-xl bg-vibe-blue/5 border border-vibe-blue/10 p-4">
          <div className="flex items-center gap-2 mb-2">
            <UserPlus className="h-4 w-4 text-vibe-blue" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">New</span>
          </div>
          <p className="text-2xl font-bold text-vibe-blue">{guestRetention.newGuests}</p>
          <p className="text-xs text-muted-foreground mt-1">{newPercent.toFixed(1)}% of total</p>
        </div>
      </div>

      {/* Retention rate */}
      <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Retention Rate</span>
        <span className="text-lg font-bold text-vibe-green">{guestRetention.retentionRate}%</span>
      </div>
    </div>
  );
}
