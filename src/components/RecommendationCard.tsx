import { useCallback, useState } from "react";
import { ChevronDown, ShoppingBag, Sparkles } from "lucide-react";
import type { Recommendation } from "@/lib/utils";
import { cn, formatCurrency } from "@/lib/utils";
import { claudeKeyConfigured, useLazyClaudeText } from "@/lib/claude";
import { whyRecommendationPrompt } from "@/lib/prompts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCart, usePersona } from "@/store";

interface RecommendationCardProps {
  rec: Recommendation;
}

export function RecommendationCard({ rec }: RecommendationCardProps) {
  const { persona } = usePersona();
  const { addItem } = useCart();
  const [open, setOpen] = useState(false);
  const { product, reasons } = rec;

  const build = useCallback(
    () => whyRecommendationPrompt(persona, product, reasons),
    [persona, product, reasons]
  );

  const { text, loading, error, fire } = useLazyClaudeText(
    build,
    `why:${persona.id}:${product.id}`
  );

  const handleWhy = () => {
    const next = !open;
    setOpen(next);
    if (next && !text && claudeKeyConfigured) void fire();
  };

  return (
    <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-soft transition-shadow hover:shadow-lift">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <div className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
            {product.brand}
          </div>
          <div className="mt-0.5 text-sm font-semibold text-slate-900">
            {product.name}
          </div>
          <div className="mt-0.5 text-xs text-slate-500">
            {product.format}
          </div>
        </div>
        <Badge variant="outline" className="capitalize">
          {product.category}
        </Badge>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="text-base font-semibold text-slate-900">
          {formatCurrency(product.pricePerUnit)}
        </div>
        <button
          onClick={handleWhy}
          className={cn(
            "inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-xs font-medium transition-colors",
            open
              ? "border-primo-300 bg-primo-50 text-primo-700"
              : "border-slate-200 text-slate-600 hover:bg-slate-50"
          )}
        >
          <Sparkles className="h-3 w-3" />
          Why this?
          <ChevronDown
            className={cn(
              "h-3 w-3 transition-transform",
              open && "rotate-180"
            )}
          />
        </button>
      </div>

      {open && (
        <div className="mt-3 rounded-xl border border-primo-100 bg-primo-50/40 p-3 text-xs leading-relaxed text-slate-700">
          {!claudeKeyConfigured ? (
            <span className="text-coral-600">
              Add ANTHROPIC_API_KEY to .env.local to see live reasoning.
            </span>
          ) : loading ? (
            <div className="space-y-1.5">
              <div className="h-2 w-full rounded-full skeleton-shimmer" />
              <div className="h-2 w-3/4 rounded-full skeleton-shimmer" />
            </div>
          ) : error ? (
            <span className="text-coral-600">{error}</span>
          ) : (
            <>
              <span>{text}</span>
              <div className="mt-2 text-[10px] uppercase tracking-wider text-slate-400">
                Top signal · {reasons[0]}
              </div>
            </>
          )}
        </div>
      )}

      <Button
        size="sm"
        variant="default"
        className="mt-4 w-full gap-1.5"
        onClick={() => addItem(product.id)}
      >
        <ShoppingBag className="h-3.5 w-3.5" />
        Add to next delivery
      </Button>
    </div>
  );
}
