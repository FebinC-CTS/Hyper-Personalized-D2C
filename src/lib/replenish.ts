// ─────────────────────────────────────────────────────────────────────────────
// Replenish & right-size engine
//
// Pure functions over the customer's order history. Two customer benefits build
// on this:
//   • Auto-replenish  — derive the "usual" basket + cadence so we can send it
//                       automatically (never run out, zero effort).
//   • Right-size      — compare the established run-rate to recent usage and, if
//                       the customer is trending below their usual, suggest a
//                       smaller recurring order so they stop overpaying.
//
// In production these signals would come from a forecasting service; here it's
// math over the mock order data. "Today" is anchored to the demo timeline.
// ─────────────────────────────────────────────────────────────────────────────

import type { Order, PersonaId } from "@/types";
import { ordersByPersona } from "@/data/orders";
import { getProduct } from "@/data/products";

const DAY_MS = 86_400_000;
const TODAY = new Date("2026-05-15"); // matches utils.daysAgo anchor

const round2 = (n: number) => Math.round(n * 100) / 100;

// ── Cadence ───────────────────────────────────────────────────────────────────
export interface Cadence {
  days: number;
  label: string;
}

function cadenceLabel(days: number): string {
  if (days <= 9) return "weekly";
  if (days <= 18) return "every 2 weeks";
  if (days <= 24) return "every 3 weeks";
  return "monthly";
}

export function cadence(orders: Order[]): Cadence {
  const times = orders.map((o) => new Date(o.date).getTime()).sort((a, b) => a - b);
  if (times.length < 2) return { days: 28, label: "monthly" };
  let gap = 0;
  for (let i = 1; i < times.length; i++) gap += times[i] - times[i - 1];
  const days = Math.round(gap / (times.length - 1) / DAY_MS);
  return { days, label: cadenceLabel(days) };
}

// ── "Your usual" basket ─────────────────────────────────────────────────────────
export interface UsualItem {
  productId: string;
  name: string;
  format: string;
  quantity: number;
  price: number;
}

export function usualBasket(personaId: PersonaId, maxItems = 4): UsualItem[] {
  const orders = ordersByPersona(personaId);
  if (!orders.length) return [];

  const agg = new Map<string, { units: number; appears: number }>();
  for (const o of orders) {
    for (const it of o.items) {
      const cur = agg.get(it.productId) ?? { units: 0, appears: 0 };
      cur.units += it.quantity;
      cur.appears += 1;
      agg.set(it.productId, cur);
    }
  }

  return [...agg.entries()]
    .sort((a, b) => b[1].units - a[1].units)
    .slice(0, maxItems)
    .map(([productId, s]) => {
      const p = getProduct(productId);
      if (!p) return null;
      return {
        productId,
        name: p.name,
        format: p.format,
        quantity: Math.max(1, Math.round(s.units / s.appears)),
        price: p.pricePerUnit,
      };
    })
    .filter((i): i is UsualItem => i !== null);
}

export function basketTotal(items: UsualItem[]): number {
  return round2(items.reduce((sum, i) => sum + i.price * i.quantity, 0));
}

// ── Auto-replenish plan ───────────────────────────────────────────────────────
export interface ReplenishPlan {
  items: UsualItem[];
  cadence: Cadence;
  cycleTotal: number;
  nextDate: string;
}

export function buildReplenishPlan(personaId: PersonaId): ReplenishPlan {
  const orders = ordersByPersona(personaId); // sorted most-recent first
  const items = usualBasket(personaId);
  const cad = cadence(orders);

  const last = orders[0];
  const next = new Date((last ? new Date(last.date).getTime() : TODAY.getTime()));
  next.setDate(next.getDate() + cad.days);
  while (next.getTime() < TODAY.getTime()) next.setDate(next.getDate() + cad.days);

  return {
    items,
    cadence: cad,
    cycleTotal: basketTotal(items),
    nextDate: next.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    }),
  };
}
