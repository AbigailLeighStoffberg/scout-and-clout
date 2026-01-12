import { motion } from "framer-motion";

interface SquaricleProps {
  size: number;
  x: string;
  y: string;
  delay?: number;
  theme: "influencer" | "partner";
  opacity?: number;
}

export function FloatingSquaricle({ size, x, y, delay = 0, theme, opacity = 0.45 }: SquaricleProps) {
  const gradientClass = theme === "influencer" ? "gradient-influencer" : "gradient-partner";
  
  return (
    <motion.div
      className={`absolute rounded-[30%] ${gradientClass}`}
      style={{
        width: size,
        height: size,
        left: x,
        top: y,
        opacity,
      }}
      animate={{
        y: [0, -40, -80, -30, 0],
        x: [0, 10, -5, 8, 0],
        rotate: [0, 8, -5, 3, 0],
        scale: [1, 1.08, 0.92, 1.04, 1],
      }}
      transition={{
        duration: 10 + Math.random() * 6,
        repeat: Infinity,
        ease: "easeInOut",
        delay,
      }}
    />
  );
}

export function FloatingSquaricles({ theme }: { theme: "influencer" | "partner" }) {
  // 15 shapes with high opacity (40-50%) for maximum visibility
  const squaricles = [
    { size: 140, x: "5%", y: "10%", delay: 0, opacity: 0.5 },
    { size: 90, x: "80%", y: "8%", delay: 1.5, opacity: 0.45 },
    { size: 70, x: "15%", y: "60%", delay: 3, opacity: 0.48 },
    { size: 120, x: "75%", y: "55%", delay: 0.8, opacity: 0.42 },
    { size: 55, x: "45%", y: "25%", delay: 2.2, opacity: 0.5 },
    { size: 85, x: "25%", y: "80%", delay: 4.5, opacity: 0.45 },
    { size: 100, x: "60%", y: "75%", delay: 1.8, opacity: 0.48 },
    { size: 65, x: "90%", y: "35%", delay: 3.5, opacity: 0.42 },
    { size: 110, x: "35%", y: "45%", delay: 2.8, opacity: 0.4 },
    { size: 50, x: "8%", y: "40%", delay: 5, opacity: 0.5 },
    { size: 75, x: "55%", y: "5%", delay: 1.2, opacity: 0.45 },
    { size: 95, x: "70%", y: "90%", delay: 4, opacity: 0.48 },
    { size: 60, x: "40%", y: "70%", delay: 2.5, opacity: 0.42 },
    { size: 80, x: "20%", y: "25%", delay: 3.8, opacity: 0.45 },
    { size: 45, x: "85%", y: "65%", delay: 0.5, opacity: 0.5 },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {squaricles.map((sq, index) => (
        <FloatingSquaricle key={index} {...sq} theme={theme} />
      ))}
    </div>
  );
}