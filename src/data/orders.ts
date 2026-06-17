import type { Order, PersonaId } from "@/types";
import { getProduct } from "@/data/products";

// 6-month order history, anchored to today = 2026-05-15.
//   - Sarah (office): weekly Friday delivery, heavy on jugs + sparkling for meetings

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

export const orders: Order[] = [...sarahOrders];

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
