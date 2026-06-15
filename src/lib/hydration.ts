// ─────────────────────────────────────────────────────────────────────────────
// Hydration & wellness engine
//
// Estimates how much water a household is getting from their Primo deliveries
// and frames it against the familiar "8 glasses a day" goal. Pure functions over
// the order history + product formats. In production a smart-dispenser or app
// log would refine this; here it's derived from delivered volume.
// ─────────────────────────────────────────────────────────────────────────────

import type { PersonaId } from "@/types";
import { ordersByPersona } from "@/data/orders";
import { getProduct } from "@/data/products";
import { getPersona } from "@/data/personas";
import { daysAgo } from "@/lib/utils";

const OZ_TO_L = 0.0295735;
const GAL_TO_L = 3.78541;
const GLASS_L = 0.25; // one 250 mL glass
const GOAL_GLASSES = 8; // recommended glasses per person per day
const WINDOW_DAYS = 60;

const round1 = (n: number) => Math.round(n * 10) / 10;

// Parse a catalog `format` string into total liters for one purchasable unit.
//   "24-pack · 500 mL bottles" → 24 × 0.5 = 12 L
//   "6-pack · 1-gallon jugs"   → 6 × 3.785 = 22.7 L
//   "5-gallon refillable jug"  → 1 × 5 × 3.785 = 18.9 L
//   "12-pack · 16.9 oz bottles"→ 12 × 16.9 oz = 6.0 L
export function litersPerUnit(format: string): number {
  const packMatch = /(\d+)\s*-?\s*pack/i.exec(format);
  const count = packMatch ? parseInt(packMatch[1], 10) : 1;

  const ml = /([\d.]+)\s*ml/i.exec(format);
  const oz = /([\d.]+)\s*oz/i.exec(format);
  const gal = /([\d.]+)\s*-?\s*gallon/i.exec(format);

  let unitLiters = 0;
  if (ml) unitLiters = parseFloat(ml[1]) / 1000;
  else if (oz) unitLiters = parseFloat(oz[1]) * OZ_TO_L;
  else if (gal) unitLiters = parseFloat(gal[1]) * GAL_TO_L;

  return count * unitLiters;
}

function householdSize(household: string): number {
  const h = household.toLowerCase();
  if (h.includes("single") || h.includes("solo")) return 1;
  const m = /(\d+)/.exec(h);
  return m ? parseInt(m[1], 10) : 1;
}

export interface Hydration {
  people: number;
  litersPerDay: number; // household, from deliveries
  perPersonGlasses: number; // per person per day
  goalPerPerson: number; // 8
  pct: number; // perPersonGlasses / goal, capped 0–100
  onTrack: boolean;
}

export function analyzeHydration(personaId: PersonaId): Hydration {
  const persona = getPersona(personaId);
  const orders = ordersByPersona(personaId);

  let liters = 0;
  for (const o of orders) {
    if (daysAgo(o.date) > WINDOW_DAYS) continue;
    for (const it of o.items) {
      const p = getProduct(it.productId);
      if (p) liters += litersPerUnit(p.format) * it.quantity;
    }
  }

  const people = householdSize(persona.household);
  const litersPerDay = liters / WINDOW_DAYS;
  const perPersonGlasses = litersPerDay / GLASS_L / people;
  const pct = Math.min(100, Math.max(0, Math.round((perPersonGlasses / GOAL_GLASSES) * 100)));

  return {
    people,
    litersPerDay: round1(litersPerDay),
    perPersonGlasses: round1(perPersonGlasses),
    goalPerPerson: GOAL_GLASSES,
    pct,
    onTrack: perPersonGlasses >= GOAL_GLASSES * 0.8,
  };
}
