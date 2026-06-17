import { clsx } from "clsx";
import type { ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Persona, PersonaId, Product } from "@/types";
import { products } from "@/data/products";
import { ordersByPersona, topProducts } from "@/data/orders";
import { getPersona } from "@/data/personas";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatCurrency = (n: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(n);

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

export const daysAgo = (iso: string, today = new Date("2026-05-15")) => {
  const ms = today.getTime() - new Date(iso).getTime();
  return Math.max(0, Math.round(ms / (1000 * 60 * 60 * 24)));
};

export interface Recommendation {
  product: Product;
  score: number;
  reasons: string[];
}

// ── Literal keyword / spec search ──────────────────────────────────────────────
// Deterministic exact-match for concrete queries (pack size, volume, format,
// brand, category). A product matches only if EVERY meaningful token is present,
// so "12 pack" returns only 12-packs — never a 10-pack. Descriptive/vibe queries
// match nothing here and fall through to the AI semantic search.
const SEARCH_STOPWORDS = new Set([
  "a", "an", "the", "for", "of", "with", "and", "or", "to", "in", "on", "some",
  "something", "please", "i", "want", "need", "me", "my", "that", "this", "is",
  "are", "find", "show", "get", "looking", "like",
]);

// Lowercase, strip punctuation, and glue a number to its unit ("500 mL" → "500ml",
// "12-pack" → "12pack") so specs compare cleanly.
const normalizeSearch = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, " ")
    .replace(/(\d)\s+(ml|oz|l|gal|gallon|pk|pack)\b/g, "$1$2")
    .replace(/\s+/g, " ")
    .trim();

export function keywordSearch(query: string, list: Product[] = products): Product[] {
  const tokens = normalizeSearch(query)
    .split(" ")
    .filter((t) => t && !SEARCH_STOPWORDS.has(t));
  if (!tokens.length) return [];

  return list.filter((p) => {
    const hay = normalizeSearch(
      `${p.name} ${p.brand} ${p.category} ${p.format} ${p.tags.join(" ")}`
    );
    return tokens.every((t) => hay.includes(t));
  });
}

// In production this would hit our recommendation service.
// For the demo we score products against a persona's stated preferences,
// purchase history, and a small set of contextual nudges.
export function recommendProducts(
  personaId: PersonaId,
  limit = 6
): Recommendation[] {
  const persona = getPersona(personaId);
  const history = ordersByPersona(personaId);
  const top = topProducts(personaId, 999);
  const purchased = new Set(top.map((t) => t.productId));

  const scored = products.map<Recommendation>((product) => {
    const reasons: string[] = [];
    let score = 0;

    if (persona.preferences.favoriteCategories.includes(product.category)) {
      score += 30;
      reasons.push(`Matches your ${product.category} preference`);
    }

    const flavorHit = persona.preferences.flavorNotes.find((note) =>
      product.tags.some((t) =>
        t.toLowerCase().includes(note.toLowerCase())
      )
    );
    if (flavorHit) {
      score += 18;
      reasons.push(`Aligns with your ${flavorHit} taste profile`);
    }

    if (
      persona.preferences.sustainabilityFocus &&
      product.tags.includes("sustainable")
    ) {
      score += 12;
      reasons.push("Refillable / lower-waste format");
    }

    if (purchased.has(product.id)) {
      const freq = top.find((t) => t.productId === product.id);
      if (freq) {
        score += Math.min(20, freq.units);
        reasons.push(`You've reordered this ${freq.orders}x recently`);
      }
    } else {
      // small novelty bonus for never-tried items in a preferred category
      if (persona.preferences.favoriteCategories.includes(product.category)) {
        score += 6;
        reasons.push("New to you in a category you love");
      }
    }

    // Persona-specific nudges that production rules would encode.
    if (persona.segment === "office" && product.tags.includes("office")) {
      score += 14;
      reasons.push("Built for office consumption volume");
    }
    if (persona.segment === "residential" && product.tags.includes("kid-friendly")) {
      score += 10;
      reasons.push("Kid-friendly for the household");
    }
    if (persona.segment === "churning" && product.tags.includes("premium")) {
      score += 8;
      reasons.push("Premium pick you previously responded to");
    }

    // Light seasonal nudge — May in the demo timeline = warm months ramping up.
    if (product.tags.includes("summer") && history.length > 0) {
      score += 5;
      reasons.push("Trending up in your area this month");
    }

    return { product, score, reasons };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

// Compact persona snapshot for Claude system prompts. Kept terse on purpose:
// long context burns tokens without improving demo quality.
export function personaSnapshot(personaId: PersonaId): string {
  const p = getPersona(personaId);
  const recent = ordersByPersona(personaId).slice(0, 3);
  const top = topProducts(personaId, 4);

  return [
    `Persona: ${p.name} (${p.role}, ${p.location})`,
    `Segment: ${p.segment}; tenure: ${p.tenureMonths} months; churn risk: ${(p.churnRisk * 100).toFixed(0)}%`,
    `Group: ${p.group}`,
    `Preferences: categories=${p.preferences.favoriteCategories.join("/")}; flavors=${p.preferences.flavorNotes.join("/")}; sustainability=${p.preferences.sustainabilityFocus}`,
    `Last order ${p.lastOrderDaysAgo} days ago. Next delivery: ${p.nextDeliveryInDays === null ? "none scheduled" : `in ${p.nextDeliveryInDays} days`}`,
    `Top SKUs: ${top.map((t) => `${t.productId}(${t.units}u)`).join(", ")}`,
    `Recent orders: ${recent.map((o) => `${o.date} $${o.total}`).join("; ")}`,
  ].join("\n");
}

export function personaGreetingContext(persona: Persona) {
  const hour = new Date().getHours();
  const tod =
    hour < 5
      ? "late night"
      : hour < 12
      ? "morning"
      : hour < 17
      ? "afternoon"
      : "evening";
  return {
    timeOfDay: tod,
    season: "spring (May)",
    location: persona.location,
  };
}
