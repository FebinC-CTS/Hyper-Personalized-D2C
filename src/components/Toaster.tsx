import { CheckCircle2, Info, X, XCircle } from "lucide-react";
import { useToast } from "@/store";
import { cn } from "@/lib/utils";

export function Toaster() {
  const { toasts, dismiss } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed bottom-4 left-1/2 z-[60] flex w-full max-w-sm -translate-x-1/2 flex-col gap-2 px-4">
      {toasts.map((t) => {
        const Icon =
          t.tone === "success"
            ? CheckCircle2
            : t.tone === "error"
            ? XCircle
            : Info;
        return (
          <div
            key={t.id}
            className={cn(
              "pointer-events-auto flex items-center gap-2.5 rounded-xl border bg-white px-3.5 py-2.5 text-sm shadow-lift animate-[modalIn_0.2s_ease]",
              t.tone === "success"
                ? "border-aqua-500/30 text-slate-800"
                : t.tone === "error"
                ? "border-coral-500/30 text-slate-800"
                : "border-slate-200 text-slate-800"
            )}
          >
            <Icon
              className={cn(
                "h-4 w-4 shrink-0",
                t.tone === "success"
                  ? "text-aqua-600"
                  : t.tone === "error"
                  ? "text-coral-600"
                  : "text-primo-600"
              )}
            />
            <span className="flex-1">{t.message}</span>
            <button
              onClick={() => dismiss(t.id)}
              className="rounded p-0.5 text-slate-400 hover:text-slate-700"
              aria-label="Dismiss"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
