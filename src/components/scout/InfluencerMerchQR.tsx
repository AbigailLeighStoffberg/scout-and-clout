import { useState } from "react";
import { motion } from "framer-motion";
import { Download, Copy, Check, Shirt, Tag, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { toast } from "sonner";
import merchCafeLogo from "@/assets/merch-cafe-logo.png";
import merchBoutiqueLogo from "@/assets/merch-boutique-logo.png";
import merchBarLogo from "@/assets/merch-bar-logo.png";

const affiliatedPartners = [
  { id: 1, name: "Tasty Bites Cafe", logo: merchCafeLogo, commission: "8%", color: "from-orange-500 to-red-500" },
  { id: 2, name: "Urban Boutique", logo: merchBoutiqueLogo, commission: "12%", color: "from-pink-500 to-purple-500" },
  { id: 3, name: "The Rooftop Bar", logo: merchBarLogo, commission: "10%", color: "from-blue-500 to-cyan-500" },
];

export function InfluencerMerchQR() {
  const [selectedPartner, setSelectedPartner] = useState(affiliatedPartners[0]);
  const [copied, setCopied] = useState(false);

  const qrUrl = `https://vibecheck.app/r/alexrivera/${selectedPartner.name.toLowerCase().replace(/\s+/g, '-')}`;

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(qrUrl);
    setCopied(true);
    toast.success("Link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQR = () => {
    toast.success("QR code downloaded! Perfect for your merch 🎨");
  };

  return (
    <GlassCard className="overflow-hidden relative">
      {/* Decorative glow */}
      <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-[#A759D8]/20 blur-3xl pointer-events-none" />

      <div className="relative z-10">
        {/* Header + QR side by side */}
        <div className="flex flex-col lg:flex-row lg:items-stretch gap-6">
          {/* Left: Title + Partner Selection */}
          <div className="flex-1 min-w-0">
            {/* Title */}
            <div className="flex items-center gap-2 mb-4">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl shrink-0"
                style={{ background: "linear-gradient(135deg, #A759D8, #DB529F)" }}
              >
                <Shirt className="h-5 w-5 text-white" />
              </div>
              <div>
                <h4 className="font-heading font-semibold text-white">Merch QR Codes</h4>
                <p className="text-xs text-muted-foreground">Print on your merch for extra earnings</p>
              </div>
            </div>

            {/* Partner Selection */}
            <label className="text-xs text-slate-400 mb-2 block">Select Partner</label>
            <div className="space-y-2">
              {affiliatedPartners.map((partner) => (
                <motion.button
                  key={partner.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedPartner(partner)}
                  className={`w-full flex items-center justify-between rounded-xl p-3 transition-all ${
                    selectedPartner.id === partner.id
                      ? "bg-[#A759D8]/20 border border-[#A759D8]/40"
                      : "bg-slate-800/50 border border-slate-700 hover:border-slate-600"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img src={partner.logo} alt={partner.name} className="h-10 w-10 rounded-lg object-cover" />
                    <div className="text-left">
                      <p className="text-sm font-medium text-white">{partner.name}</p>
                      <p className="text-xs text-muted-foreground">Commission: {partner.commission}</p>
                    </div>
                  </div>
                  {selectedPartner.id === partner.id && <div className="h-2 w-2 rounded-full bg-[#18C5DC]" />}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Right: QR Code Display */}
          <div className="w-full lg:w-[260px] lg:shrink-0">
            <div className="rounded-2xl border border-slate-700 bg-slate-900/40 p-4 h-full flex flex-col justify-between">
              <div className="rounded-xl bg-white p-4 border border-slate-200/60 flex-1 flex items-center justify-center">
                <div className="relative w-full max-w-[180px] aspect-square">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(qrUrl)}`}
                    alt={`QR code for ${selectedPartner.name}`}
                    className="h-full w-full rounded-lg object-contain"
                    loading="lazy"
                  />
                  {/* Center logo */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="h-10 w-10 rounded-xl overflow-hidden shadow-lg ring-2 ring-white">
                      <img src={selectedPartner.logo} alt={selectedPartner.name} className="h-full w-full object-cover" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-auto pt-3 grid grid-cols-2 gap-2">
                <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full border-[#A759D8]/30 hover:border-[#A759D8] hover:bg-[#A759D8]/10 text-slate-300 text-xs px-2"
                    onClick={handleCopyLink}
                  >
                    {copied ? <Check className="mr-1 h-3 w-3" /> : <Copy className="mr-1 h-3 w-3" />}
                    {copied ? "Copied" : "Copy Link"}
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                  <Button
                    size="sm"
                    className="w-full text-white text-xs px-2"
                    style={{ background: "linear-gradient(to right, #A759D8, #DB529F)" }}
                    onClick={handleDownloadQR}
                  >
                    <Download className="mr-1 h-3 w-3" />
                    Download
                  </Button>
                </motion.div>
              </div>
            </div>
          </div>
        </div>

        {/* Print Ideas (compact horizontal scroll below) */}
        <div className="mt-6">
          <h5 className="text-sm font-medium text-[#18C5DC] flex items-center gap-2 mb-2">
            <Tag className="h-4 w-4" />
            Print Ideas
          </h5>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {["T-Shirts", "Caps", "Tote Bags", "Phone Cases", "Stickers", "Notebooks"].map((label) => (
              <div
                key={label}
                className="shrink-0 rounded-full bg-slate-800/50 px-3 py-2 border border-slate-700 text-xs text-slate-300"
              >
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </GlassCard>
  );
}