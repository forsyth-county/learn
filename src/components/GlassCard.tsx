"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
  glowColor?: "teal" | "cyan" | "emerald" | "blue";
  padding?: "none" | "sm" | "md" | "lg";
}

export function GlassCard({
  children,
  className,
  hover = true,
  glow = false,
  glowColor = "teal",
  padding = "md",
}: GlassCardProps) {
  const paddingClasses = {
    none: "",
    sm: "p-3",
    md: "p-5",
    lg: "p-8",
  };

  const glowClasses = {
    teal: "shadow-teal-500/5 hover:shadow-teal-500/10",
    cyan: "shadow-cyan-500/5 hover:shadow-cyan-500/10",
    emerald: "shadow-emerald-500/5 hover:shadow-emerald-500/10",
    blue: "shadow-blue-500/5 hover:shadow-blue-500/10",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      whileHover={hover ? { y: -1 } : undefined}
      className={cn(
        "relative rounded-xl border border-zinc-800 bg-zinc-900/80 backdrop-blur-lg overflow-hidden",
        hover && "transition-all duration-200 hover:border-zinc-700 hover:bg-zinc-900/90",
        glow && glowClasses[glowColor],
        paddingClasses[padding],
        className
      )}
    >
      {/* Subtle top highlight */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-zinc-700/50 to-transparent" />
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
  iconColor = "teal",
  className,
}: {
  title: string;
  value: string | number;
  icon?: React.ComponentType<{ className?: string }>;
  trend?: string;
  trendUp?: boolean;
  iconColor?: "teal" | "cyan" | "emerald" | "blue";
  className?: string;
}) {
  const iconColorClasses = {
    teal: "bg-teal-500/10 border-teal-500/20 text-teal-400",
    cyan: "bg-cyan-500/10 border-cyan-500/20 text-cyan-400",
    emerald: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
    blue: "bg-blue-500/10 border-blue-500/20 text-blue-400",
  };

  return (
    <GlassCard className={cn("p-5", className)} hover={false}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">
            {title}
          </p>
          <p className="text-2xl font-bold text-white">{value}</p>
          {trend && (
            <p className={cn(
              "text-xs mt-1 font-medium",
              trendUp ? "text-emerald-400" : "text-red-400"
            )}>
              {trendUp ? "↑" : "↓"} {trend}
            </p>
          )}
        </div>
        {Icon && (
          <div className={cn("p-2.5 rounded-lg border", iconColorClasses[iconColor])}>
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
    </GlassCard>
  );
}
