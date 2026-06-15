import { useMemo, useState } from "react";
import { CalendarClock, Check, Repeat, ShoppingBag, SkipForward } from "lucide-react";
import { useCart, usePersona, useToast } from "@/store";
import { buildReplenishPlan } from "@/lib/replenish";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function AutoReplenish() {
  const { persona } = usePersona();
  const { addItem, openCart } = useCart();
  const { toast } = useToast();

  const plan = useMemo(() => buildReplenishPlan(persona.id), [persona.id]);
  const [enabled, setEnabled] = useState(false);
  const [skipped, setSkipped] = useState(false);

  if (plan.items.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
        <h3 className="text-sm font-semibold text-slate-900">Auto-replenish</h3>
        <p className="mt-1 text-xs text-slate-500">
          Place a couple of orders and we'll learn your usual.
        </p>
      </div>
    );
  }

  const toggle = () => {
    setEnabled((on) => {
      const next = !on;
      if (next) {
        setSkipped(false);
        toast(`Auto-replenish on — your usual ships ${plan.cadence.label}.`, "success");
      } else {
        toast("Auto-replenish off — you're back to manual ordering.");
      }
      return next;
    });
  };

  const addUsual = () => {
    plan.items.forEach((it) => addItem(it.productId, it.quantity));
    openCart();
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-slate-500">
          <Repeat className="h-3.5 w-3.5" />
          Auto-replenish
        </div>
        <Badge variant={enabled ? "success" : "outline"}>
          {enabled ? "On" : "Off"}
        </Badge>
      </div>

      <div className="mt-3">
        <div className="text-base font-semibold text-slate-900">
          Your usual, on autopilot
        </div>
        <div className="text-xs text-slate-500">
          Ships {plan.cadence.label} · never run out, skip anytime
        </div>
      </div>

      {/* The usual basket */}
      <div className="mt-4 rounded-xl bg-slate-50 p-3">
        <ul className="space-y-1.5 text-xs text-slate-600">
          {plan.items.map((it) => (
            <li key={it.productId} className="flex items-center justify-between gap-2">
              <span className="truncate pr-2 text-slate-700">{it.name}</span>
              <span className="shrink-0 text-slate-400">×{it.quantity}</span>
            </li>
          ))}
        </ul>
        <div className="mt-2.5 flex items-center justify-between border-t border-slate-200 pt-2.5 text-xs">
          <span className="text-slate-500">Per delivery</span>
          <span className="font-semibold text-slate-800">
            {formatCurrency(plan.cycleTotal)}
          </span>
        </div>
      </div>

      {/* Next send */}
      {enabled && (
        <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-600">
          <CalendarClock className="h-3.5 w-3.5 text-slate-400" />
          {skipped ? (
            <span>
              This cycle skipped — resumes {plan.cadence.label} after.
            </span>
          ) : (
            <span>
              Next send:{" "}
              <span className="font-medium text-slate-800">{plan.nextDate}</span>
            </span>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="mt-4 flex flex-col gap-2">
        <Button variant={enabled ? "outline" : "default"} className="w-full gap-1.5" onClick={toggle}>
          {enabled ? (
            <>
              <Check className="h-4 w-4" />
              Auto-replenish is on
            </>
          ) : (
            <>
              <Repeat className="h-4 w-4" />
              Turn on auto-replenish
            </>
          )}
        </Button>

        <div className="flex gap-2">
          {enabled && (
            <Button
              variant="ghost"
              size="sm"
              className="flex-1 gap-1.5"
              disabled={skipped}
              onClick={() => {
                setSkipped(true);
                toast("Skipped this cycle — your next send moves out.");
              }}
            >
              <SkipForward className="h-3.5 w-3.5" />
              {skipped ? "Skipped" : "Skip next"}
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 gap-1.5"
            onClick={addUsual}
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            Add usual to cart
          </Button>
        </div>
      </div>
    </div>
  );
}
