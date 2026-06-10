import type { Order, PersonaId } from "@/types";
import { getProduct } from "@/data/products";

// 6-month order history per persona, anchored to today = 2026-05-15.
// Cadence reflects each persona's profile:
//   - Sarah (office): weekly Friday delivery, heavy on jugs + sparkling for meetings
//   - Davis (residential): monthly + a spring uplift in flavored kid drinks
//   - Marcus (churning): premium sparkling, frequency declining sharply, gap before today

const items = (...pairs: [string, number][]) =>
  pairs.map(([productId, quantity]) => ({ productId, quantity }));

const computeTotal = (
  it: { productId: string; quantity: number }[]
): number => {
  return it.reduce((sum, { productId, quantity }) => {
    const p = getProduct(productId);
    return sum + (p ? p.pricePerUnit * quantity : 0);
  }, 0);
};

const order = (
  id: string,
  personaId: PersonaId,
  date: string,
  itemList: { productId: string; quantity: number }[]
): Order => ({
  id,
  personaId,
  date,
  items: itemList,
  total: Math.round(computeTotal(itemList) * 100) / 100,
});

const sarahOrders: Order[] = [
  order("s-001", "sarah", "2025-11-14", items(
    ["pure-life-5gal", 6],
    ["poland-spring-24pk-500ml", 2],
    ["poland-spring-sparkling-original", 4]
  )),
  order("s-002", "sarah", "2025-11-21", items(
    ["pure-life-5gal", 5],
    ["poland-spring-24pk-500ml", 2]
  )),
  order("s-003", "sarah", "2025-12-05", items(
    ["pure-life-5gal", 6],
    ["spellegrino-12pk-500ml", 2],
    ["poland-spring-sparkling-lemonlime", 3]
  )),
  order("s-004", "sarah", "2025-12-12", items(
    ["pure-life-5gal", 5],
    ["poland-spring-24pk-500ml", 3]
  )),
  order("s-005", "sarah", "2025-12-19", items(
    ["pure-life-5gal", 4],
    ["spellegrino-12pk-500ml", 3],
    ["perrier-24pk-cans", 2]
  )),
  order("s-006", "sarah", "2026-01-09", items(
    ["pure-life-5gal", 6],
    ["poland-spring-sparkling-original", 4]
  )),
  order("s-007", "sarah", "2026-01-16", items(
    ["pure-life-5gal", 5],
    ["poland-spring-24pk-500ml", 2]
  )),
  order("s-008", "sarah", "2026-01-23", items(
    ["pure-life-5gal", 5],
    ["poland-spring-sparkling-lemonlime", 3]
  )),
  order("s-009", "sarah", "2026-01-30", items(
    ["pure-life-5gal", 6],
    ["poland-spring-24pk-500ml", 2]
  )),
  order("s-010", "sarah", "2026-02-06", items(
    ["pure-life-5gal", 5],
    ["spellegrino-12pk-500ml", 2]
  )),
  order("s-011", "sarah", "2026-02-13", items(
    ["pure-life-5gal", 6],
    ["poland-spring-sparkling-original", 3]
  )),
  order("s-012", "sarah", "2026-02-20", items(
    ["pure-life-5gal", 5],
    ["poland-spring-24pk-500ml", 3]
  )),
  order("s-013", "sarah", "2026-02-27", items(
    ["pure-life-5gal", 5],
    ["perrier-24pk-cans", 2],
    ["poland-spring-sparkling-lemonlime", 2]
  )),
  order("s-014", "sarah", "2026-03-06", items(
    ["pure-life-5gal", 6],
    ["poland-spring-24pk-500ml", 2]
  )),
  order("s-015", "sarah", "2026-03-13", items(
    ["pure-life-5gal", 5],
    ["poland-spring-sparkling-original", 4]
  )),
  order("s-016", "sarah", "2026-03-20", items(
    ["pure-life-5gal", 6],
    ["spellegrino-12pk-500ml", 2]
  )),
  order("s-017", "sarah", "2026-03-27", items(
    ["pure-life-5gal", 5],
    ["poland-spring-24pk-500ml", 3]
  )),
  order("s-018", "sarah", "2026-04-03", items(
    ["pure-life-5gal", 6],
    ["poland-spring-sparkling-lemonlime", 3]
  )),
  order("s-019", "sarah", "2026-04-10", items(
    ["pure-life-5gal", 5],
    ["spellegrino-12pk-500ml", 2]
  )),
  order("s-020", "sarah", "2026-04-17", items(
    ["pure-life-5gal", 6],
    ["poland-spring-24pk-500ml", 2]
  )),
  order("s-021", "sarah", "2026-04-24", items(
    ["pure-life-5gal", 7],
    ["poland-spring-sparkling-original", 4]
  )),
  order("s-022", "sarah", "2026-05-01", items(
    ["pure-life-5gal", 6],
    ["poland-spring-24pk-500ml", 3],
    ["splash-lemon-12pk", 2]
  )),
  order("s-023", "sarah", "2026-05-09", items(
    ["pure-life-5gal", 7],
    ["poland-spring-sparkling-lemonlime", 3],
    ["splash-lemon-12pk", 2]
  )),
];

