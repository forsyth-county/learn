"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
  glowColor?: string;
}

export function GlassCard({
  children,
  className,
  hover = true,
  glow = false,
  glowColor = "blue",
}: GlassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      whileHover={hover ? { y: -4, scale: 1.01 } : undefined}
      className={cn(
        "relative rounded-3xl border border-white/10 bg-white/5 backdrop-blur-2xl shadow-xl overflow-hidden",
        hover && "transition-shadow duration-300 hover:shadow-2xl hover:border-white/20",
        glow && `shadow-${glowColor}-500/20 hover:shadow-${glowColor}-500/30`,
        className
      )}
    >
      {/* Inner glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}
