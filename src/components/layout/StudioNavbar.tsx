import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function StudioNavbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, type: "spring", bounce: 0.3 }}
        className="h-16 bg-slate-950/80 backdrop-blur-xl px-6 flex items-center justify-between"
      >
        {/* Logo - Left */}
        <Link to="/" className="flex items-center gap-2">
          <motion.div
            whileHover={{ scale: 1.05, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            className="flex h-9 w-9 items-center justify-center rounded-xl gradient-vibe"
          >
            <Sparkles className="h-5 w-5 text-white" />
          </motion.div>
          <div className="flex items-center gap-1.5">
            <span className="font-heading font-bold text-xl text-white">VibeCheck</span>
            <span className="text-xs font-bold text-white/70 uppercase tracking-wider">STUDIO</span>
          </div>
        </Link>

        {/* Right side: Links */}
        <div className="flex items-center gap-4">

          <Link to="/auth">
            <Button variant="ghost" size="sm" className="text-white/70 hover:text-white hover:bg-white/10">
              Login
            </Button>
          </Link>
          <Link to="/auth?mode=signup">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="vibe" size="sm">Get Started</Button>
            </motion.div>
          </Link>
        </div>
      </motion.div>
    </nav>
  );
}
