import type { ReactNode } from "react";
import { AlertCircle, RotateCw, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface AIResponseProps {
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  children?: ReactNode;
  className?: string;
  badgeLabel?: string;
  size?: "sm" | "md" | "lg";
  skeletonLines?: number;
}

// Wraps any Claude-generated text. Three states (loading, error, content)
// plus a small ✨ badge so judges immediately recognize AI-generated copy.
// Intentionally low-key visually — the AI signal is the badge, not the
// surface.
export function AIResponse({
  loading,
  error,
  onRetry,
  children,
  className,
  badgeLabel = "AI",
  size = "md",
  skeletonLines = 2,
}: AIResponseProps) {
  const textSize =
    size === "sm" ? "text-sm" : size === "lg" ? "text-lg" : "text-base";

  return (
    <div className={cn("space-y-2", className)}>
      <span className="inline-flex items-center gap-1 rounded-full bg-primo-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primo-700">
        <Sparkles className="h-3 w-3" />
        {badgeLabel}
      </span>

      {loading && <Skeleton lines={skeletonLines} />}

      {error && !loading && (
        <div className="flex items-start gap-2 rounded-xl border border-coral-500/20 bg-coral-500/5 p-3 text-sm text-coral-600">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <div className="flex-1">
            <div className="font-medium">Couldn't generate this</div>
            <div className="mt-0.5 text-xs text-coral-600/80">{error}</div>
            {onRetry && (
              <button
                onClick={onRetry}
                className="mt-2 inline-flex items-center gap-1 rounded-lg bg-white px-2 py-1 text-xs font-medium text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
              >
                <RotateCw className="h-3 w-3" />
                Retry
              </button>
            )}
          </div>
        </div>
      )}

      {!loading && !error && children && (
        <div className={cn("text-slate-700", textSize)}>{children}</div>
      )}
    </div>
  );
}

function Skeleton({ lines }: { lines: number }) {
  return (
    <div className="space-y-1.5">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "h-3 rounded-full skeleton-shimmer",
            i === lines - 1 ? "w-2/3" : "w-full"
          )}
        />
      ))}
    </div>
  );
}
