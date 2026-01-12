import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { QrCode, Zap, Copy, Check, Loader2 } from "lucide-react"; 
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { api } from "@/services/api"; 
import { useAppStore } from "@/store/useAppStore"; 

const PARTNER_COLOR = "#1DB09B";

export function QRStationCyberpunk() {
  const { user } = useAppStore();
  const [scans, setScans] = useState(0); 
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  
  const qrUrl = "https://vibecheck.app/p/tasty-bites-cafe";

  useEffect(() => {
    const fetchData = async () => {
      const userId = (user as any)?.id || (user as any)?.user_id;
      if (userId) {
        try {
          const response = await api.getPartnerDashboard(String(userId));
          
          // FIX for the TypeScript error in your screenshot:
          // We cast data to 'any' so it knows 'today_scans' exists
          const scanCount = (response.data as any)?.today_scans;
          
          if (typeof scanCount === 'number') {
            setScans(scanCount);
          }
        } catch (error) {
          console.error("Error fetching QR stats:", error);
        }
      }
      setLoading(false);
    };
    fetchData();
  }, [user]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(qrUrl);
    setCopied(true);
    toast.success("Link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="relative rounded-2xl bg-[#0f1929] border border-[#1e3a5f]/30 h-full flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="relative rounded-2xl bg-[#0f1929] border border-[#1e3a5f]/30 overflow-hidden h-full flex flex-col"
    >
      {/* Visual Effects */}
      <div className="absolute top-0 left-0 w-16 h-1" style={{ background: `linear-gradient(to right, ${PARTNER_COLOR}, transparent)` }} />
      <div className="absolute top-0 left-0 h-16 w-1" style={{ background: `linear-gradient(to bottom, ${PARTNER_COLOR}, transparent)` }} />
      <div className="absolute bottom-0 right-0 w-16 h-1" style={{ background: `linear-gradient(to left, ${PARTNER_COLOR}, transparent)` }} />
      <div className="absolute bottom-0 right-0 h-16 w-1" style={{ background: `linear-gradient(to top, ${PARTNER_COLOR}, transparent)` }} />
      
      <div className="relative z-10 p-6 flex flex-col h-full">
        <div className="flex items-center gap-3 mb-4">
          <div className="relative">
            <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center" style={{ borderColor: `${PARTNER_COLOR}30`, borderWidth: 1 }}>
              <QrCode className="h-5 w-5" style={{ color: PARTNER_COLOR }} />
            </div>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white font-heading">QR Station</h3>
            <p className="text-xs text-slate-500 font-mono">TERMINAL v2.0</p>
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center py-2">
          <div className="relative mb-3">
            <div className="p-3 bg-white rounded-xl" style={{ boxShadow: `0 0 20px ${PARTNER_COLOR}30` }}>
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(qrUrl)}&bgcolor=ffffff&color=0f172a`}
                alt="Partner QR Code"
                className="w-[120px] h-[120px]"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 mb-1">
            <Zap className="h-3 w-3 animate-pulse" style={{ color: PARTNER_COLOR }} />
            <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">Scans Today</p>
          </div>
          
          {/* DYNAMIC SCANS from API */}
          <motion.p
            key={scans}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-2xl font-extrabold font-mono"
            style={{ color: PARTNER_COLOR }}
          >
            {scans.toLocaleString()}
          </motion.p>
          
          <div className="mt-2 flex gap-3 text-center">
            <div>
              <p className="text-sm font-bold text-white font-mono">+15%</p>
              <p className="text-[8px] text-slate-500 uppercase tracking-wider">vs yesterday</p>
            </div>
            <div className="w-px bg-slate-700" />
            <div>
              <p className="text-sm font-bold text-white font-mono">{Math.floor(scans * 0.8)}</p>
              <p className="text-[8px] text-slate-500 uppercase tracking-wider">unique</p>
            </div>
          </div>
        </div>

        <Button
          onClick={handleCopyLink}
          variant="outline"
          className="w-full rounded-xl bg-slate-800/50 hover:bg-slate-800 text-white font-mono text-sm"
          style={{ borderColor: `${PARTNER_COLOR}30` }}
          size="lg"
        >
          {copied ? (
            <><Check className="mr-2 h-4 w-4 text-green-400" /> COPIED!</>
          ) : (
            <><Copy className="mr-2 h-4 w-4" style={{ color: PARTNER_COLOR }} /> COPY QR LINK</>
          )}
        </Button>
      </div>
    </motion.div>
  );
}