const davisOrders: Order[] = [
  order("d-001", "davis", "2025-11-18", items(
    ["pure-life-1gal", 2],
    ["poland-spring-24pk-500ml", 1]
  )),
  order("d-002", "davis", "2025-12-16", items(
    ["pure-life-1gal", 2],
    ["pure-life-24pk-500ml", 2]
  )),
  order("d-003", "davis", "2026-01-13", items(
    ["pure-life-1gal", 2],
    ["poland-spring-1gal", 1]
  )),
  order("d-004", "davis", "2026-02-10", items(
    ["pure-life-1gal", 2],
    ["pure-life-24pk-500ml", 2]
  )),
  // skipped a week — family vacation
  order("d-005", "davis", "2026-03-17", items(
    ["pure-life-1gal", 2],
    ["splash-strawberry-12pk", 1]
  )),
  order("d-006", "davis", "2026-04-14", items(
    ["pure-life-1gal", 3],
    ["splash-strawberry-12pk", 2],
    ["splash-lemon-12pk", 1]
  )),
  order("d-007", "davis", "2026-04-27", items(
    ["pure-life-1gal", 2],
    ["splash-strawberry-12pk", 2],
    ["pure-life-24pk-500ml", 1]
  )),
];

const marcusOrders: Order[] = [
  order("m-001", "marcus", "2025-11-20", items(
    ["spellegrino-12pk-500ml", 2],
    ["acqua-panna-12pk-500ml", 1],
    ["perrier-24pk-cans", 1]
  )),
  order("m-002", "marcus", "2025-12-08", items(
    ["spellegrino-750ml-glass", 1],
    ["saratoga-12pk-750ml", 1]
  )),
  order("m-003", "marcus", "2025-12-28", items(
    ["spellegrino-12pk-500ml", 2],
    ["perrier-lime-10pk", 2]
  )),
  // gap — first signal
  order("m-004", "marcus", "2026-02-04", items(
    ["spellegrino-12pk-500ml", 1],
    ["acqua-panna-12pk-500ml", 1]
  )),
  // larger gap — frequency collapsing
  order("m-005", "marcus", "2026-03-12", items(
    ["perrier-24pk-cans", 1]
  )),
  // last order before today; nothing since.
  order("m-006", "marcus", "2026-04-03", items(
    ["spellegrino-12pk-500ml", 1]
  )),
];

export const orders: Order[] = [
  ...sarahOrders,
  ...davisOrders,
  ...marcusOrders,
];

export const ordersByPersona = (id: PersonaId): Order[] =>
  orders
    .filter((o) => o.personaId === id)
    .sort((a, b) => (a.date < b.date ? 1 : -1));

export const lastOrder = (id: PersonaId): Order | undefined =>
  ordersByPersona(id)[0];

export interface ProductFrequency {
  productId: string;
  units: number;
  orders: number;
}

export const topProducts = (
  id: PersonaId,
  limit = 5
): ProductFrequency[] => {
  const counts = new Map<string, ProductFrequency>();
  for (const o of ordersByPersona(id)) {
    for (const it of o.items) {
      const cur = counts.get(it.productId) ?? {
        productId: it.productId,
        units: 0,
        orders: 0,
      };
      cur.units += it.quantity;
      cur.orders += 1;
      counts.set(it.productId, cur);
    }
  }
  return [...counts.values()]
    .sort((a, b) => b.units - a.units)
    .slice(0, limit);
};
