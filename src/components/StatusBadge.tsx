import * as React from "react";
import { cn } from "@/lib/utils";

export interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const normalizedStatus = (status || "").trim();

  // Mapping different formats of states (backwards-compatible & requested ones)
  const configMap: Record<string, { bg: string; text: string; label: string; dot: string }> = {
    "Available": {
      bg: "bg-emerald-50 text-emerald-700 border-emerald-100/70",
      dot: "bg-emerald-500 animate-pulse",
      label: "Available",
      text: "text-emerald-700",
    },
    "Active": {
      bg: "bg-emerald-50 text-emerald-700 border-emerald-100/70",
      dot: "bg-emerald-500 animate-pulse",
      label: "Active",
      text: "text-emerald-700",
    },
    "Assigned": {
      bg: "bg-blue-50 text-blue-700 border-blue-100/70",
      dot: "bg-blue-500",
      label: "Deployed",
      text: "text-blue-700",
    },
    "Deployed": {
      bg: "bg-blue-50 text-blue-700 border-blue-100/70",
      dot: "bg-blue-500",
      label: "Deployed",
      text: "text-blue-700",
    },
    "Maintenance": {
      bg: "bg-amber-50 text-amber-700 border-amber-100/70",
      dot: "bg-amber-500",
      label: "Maintenance",
      text: "text-amber-700",
    },
    "In Maintenance": {
      bg: "bg-amber-50 text-amber-700 border-amber-100/70",
      dot: "bg-amber-500",
      label: "In Maintenance",
      text: "text-amber-700",
    },
    "Retired": {
      bg: "bg-zinc-100/80 text-zinc-600 border-zinc-200/60",
      dot: "bg-zinc-400",
      label: "Retired",
      text: "text-zinc-600",
    },
    "Defective": {
      bg: "bg-rose-50 text-rose-700 border-rose-100/70",
      dot: "bg-rose-500 animate-ping [animation-duration:3s]",
      label: "Defective",
      text: "text-rose-700",
    },
  };

  const currentConfig = configMap[normalizedStatus] || {
    bg: "bg-zinc-50 text-zinc-600 border-zinc-100",
    dot: "bg-zinc-400",
    label: normalizedStatus,
    text: "text-zinc-600",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-black uppercase tracking-widest border rounded-lg select-none",
        currentConfig.bg,
        className
      )}
    >
      <span className="relative flex h-1.5 w-1.5">
        <span className={cn("absolute inline-flex h-full w-full rounded-full opacity-75", currentConfig.dot)}></span>
        <span className={cn("relative inline-flex rounded-full h-1.5 w-1.5", currentConfig.dot.split(" ")[0])}></span>
      </span>
      <span className={cn("font-bold tracking-wider", currentConfig.text)}>
        {currentConfig.label}
      </span>
    </span>
  );
}
