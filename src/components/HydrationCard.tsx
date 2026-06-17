import { useCallback, useMemo } from "react";
import { Droplets, Plus } from "lucide-react";
import { usePersona, useCart } from "@/store";
import { analyzeHydration } from "@/lib/hydration";
import { recommendProducts } from "@/lib/utils";
import { claudeKeyConfigured, useClaudeText } from "@/lib/claude";
import { hydrationPrompt } from "@/lib/prompts";
import { AIResponse } from "@/components/AIResponse";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

function Ring({ pct }: { pct: number }) {
  const r = 36;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - pct / 100);
  return (
    <svg width={88} height={88} viewBox="0 0 88 88" className="shrink-0">
      <circle cx={44} cy={44} r={r} fill="none" stroke="#e2e8f0" strokeWidth={8} />
      <circle
        cx={44}
        cy={44}
        r={r}
        fill="none"
        stroke="currentColor"
        className="text-aqua-500"
        strokeWidth={8}
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={offset}
        transform="rotate(-90 44 44)"
        style={{ transition: "stroke-dashoffset 0.6s ease" }}
      />
      <text
        x={44}
        y={44}
        textAnchor="middle"
        dominantBaseline="central"
        className="fill-slate-900"
        style={{ fontSize: 18, fontWeight: 700 }}
      >
        {pct}%
      </text>
    </svg>
  );
}

export function HydrationCard() {
  const { persona } = usePersona();
  const { addItem, openCart } = useCart();

  const h = useMemo(() => analyzeHydration(persona.id), [persona.id]);

  const recs = useMemo(() => recommendProducts(persona.id, 6), [persona.id]);
  const variety = useMemo(() => {
    const flavoured = recs.find(
      (r) => r.product.category === "flavored" || r.product.category === "sparkling"
    );
    return (flavoured ?? recs[0])?.product;
  }, [recs]);

  const build = useCallback(
    () =>
      hydrationPrompt(persona, {
        perPersonGlasses: h.perPersonGlasses,
        goal: h.goalPerPerson,
        people: h.people,
        pct: h.pct,
      }),
    [persona, h]
  );

  const { text, loading, error, refetch } = useClaudeText(build, {
    cacheKey: `hydration:${persona.id}`,
    enabled: claudeKeyConfigured,
  });

  const fallback = `You're getting about ${h.perPersonGlasses} of ${h.goalPerPerson} glasses a day per person from your Primo water. ${
    h.onTrack
      ? "Nice rhythm — keep it going."
      : "Keeping a bottle within reach makes the rest easy."
  }`;

  return (
    <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-aqua-500/5 to-white p-5 shadow-soft sm:p-6">
      <div className="flex items-center gap-2">
        <div className="grid h-8 w-8 place-items-center rounded-lg bg-aqua-500/10 text-aqua-600">
          <Droplets className="h-4 w-4" />
        </div>
        <span className="text-xs font-medium uppercase tracking-wider text-aqua-700">
          Hydration
        </span>
        <Badge variant={h.onTrack ? "success" : "outline"} className="ml-auto">
          {h.onTrack ? "On track" : "Keep it up"}
        </Badge>
      </div>

      <div className="mt-4 flex items-center gap-5">
        <Ring pct={h.pct} />
        <div>
          <div className="text-2xl font-semibold tracking-tight text-slate-900">
            ≈ {h.perPersonGlasses}
            <span className="text-base font-normal text-slate-500">
              {" "}
              / {h.goalPerPerson} glasses
            </span>
          </div>
          <div className="text-sm text-slate-500">per person, per day from Primo</div>
          <div className="mt-1 text-xs text-slate-400">
Group of {h.people} · ~{h.litersPerDay} L/day from your deliveries
          </div>
        </div>
      </div>

      <div className="mt-4 max-w-2xl">
        {!claudeKeyConfigured ? (
          <p className="text-sm leading-relaxed text-slate-600">{fallback}</p>
        ) : (
          <AIResponse
            loading={loading}
            error={error}
            onRetry={refetch}
            badgeLabel="AI wellness tip"
            size="sm"
            skeletonLines={2}
          >
            <p className="leading-relaxed">{text}</p>
          </AIResponse>
        )}
      </div>

      {variety && (
        <div className="mt-5">
          <Button
            variant="default"
            className="gap-1.5"
            onClick={() => {
              addItem(variety.id);
              openCart();
            }}
          >
            <Plus className="h-4 w-4" />
            Add {variety.name.split(" ").slice(0, 2).join(" ")} for variety
          </Button>
        </div>
      )}
    </div>
  );
}
