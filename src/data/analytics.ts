import type { ChurnRow, CohortPoint, FunnelStep } from "@/types";

// All numbers are fabricated for demo. In production these would
// stream from the warehouse / product analytics.

export const funnel: FunnelStep[] = [
  { step: "Landed on site", users: 18420 },
  { step: "Browsed catalog", users: 11240 },
  { step: "Added to cart", users: 5180 },
  { step: "Started checkout", users: 3290 },
  { step: "Completed first order", users: 2410 },
  { step: "Subscribed to delivery", users: 1730 },
];

// Monthly retention of the Nov 2025 cohort, last 6 months.
export const cohortRetention: CohortPoint[] = [
  { month: "Nov '25", retention: 1.0 },
  { month: "Dec '25", retention: 0.86 },
  { month: "Jan '26", retention: 0.77 },
  { month: "Feb '26", retention: 0.71 },
  { month: "Mar '26", retention: 0.66 },
  { month: "Apr '26", retention: 0.62 },
  { month: "May '26", retention: 0.58 },
];

export interface DropoffPoint {
  page: string;
  step: string;
  dropoffRate: number;
}

// Highest-friction transitions across the funnel.
export const dropoffHotspots: DropoffPoint[] = [
  { page: "Browse → Cart", step: "Add first item", dropoffRate: 0.54 },
  { page: "Cart → Checkout", step: "Address entry", dropoffRate: 0.36 },
  { page: "Checkout → Pay", step: "Payment method", dropoffRate: 0.27 },
  { page: "Pay → Subscribe", step: "Subscription upsell", dropoffRate: 0.28 },
  { page: "Account → Pause", step: "Pause confirmation", dropoffRate: 0.41 },
];

// The customers the dashboard highlights. Marcus (our demo persona) appears
// here so the churn flow connects to a row the user can see in the table.
export const churnRiskTable: ChurnRow[] = [
  {
    customerId: "marcus",
    name: "Marcus Rivera",
    riskScore: 0.78,
    topReasons: [
      "Order frequency dropped 73% over 90 days",
      "Visited cancel page twice in last 30 days",
    ],
    lastOrderDaysAgo: 42,
    ltv: 412.6,
  },
  {
    customerId: "cust-7821",
    name: "Priya Anand",
    riskScore: 0.71,
    topReasons: [
      "Skipped 3 consecutive deliveries",
      "No category browse in 21 days",
    ],
    lastOrderDaysAgo: 38,
    ltv: 268.4,
  },
  {
    customerId: "cust-4410",
    name: "Westmoor Dental Group",
    riskScore: 0.69,
    topReasons: [
      "Office occupancy down per cooler usage telemetry",
      "Reduced jug count for 4 consecutive orders",
    ],
    lastOrderDaysAgo: 28,
    ltv: 1942.1,
  },
  {
    customerId: "cust-9933",
    name: "Jordan Blake",
    riskScore: 0.64,
    topReasons: [
      "Switched from premium to value SKUs",
      "No app open in 18 days",
    ],
    lastOrderDaysAgo: 24,
    ltv: 311.2,
  },
  {
    customerId: "cust-2017",
    name: "The Ortiz Household",
    riskScore: 0.58,
    topReasons: [
      "Seasonal Splash drop-off",
      "Reduced gallon count by 50%",
    ],
    lastOrderDaysAgo: 22,
    ltv: 504.3,
  },
  {
    customerId: "cust-6634",
    name: "Bayview Coworking",
    riskScore: 0.52,
    topReasons: [
      "Member headcount down",
      "Pricing-page visits up 4x",
    ],
    lastOrderDaysAgo: 17,
    ltv: 2280.5,
  },
  {
    customerId: "cust-1188",
    name: "Tessa Whitman",
    riskScore: 0.48,
    topReasons: [
      "Delivery-frequency lowered self-serve",
      "Skipped most recent delivery",
    ],
    lastOrderDaysAgo: 14,
    ltv: 187.0,
  },
  {
    customerId: "cust-5512",
    name: "Linden Park Pediatrics",
    riskScore: 0.44,
    topReasons: [
      "Sparkling SKUs dropped from order",
      "Cart abandon on last 2 attempts",
    ],
    lastOrderDaysAgo: 11,
    ltv: 1402.8,
  },
];

export interface AnalyticsKpi {
  label: string;
  value: string;
  delta: string;
  positive: boolean;
}

export const kpis: AnalyticsKpi[] = [
  { label: "Active subscribers", value: "12,840", delta: "+4.2%", positive: true },
  { label: "30-day churn", value: "6.1%", delta: "-0.8 pp", positive: true },
  { label: "AOV", value: "$48.30", delta: "+$2.10", positive: true },
  { label: "At-risk customers", value: "1,084", delta: "+128", positive: false },
];
