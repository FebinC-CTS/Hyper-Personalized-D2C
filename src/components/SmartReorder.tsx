import { useCallback, useMemo } from "react";
import { Clock, ShoppingBag } from "lucide-react";
import { useCart, usePersona } from "@/store";
import { ordersByPersona, topProducts } from "@/data/orders";
import { getProduct } from "@/data/products";
import { claudeKeyConfigured, useClaudeText } from "@/lib/claude";
import { reorderNudgePrompt } from "@/lib/prompts";
import { daysAgo, formatCurrency } from "@/lib/utils";
import { AIResponse } from "@/components/AIResponse";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Picks the persona's most-frequent SKU and figures out their typical
// reorder cadence from the order history. In production this would be
// a forecast service; here it's just math on the mock data.
function useReorderSignal() {
  const { persona } = usePersona();

  return useMemo(() => {
    const top = topProducts(persona.id, 1)[0];
    if (!top) return null;
    const product = getProduct(top.productId);
    if (!product) return null;

    const ordersWithProduct = ordersByPersona(persona.id).filter((o) =>
      o.items.some((i) => i.productId === top.productId)
    );
    if (ordersWithProduct.length < 2) return null;

    const dates = ordersWithProduct.map((o) => new Date(o.date).getTime());
    dates.sort((a, b) => a - b);
    let totalGap = 0;
    for (let i = 1; i < dates.length; i++) totalGap += dates[i] - dates[i - 1];
    const cadenceDays = Math.round(
      totalGap / (dates.length - 1) / (1000 * 60 * 60 * 24)
    );

    const lastDate = ordersWithProduct
      .map((o) => o.date)
      .sort()
      .at(-1)!;
    const daysSince = daysAgo(lastDate);
    const dueIn = cadenceDays - daysSince;
    const status: "due" | "soon" | "overdue" =
      daysSince > cadenceDays + 7
        ? "overdue"
        : daysSince >= Math.floor(cadenceDays * 0.85)
        ? "due"
        : "soon";

    return { product, cadenceDays, daysSince, dueIn, status, persona };
  }, [persona]);
}

export function SmartReorder() {
  const signal = useReorderSignal();
  const { addItem, openCart } = useCart();

  const build = useCallback(() => {
    if (!signal) throw new Error("No reorder signal");
    return reorderNudgePrompt(
      signal.persona,
      signal.product.name,
      signal.daysSince,
      signal.cadenceDays
    );
  }, [signal]);

  const cacheKey = signal
    ? `reorder:${signal.persona.id}:${signal.product.id}:${signal.status}`
    : undefined;

  const { text, loading, error, refetch } = useClaudeText(build, {
    cacheKey,
    enabled: Boolean(signal) && claudeKeyConfigured,
  });

  if (!signal) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
        <h3 className="text-sm font-semibold text-slate-900">Smart reorder</h3>
        <p className="mt-1 text-xs text-slate-500">
          Need more order history to predict your next reorder.
        </p>
      </div>
    );
  }

  const statusBadge =
    signal.status === "overdue" ? (
      <Badge variant="warning">
        Overdue · {signal.daysSince - signal.cadenceDays}d past
      </Badge>
    ) : signal.status === "due" ? (
      <Badge variant="success">Due now</Badge>
    ) : (
      <Badge variant="outline">In {signal.dueIn}d</Badge>
    );

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-slate-500">
          <Clock className="h-3.5 w-3.5" />
          Smart reorder
        </div>
        {statusBadge}
      </div>

      <div className="mt-3">
        <div className="text-base font-semibold text-slate-900">
          {signal.product.name}
        </div>
        <div className="text-xs text-slate-500">{signal.product.format}</div>
      </div>

      <div className="mt-4">
        {!claudeKeyConfigured ? (
          <AIResponse
            error="Add ANTHROPIC_API_KEY to .env.local to enable AI nudges."
            badgeLabel="AI nudge"
            size="sm"
          />
        ) : (
          <AIResponse
            loading={loading}
            error={error}
            onRetry={refetch}
            badgeLabel="AI nudge"
            size="sm"
            skeletonLines={2}
          >
            <p className="leading-relaxed">{text}</p>
          </AIResponse>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
        <span>
          Cadence:{" "}
          <span className="font-medium text-slate-700">
            ~{signal.cadenceDays} days
          </span>
        </span>
        <span className="font-medium text-slate-700">
          {formatCurrency(signal.product.pricePerUnit)} / unit
        </span>
      </div>

      <Button
        variant="default"
        className="mt-4 w-full gap-1.5"
        onClick={() => {
          addItem(signal.product.id);
          openCart();
        }}
      >
        <ShoppingBag className="h-4 w-4" />
        Reorder now
      </Button>
    </div>
  );
}
