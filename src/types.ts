export type PersonaId = "sarah" | "davis" | "marcus";

export type PersonaSegment = "office" | "residential" | "churning";

export interface Persona {
  id: PersonaId;
  name: string;
  greetingName: string;
  role: string;
  location: string;
  segment: PersonaSegment;
  household: string;
  tenureMonths: number;
  avatarInitials: string;
  bio: string;
  preferences: {
    favoriteCategories: string[];
    flavorNotes: string[];
    sustainabilityFocus: boolean;
  };
  churnRisk: number;
  lastOrderDaysAgo: number;
  nextDeliveryInDays: number | null;
}

export type ProductCategory =
  | "still"
  | "sparkling"
  | "mineral"
  | "flavored"
  | "premium";

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: ProductCategory;
  format: string;
  pricePerUnit: number;
  tags: string[];
  description: string;
}

export interface Order {
  id: string;
  personaId: PersonaId;
  date: string;
  items: { productId: string; quantity: number }[];
  total: number;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  pending?: boolean;
}

export interface FunnelStep {
  step: string;
  users: number;
}

export interface CohortPoint {
  month: string;
  retention: number;
}

export interface ChurnRow {
  customerId: string;
  name: string;
  riskScore: number;
  topReasons: string[];
  lastOrderDaysAgo: number;
  ltv: number;
}
