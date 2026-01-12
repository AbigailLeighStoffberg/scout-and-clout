import { useEffect, useState } from "react";
import { motion, useSpring, useMotionValue } from "framer-motion";

export function CursorFollow() {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  
  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);
  
  const springConfig = { damping: 25, stiffness: 400 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      setIsVisible(true);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    const handleMouseEnter = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isClickable = target.closest("button, a, [role='button'], input, textarea, select, [data-clickable]");
      setIsHovering(!!isClickable);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseover", handleMouseEnter);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseover", handleMouseEnter);
    };
  }, [cursorX, cursorY]);

  // Don't show on mobile/touch devices
  if (typeof window !== "undefined" && "ontouchstart" in window) {
    return null;
  }

  return (
    <motion.div
      className="pointer-events-none fixed inset-0 z-[9999] hidden md:block"
      style={{ opacity: isVisible ? 1 : 0 }}
    >
      {/* Outer ring */}
      <motion.div
        className="absolute rounded-full border-2 border-vibe-pink/50"
        style={{
          x: cursorXSpring,
          y: cursorYSpring,
          width: isHovering ? 48 : 32,
          height: isHovering ? 48 : 32,
          translateX: isHovering ? -24 : -16,
          translateY: isHovering ? -24 : -16,
        }}
        animate={{
          scale: isHovering ? 1.2 : 1,
          borderColor: isHovering ? "hsl(330, 81%, 60%)" : "hsla(330, 81%, 60%, 0.5)",
        }}
        transition={{ duration: 0.2 }}
      />
      {/* Inner dot */}
      <motion.div
        className="absolute h-2 w-2 rounded-full bg-vibe-pink"
        style={{
          x: cursorXSpring,
          y: cursorYSpring,
          translateX: -4,
          translateY: -4,
        }}
        animate={{
          scale: isHovering ? 0 : 1,
        }}
        transition={{ duration: 0.15 }}
      />
    </motion.div>
  );
}
