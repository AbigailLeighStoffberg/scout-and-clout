import { useState } from "react";
import { Settings, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useAppStore } from "@/store/useAppStore";

export function DashboardManager({ onUpdate }: { onUpdate: () => void }) {
  const { user } = useAppStore();
  const [scans, setScans] = useState("1247");
  const [revenue, setRevenue] = useState("5600");

  const handleManualUpdate = async () => {
    const userId = (user as any)?.id || (user as any)?.user_id || 1;
    
    // This is the manual data you are inputting
    const snapshot_data = {
      today_scans: Number(scans),
      top_influencers: [
        { id: 1, name: "Travel Tess", traffic: Number(scans), revenue: Number(revenue), sales: Math.floor(Number(revenue)/50), avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150" }
      ],
      chart_data: [
        { name: "Today", scans: Number(scans), revenue: Number(revenue) }
      ],
      traffic_sources: [{ name: "Direct", value: 100, fill: "#1DB09B" }]
    };

    try {
      const res = await fetch(`https://pdb1056.awardspace.net/4719155_vibecheck/api.php?action=update_dashboard`, {
        method: "POST",
        body: JSON.stringify({ user_id: userId, snapshot_data })
      });
      const data = await res.json();
      if (data.status === "success") {
        toast.success("Database Updated!");
        onUpdate();
      }
    } catch (e) {
      toast.error("Failed to update database");
    }
  };

  return (
    <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-4 mb-6">
      <div className="flex items-center gap-2 text-white font-bold">
        <Settings className="w-4 h-4" /> <h3>Manual Data Input</h3>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-slate-400">Total Scans</label>
          <Input value={scans} onChange={(e) => setScans(e.target.value)} className="bg-slate-800 border-slate-700 text-white" />
        </div>
        <div>
          <label className="text-xs text-slate-400">Total Revenue ($)</label>
          <Input value={revenue} onChange={(e) => setRevenue(e.target.value)} className="bg-slate-800 border-slate-700 text-white" />
        </div>
      </div>
      <Button onClick={handleManualUpdate} className="w-full bg-emerald-600 hover:bg-emerald-500">
        <Save className="w-4 h-4 mr-2" /> Save to Database
      </Button>
    </div>
  );
}