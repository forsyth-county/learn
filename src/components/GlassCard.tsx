"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
  glowColor?: string;
  padding?: "none" | "sm" | "md" | "lg";
}

export function GlassCard({
  children,
  className,
  hover = true,
  glow = false,
  glowColor = "indigo",
  padding = "md",
}: GlassCardProps) {
  const paddingClasses = {
    none: "",
    sm: "p-3",
    md: "p-5",
    lg: "p-8",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      whileHover={hover ? { y: -2, scale: 1.005 } : undefined}
      className={cn(
        "relative rounded-xl border border-white/[0.06] bg-[#0c0c10]/80 backdrop-blur-xl shadow-2xl overflow-hidden",
        hover && "transition-all duration-200 hover:border-white/[0.1] hover:bg-[#0e0e14]/90",
        glow && `shadow-${glowColor}-500/10 hover:shadow-${glowColor}-500/20`,
        paddingClasses[padding],
        className
      )}
    >
      {/* Subtle top highlight */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}

// Stat card variant for dashboard
export function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  trendUp,
  className,
}: {
  title: string;
  value: string | number;
  icon?: React.ComponentType<{ className?: string }>;
  trend?: string;
  trendUp?: boolean;
  className?: string;
}) {
  return (
    <GlassCard className={cn("p-5", className)} hover={false}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-white/40 uppercase tracking-wider mb-1">
            {title}
          </p>
          <p className="text-2xl font-bold text-white">{value}</p>
          {trend && (
            <p className={cn(
              "text-xs mt-1 font-medium",
              trendUp ? "text-emerald-400" : "text-rose-400"
            )}>
              {trendUp ? "↑" : "↓"} {trend}
            </p>
          )}
        </div>
        {Icon && (
          <div className="p-2.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
            <Icon className="h-5 w-5 text-indigo-400" />
          </div>
        )}
      </div>
    </GlassCard>
  );
}
