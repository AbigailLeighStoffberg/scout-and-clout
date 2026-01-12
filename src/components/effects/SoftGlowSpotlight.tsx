import { useEffect } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export function SoftGlowSpotlight() {
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  const springConfig = { damping: 30, stiffness: 200, mass: 0.8 };
  const smoothX = useSpring(cursorX, springConfig);
  const smoothY = useSpring(cursorY, springConfig);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const handleMouseMove = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };

    document.addEventListener("mousemove", handleMouseMove);
    return () => document.removeEventListener("mousemove", handleMouseMove);
  }, [cursorX, cursorY]);

  if (typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches) {
    return null;
  }

  return (
    <motion.div
      className="fixed top-0 left-0 pointer-events-none z-[9998]"
      style={{
        x: smoothX,
        y: smoothY,
      }}
    >
      {/* Soft Glow Spotlight - radial gradient that creates ambient lighting */}
      <motion.div
        className="rounded-full"
        style={{
          width: 300,
          height: 300,
          x: -150,
          y: -150,
          background: "radial-gradient(circle, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.05) 30%, transparent 70%)",
          filter: "blur(20px)",
        }}
      />
    </motion.div>
  );
}
