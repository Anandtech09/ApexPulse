import React from "react";
import { cn } from "../../lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "danger" | "warning" | "info" | "secondary";
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ 
  children, 
  variant = "default", 
  className 
}) => {
  const styles = {
    default: "bg-slate-800 text-slate-200 border-slate-700/50",
    secondary: "bg-indigo-950/40 text-indigo-300 border-indigo-500/20",
    success: "bg-emerald-950/40 text-emerald-400 border-emerald-500/20",
    danger: "bg-rose-950/40 text-rose-400 border-rose-500/20",
    warning: "bg-amber-950/40 text-amber-400 border-amber-500/20",
    info: "bg-sky-950/40 text-sky-400 border-sky-500/20",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold border tracking-wide uppercase",
        styles[variant],
        className
      )}
    >
      {children}
    </span>
  );
};
