import { CheckCircle2, Clock, MapPin, Package, Truck } from "lucide-react";
import { useCart, usePersona } from "@/store";
import { lastOrder } from "@/data/orders";
import { getProduct } from "@/data/products";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

// Demo timeline anchor (matches utils.daysAgo) so the delivery date is
// consistent with the rest of the mock data.
const ANCHOR = new Date("2026-05-15T00:00:00");
const addDays = (d: Date, n: number) => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};

const CATEGORY_DOT: Record<string, string> = {
  still: "bg-sky-400",
  sparkling: "bg-aqua-500",
  flavored: "bg-coral-500",
  premium: "bg-primo-500",
};

// A light, non-real-time fulfilment stage for visual interest.
function fulfilmentStage(daysAway: number | null) {
  if (daysAway === null) return { label: "Scheduled", pct: 28 };
  if (daysAway <= 0) return { label: "Out for delivery", pct: 96 };
  if (daysAway === 1) return { label: "Ready to ship", pct: 76 };
  if (daysAway === 2) return { label: "Packing your order", pct: 52 };
  return { label: "Scheduled", pct: 28 };
}

export function UpcomingDelivery() {
  const { persona } = usePersona();
  const { lastPlaced } = useCart();

  const upcoming = lastPlaced ?? lastOrder(persona.id);
  const daysAway = lastPlaced ? null : persona.nextDeliveryInDays;
  const hasUpcoming = lastPlaced !== null || persona.nextDeliveryInDays !== null;

  // Headline + countdown content
  let heading = "Friday delivery window";
  if (lastPlaced) heading = "Arriving this Friday";
  else if (daysAway !== null) {
    if (daysAway <= 0) heading = "Arriving today";
    else
      heading = addDays(ANCHOR, daysAway).toLocaleDateString("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
      });
  }

  const stage = fulfilmentStage(daysAway);

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft">
      {/* Header strip */}
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
        <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-slate-500">
          <Truck className="h-3.5 w-3.5" />
          Next delivery
        </div>
        {lastPlaced ? (
          <Badge variant="success">Confirmed</Badge>
        ) : persona.nextDeliveryInDays !== null ? (
          <Badge variant="success">On schedule</Badge>
        ) : (
          <Badge variant="warning">None scheduled</Badge>
        )}
      </div>

      {hasUpcoming ? (
        <div className="p-5">
          {/* Hero: countdown + date */}
          <div className="flex items-center gap-4">
            <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-primo-50 text-primo-700">
              {daysAway === null ? (
                <CheckCircle2 className="h-7 w-7" />
              ) : (
                <div className="text-center leading-none">
                  <div className="text-2xl font-bold">
                    {daysAway <= 0 ? "0" : daysAway}
                  </div>
                  <div className="mt-0.5 text-[10px] font-medium uppercase tracking-wide">
                    {daysAway === 1 ? "day" : "days"}
                  </div>
                </div>
              )}
            </div>
            <div className="min-w-0">
              <div className="truncate text-base font-semibold text-slate-900">
                {heading}
              </div>
              <div className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
                <Clock className="h-3 w-3" />
                8:00 AM – 12:00 PM
              </div>
              <div className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
                <MapPin className="h-3 w-3" />
                {persona.location}
              </div>
            </div>
          </div>

          {/* Fulfilment progress */}
          <div className="mt-4">
            <div className="mb-1.5 flex items-center justify-between text-[11px] font-medium">
              <span className="flex items-center gap-1 text-primo-700">
                <Package className="h-3 w-3" />
                {stage.label}
              </span>
              <span className="text-slate-400">Delivered</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primo-500 to-aqua-500 transition-all duration-700"
                style={{ width: `${stage.pct}%` }}
              />
            </div>
          </div>

          {/* Items */}
          {upcoming && (
            <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50/60 p-3">
              <div className="flex items-center justify-between text-[10px] font-medium uppercase tracking-wider text-slate-400">
                <span>{lastPlaced ? "In this delivery" : "Your usual delivery"}</span>
                <span className="text-slate-600">{formatCurrency(upcoming.total)}</span>
              </div>
              <ul className="mt-2 space-y-1.5">
                {upcoming.items.slice(0, 4).map((it) => {
                  const p = getProduct(it.productId);
                  const dot = CATEGORY_DOT[p?.category ?? ""] ?? "bg-slate-300";
                  return (
                    <li
                      key={it.productId}
                      className="flex items-center gap-2 text-xs text-slate-600"
                    >
                      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${dot}`} />
                      <span className="flex-1 truncate text-slate-700">
                        {p?.name ?? it.productId}
                      </span>
                      <span className="shrink-0 text-slate-400">×{it.quantity}</span>
                    </li>
                  );
                })}
                {upcoming.items.length > 4 && (
                  <li className="pl-3.5 text-[11px] text-slate-400">
                    +{upcoming.items.length - 4} more item
                    {upcoming.items.length - 4 > 1 ? "s" : ""}
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 p-8 text-center">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-slate-100 text-slate-400">
            <Package className="h-6 w-6" />
          </div>
          <p className="text-sm text-slate-600">
            No delivery scheduled yet.
          </p>
          <p className="text-xs text-slate-400">
            Browse the catalog to set one up.
          </p>
        </div>
      )}
    </div>
  );
}
