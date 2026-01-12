import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Gift,
  Trophy,
  ArrowRight,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StudioNavbar } from "@/components/layout/StudioNavbar";
import { StudioFooter } from "@/components/layout/StudioFooter";
import { BentoGrid } from "@/components/landing/BentoGrid";

const stats = [
  { value: "50K+", label: "Active Users" },
  { value: "2,500+", label: "Local Partners" },
  { value: "$2M+", label: "Savings Claimed" },
  { value: "15K+", label: "Daily Drops" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-hidden relative bg-slate-950">
      {/* Video Background */}
      <div className="fixed inset-0 -z-10">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover opacity-60"
        >
          <source src="https://files.catbox.moe/ia0ipi.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/50 via-transparent to-slate-950" />
      </div>

      {/* Dark Charcoal Navbar */}
      <StudioNavbar />

      {/* Hero Section - Full Width Glass Band */}
      <section className="relative min-h-screen flex items-center pt-16">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="w-full bg-slate-900/70 backdrop-blur-xl border-y border-white/10"
        >
          <div className="container mx-auto px-4 py-16 md:py-24">
            <div className="max-w-4xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm px-4 py-2 text-sm font-medium text-white/70"
              >
                <Zap className="h-4 w-4 text-vibe-pink" />
                <span>The Future of Local Discovery</span>
              </motion.div>

              <h1 className="mb-6 font-heading text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white">
                Transform{" "}
                <span className="text-gradient-partner">Local Visits</span>
                <br />
                Into{" "}
                <span className="text-gradient-influencer">Lasting Loyalty</span>
              </h1>

              <p className="text-lg text-white/70 mb-10 max-w-2xl mx-auto">
                The ecosystem where businesses gain actionable insights and influencers drive real-world impact.
              </p>

              {/* Dual value props */}
              <div className="grid md:grid-cols-2 gap-6 mb-10 max-w-3xl mx-auto">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  className="p-4 rounded-2xl bg-vibe-teal/10 border border-vibe-teal/20 text-left"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Gift className="h-5 w-5 text-vibe-teal" />
                    <span className="font-semibold text-white">For Partners</span>
                  </div>
                  <p className="text-sm text-white/60">
                    Get discovered and track real ROI. Turn walk-ins into loyal fans.
                  </p>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                  className="p-4 rounded-2xl bg-vibe-purple/10 border border-vibe-purple/20 text-left"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Trophy className="h-5 w-5 text-vibe-purple" />
                    <span className="font-semibold text-white">For Influencers</span>
                  </div>
                  <p className="text-sm text-white/60">
                    Curate the city. Earn commissions and help local gems go viral.
                  </p>
                </motion.div>
              </div>

              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link to="/auth?role=merchant">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button variant="partner" size="xl">
                      <Gift className="mr-2 h-5 w-5" />
                      I'm a Partner
                    </Button>
                  </motion.div>
                </Link>
                <Link to="/auth?role=curator">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button variant="influencer" size="xl">
                      <Trophy className="mr-2 h-5 w-5" />
                      I'm an Influencer
                    </Button>
                  </motion.div>
                </Link>
              </div>

              {/* Stats inline */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.7 }}
                className="mt-12 grid grid-cols-2 gap-6 md:grid-cols-4"
              >
                {stats.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 + index * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                    className="text-center"
                  >
                    <p className="text-3xl font-bold font-heading text-white md:text-4xl">
                      {stat.value}
                    </p>
                    <p className="mt-1 text-sm text-white/50">{stat.label}</p>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Bento Grid Features Section */}
      <BentoGrid />

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid gap-4 md:grid-cols-2 max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="md:col-span-2 relative overflow-hidden rounded-3xl gradient-vibe p-12 text-center text-white md:p-20 shadow-2xl"
            >
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxjaXJjbGUgY3g9IjIwIiBjeT0iMjAiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIvPjwvZz48L3N2Zz4=')] opacity-50" />
              
              <div className="relative z-10">
                <h2 className="mb-4 font-heading text-3xl font-bold md:text-5xl">
                  Ready to Level Up Your Local Game?
                </h2>
                <p className="mx-auto mb-8 max-w-2xl text-lg text-white/80">
                  Join thousands of partners and influencers already transforming local discovery
                </p>
                <Link to="/auth">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="inline-block">
                    <Button
                      size="xl"
                      className="bg-white text-vibe-pink hover:bg-white/90 hover:text-vibe-purple shadow-xl"
                    >
                      Start Your Journey
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </motion.div>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Dark Charcoal Footer */}
      <StudioFooter />
    </div>
  );
}
