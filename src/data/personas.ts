import type { Persona } from "@/types";

export const personas: Persona[] = [
  {
    id: "sarah",
    name: "Sarah Chen",
    greetingName: "Sarah",
    role: "Office Manager",
    location: "Boston, MA",
    segment: "office",
    household: "Mid-size office, 28 employees",
    tenureMonths: 14,
    avatarInitials: "SC",
    bio: "Manages hydration for a creative agency. Books deliveries on Fridays, prefers low-touch reordering, sensitive to peak summer consumption spikes.",
    preferences: {
      favoriteCategories: ["still", "sparkling"],
      flavorNotes: ["citrus", "crisp", "neutral"],
      sustainabilityFocus: true,
    },
    churnRisk: 0.12,
    lastOrderDaysAgo: 6,
    nextDeliveryInDays: 3,
  },
  {
    id: "davis",
    name: "The Davis Family",
    greetingName: "Davis family",
    role: "Residential household",
    location: "Westchester, NY",
    segment: "residential",
    household: "Family of 4, two kids under 10",
    tenureMonths: 22,
    avatarInitials: "DF",
    bio: "Suburban family on a monthly Pure Life cadence. Adds Splash Refresher in summer. Pauses deliveries on vacation weeks.",
    preferences: {
      favoriteCategories: ["still", "flavored"],
      flavorNotes: ["berry", "kid-friendly", "lightly sweet"],
      sustainabilityFocus: false,
    },
    churnRisk: 0.21,
    lastOrderDaysAgo: 18,
    nextDeliveryInDays: 12,
  },
  {
    id: "marcus",
    name: "Marcus Rivera",
    greetingName: "Marcus",
    role: "Solo professional",
    location: "Austin, TX",
    segment: "churning",
    household: "Single-person condo",
    tenureMonths: 9,
    avatarInitials: "MR",
    bio: "Signed up for premium sparkling bundles, usage dropped after a move. Opened the cancellation page twice in the last 30 days.",
    preferences: {
      favoriteCategories: ["sparkling", "premium", "mineral"],
      flavorNotes: ["dry", "mineral", "Italian"],
      sustainabilityFocus: true,
    },
    churnRisk: 0.78,
    lastOrderDaysAgo: 42,
    nextDeliveryInDays: null,
  },
];

export const getPersona = (id: string): Persona => {
  const found = personas.find((p) => p.id === id);
  if (!found) throw new Error(`Unknown persona: ${id}`);
  return found;
};
