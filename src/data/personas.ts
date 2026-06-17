import type { Persona } from "@/types";

export const personas: Persona[] = [
  {
    id: "sarah",
    name: "Sarah Chen",
    greetingName: "Sarah",
    role: "Office Manager",
    location: "Boston, MA",
    segment: "office",
    group: "Mid-size office, 28 employees",
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
];

export const getPersona = (id: string): Persona => {
  const found = personas.find((p) => p.id === id);
  if (!found) throw new Error(`Unknown persona: ${id}`);
  return found;
};
