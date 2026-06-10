import * as React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "outline" | "ai" | "warning" | "success";
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const styles = {
    default: "bg-slate-100 text-slate-700",
    outline: "border border-slate-200 text-slate-600",
    ai: "bg-ai-gradient bg-[length:200%_200%] animate-ai-pulse text-white",
    warning: "bg-coral-500/10 text-coral-600 border border-coral-500/20",
    success: "bg-aqua-500/10 text-aqua-600 border border-aqua-500/20",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
        styles[variant],
        className
      )}
      {...props}
    />
  );
}
