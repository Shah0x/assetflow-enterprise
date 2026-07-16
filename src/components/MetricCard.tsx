import { motion } from "motion/react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

export interface MetricCardProps {
  id?: string;
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: string | number;
    isPositive?: boolean;
    label?: string;
  };
  badge?: {
    text: string;
    variant: "success" | "warning" | "danger" | "info" | "neutral";
  };
  onClick?: () => void;
  className?: string;
  children?: ReactNode;
}

export function MetricCard({
  id,
  title,
  value,
  icon: Icon,
  description,
  trend,
  badge,
  onClick,
  className,
  children
}: MetricCardProps) {
  const isInteractive = typeof onClick === "function";

  const badgeStyles = {
    success: "bg-emerald-50 text-emerald-700 border-emerald-100",
    warning: "bg-amber-50 text-amber-700 border-amber-100",
    danger: "bg-rose-50 text-rose-700 border-rose-100",
    info: "bg-blue-50 text-blue-700 border-blue-100",
    neutral: "bg-zinc-50 text-zinc-600 border-zinc-100",
  };

  const CardWrapper = isInteractive ? motion.button : motion.div;

  return (
    <CardWrapper
      id={id}
      whileHover={isInteractive ? { y: -4, scale: 1.01 } : undefined}
      whileTap={isInteractive ? { scale: 0.98 } : undefined}
      onClick={onClick}
      className={cn(
        "bg-white rounded-[2rem] border border-zinc-100 p-6 shadow-sm text-left w-full transition-all duration-300",
        isInteractive && "cursor-pointer hover:shadow-xl hover:border-zinc-200/80 focus:outline-none focus:ring-2 focus:ring-orange-500/20",
        className
      )}
    >
      <div className="flex items-start justify-between mb-5">
        <span className="text-xs font-black uppercase tracking-widest text-zinc-400">
          {title}
        </span>
        <div className="flex items-center gap-2">
          {badge && (
            <span
              className={cn(
                "px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border",
                badgeStyles[badge.variant]
              )}
            >
              {badge.text}
            </span>
          )}
          <div className="w-10 h-10 rounded-xl bg-zinc-50 flex items-center justify-center border border-zinc-100/50">
            <Icon className="w-5 h-5 text-zinc-600" />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-4xl font-black text-zinc-900 tracking-tighter leading-none">
          {value}
        </h3>

        {(description || trend) && (
          <div className="flex items-center gap-2 pt-1 flex-wrap">
            {trend && (
              <span
                className={cn(
                  "text-[11px] font-black px-1.5 py-0.5 rounded-md flex items-center gap-0.5",
                  trend.isPositive
                    ? "text-emerald-700 bg-emerald-50"
                    : "text-rose-700 bg-rose-50"
                )}
              >
                {trend.value}
              </span>
            )}
            {description && (
              <span className="text-xs text-zinc-400 font-medium tracking-tight">
                {description}
              </span>
            )}
          </div>
        )}
      </div>

      {children && <div className="mt-5 pt-4 border-t border-zinc-50">{children}</div>}
    </CardWrapper>
  );
}
