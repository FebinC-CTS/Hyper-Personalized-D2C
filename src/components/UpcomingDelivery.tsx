import { CalendarCheck, PauseCircle, PlayCircle } from "lucide-react";
import { useCart, usePersona } from "@/store";
import { lastOrder } from "@/data/orders";
import { getProduct } from "@/data/products";
import { formatDate, formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function UpcomingDelivery() {
  const { persona } = usePersona();
  const { paused, togglePaused, openCart, lastPlaced } = useCart();

  // A freshly placed order takes precedence over static history.
  const upcoming = lastPlaced ?? lastOrder(persona.id);
  const hasUpcoming = !paused && (lastPlaced !== null || persona.nextDeliveryInDays !== null);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-slate-500">
          <CalendarCheck className="h-3.5 w-3.5" />
          Next delivery
        </div>
        {paused ? (
          <Badge variant="warning">Paused</Badge>
        ) : lastPlaced ? (
          <Badge variant="success">Confirmed · Fri</Badge>
        ) : persona.nextDeliveryInDays !== null ? (
          <Badge variant="success">In {persona.nextDeliveryInDays}d</Badge>
        ) : (
          <Badge variant="warning">None scheduled</Badge>
        )}
      </div>

      {hasUpcoming ? (
        <>
          <div className="mt-3">
            <div className="text-base font-semibold text-slate-900">
              Friday delivery window
            </div>
            <div className="text-xs text-slate-500">
              8:00 AM – 12:00 PM · {persona.location}
            </div>
          </div>

          {upcoming && (
            <div className="mt-4 rounded-xl bg-slate-50 p-3">
              <div className="flex items-center justify-between text-[10px] font-medium uppercase tracking-wider text-slate-400">
                <span>
                  {lastPlaced ? "This order" : "Last delivery"} ·{" "}
                  {formatDate(upcoming.date)}
                </span>
                <span>{formatCurrency(upcoming.total)}</span>
              </div>
              <ul className="mt-2 space-y-1 text-xs text-slate-600">
                {upcoming.items.slice(0, 3).map((it) => {
                  const p = getProduct(it.productId);
                  return (
                    <li key={it.productId} className="flex justify-between">
                      <span className="truncate pr-2">
                        {p?.name ?? it.productId}
                      </span>
                      <span className="text-slate-400">×{it.quantity}</span>
                    </li>
                  );
                })}
                {upcoming.items.length > 3 && (
                  <li className="text-[11px] text-slate-400">
                    +{upcoming.items.length - 3} more
                  </li>
                )}
              </ul>
            </div>
          )}

          <div className="mt-4 flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 gap-1.5"
              onClick={togglePaused}
            >
              <PauseCircle className="h-3.5 w-3.5" />
              Pause
            </Button>
            <Button
              variant="default"
              size="sm"
              className="flex-1"
              onClick={openCart}
            >
              Edit order
            </Button>
          </div>
        </>
      ) : (
        <>
          <p className="mt-3 text-sm text-slate-600">
            {paused
              ? "Deliveries are paused. Resume whenever you're ready."
              : "No delivery scheduled. Browse the catalog to set one up."}
          </p>
          <Button
            variant="default"
            size="sm"
            className="mt-4 w-full gap-1.5"
            onClick={paused ? togglePaused : openCart}
          >
            {paused ? (
              <>
                <PlayCircle className="h-4 w-4" />
                Resume deliveries
              </>
            ) : (
              "Resume deliveries"
            )}
          </Button>
        </>
      )}
    </div>
  );
}
