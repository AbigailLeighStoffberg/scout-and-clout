import { motion } from "framer-motion";
import { MapPin, DollarSign, BarChart3, Apple, Play } from "lucide-react";
import dropSushi from "@/assets/drop-sushi.png";
import dropHotel from "@/assets/drop-hotel.png";
import dropBoutique from "@/assets/drop-boutique.png";

export function BentoGrid() {
  return (
    <section id="features" className="py-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <h2 className="font-heading text-3xl font-bold md:text-4xl mb-4">
            <span className="bg-gradient-to-r from-vibe-teal via-vibe-cyan to-vibe-pink bg-clip-text text-transparent">
              The Operating System for Local Culture.
            </span>
          </h2>
          <p className="mx-auto max-w-3xl text-slate-300 leading-relaxed">
            We break the cycle of "I don't know, where do you want to go?" VibeCheck turns your city into an urban RPG. 
            Users stop guessing and start exploring based on recommendations from the influencers they trust. By transforming 
            local spots into playable Quest Lines, we provide a clear Signal to follow, helping businesses get discovered 
            while creators grow their fanbase and earn from paid Gigs.
          </p>
        </motion.div>

        {/* Bento Grid Layout */}
        <div className="grid gap-4 md:grid-cols-2 max-w-5xl mx-auto">
          {/* Card 1: Large Left - The Discovery Engine */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            whileHover={{ scale: 1.02 }}
            className="md:row-span-2 rounded-3xl bg-slate-900 border border-white/10 p-8 relative overflow-hidden group"
          >
            {/* Decorative glow */}
            <div className="absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-vibe-cyan/20 blur-3xl group-hover:bg-vibe-cyan/30 transition-colors" />
            
            <div className="relative z-10 h-full flex flex-col">
              <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-vibe-cyan to-vibe-blue">
                <MapPin className="h-7 w-7 text-white" />
              </div>
              
              <h3 className="font-heading text-2xl font-bold text-white mb-3">
                The Discovery Engine
              </h3>
              <p className="text-white/60 mb-6">
                Discover hidden gems in your neighborhood, curated by local influencers who know the scene.
              </p>

              {/* Mock Map UI with Icons */}
              <div className="rounded-2xl bg-slate-800/80 border border-white/10 p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-3 w-3 rounded-full bg-vibe-green animate-pulse" />
                  <span className="text-sm text-white/80">3 drops nearby</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="aspect-square rounded-lg overflow-hidden">
                    <img src={dropSushi} alt="Sushi drop" className="w-full h-full object-cover" />
                  </div>
                  <div className="aspect-square rounded-lg overflow-hidden">
                    <img src={dropHotel} alt="Hotel drop" className="w-full h-full object-cover" />
                  </div>
                  <div className="aspect-square rounded-lg overflow-hidden">
                    <img src={dropBoutique} alt="Boutique drop" className="w-full h-full object-cover" />
                  </div>
                </div>
              </div>

              {/* App Store Buttons */}
              <div className="flex flex-wrap gap-3 mt-6">
                <motion.a
                  href="#"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20 transition-colors"
                >
                  <Apple className="h-5 w-5 text-white" />
                  <div className="text-left">
                    <p className="text-[10px] text-white/60 leading-none">Download on the</p>
                    <p className="text-sm font-semibold text-white leading-tight">App Store</p>
                  </div>
                </motion.a>
                <motion.a
                  href="#"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20 transition-colors"
                >
                  <Play className="h-5 w-5 text-white fill-white" />
                  <div className="text-left">
                    <p className="text-[10px] text-white/60 leading-none">Get it on</p>
                    <p className="text-sm font-semibold text-white leading-tight">Google Play</p>
                  </div>
                </motion.a>
              </div>
            </div>
          </motion.div>

          {/* Card 2: Small Top Right - Curate & Earn */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.02 }}
            className="rounded-3xl bg-gradient-to-br from-vibe-purple to-vibe-pink p-6 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
            
            <div className="relative z-10">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
              
              <h3 className="font-heading text-xl font-bold text-white mb-2">
                Curate & Earn
              </h3>
              <p className="text-white/80 text-sm mb-4">
                Influencers earn real commissions when their recommendations drive traffic.
              </p>

              {/* Mock Payout Notification */}
              <div className="rounded-xl bg-white/20 backdrop-blur-sm border border-white/20 p-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-white/30 flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-white/70">Commission Payout</p>
                    <p className="text-lg font-bold text-white">+$127.50</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Card 3: Small Bottom Right - Real-Time Insights */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.02 }}
            className="rounded-3xl bg-gradient-to-br from-[#1DAFA1] to-vibe-green p-6 relative overflow-hidden group"
          >
            <div className="absolute bottom-0 left-0 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
            
            <div className="relative z-10">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              
              <h3 className="font-heading text-xl font-bold text-white mb-2">
                Real-Time Insights
              </h3>
              <p className="text-white/80 text-sm mb-4">
                Partners track every scan, redemption, and ROI in real-time.
              </p>

              {/* Mini Chart with Labels */}
              <div className="space-y-2">
                <div className="flex items-end gap-1 h-12">
                  {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                    <motion.div
                      key={i}
                      initial={{ height: 0 }}
                      whileInView={{ height: `${h}%` }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.4 + i * 0.05 }}
                      className="flex-1 rounded-sm bg-white/40"
                    />
                  ))}
                </div>
                <div className="flex justify-between text-[10px] text-white/60 font-medium">
                  <span>ROI</span>
                  <span>Retention</span>
                  <span>Conversion</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
