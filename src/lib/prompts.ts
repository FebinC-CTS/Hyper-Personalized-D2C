import type { Persona, Product } from "@/types";
import type { ClaudeMessage, ClaudeOptions } from "@/lib/claude";
import { personaGreetingContext, personaSnapshot } from "@/lib/utils";

// Every prompt builder returns { messages, options } so callers can pass
// the result straight into complete() / stream() / useClaudeText().

interface Built {
  messages: ClaudeMessage[];
  options?: ClaudeOptions;
}

const brandPrimer = `You write for Primo IQ, a hyper-personalized D2C platform for Primo Brands (the parent of ReadyRefresh, Pure Life, Poland Spring, Perrier, S.Pellegrino, Acqua Panna, Arrowhead, Deer Park, Ozarka, Ice Mountain, Saratoga, Sanpellegrino, and Splash Refresher). The voice is warm, modern, and quietly confident — Apple-meets-Stripe. Never invent products that aren't in the supplied catalog. Never invent customer details beyond the supplied persona context.`;

// --- Greeting (Home hero) ----------------------------------------------------

export function greetingPrompt(persona: Persona): Built {
  const ctx = personaGreetingContext(persona);
  const snapshot = personaSnapshot(persona.id);

  return {
    messages: [
      {
        role: "user",
        content: `Write ONE concise sentence (max 20 words) to display under "Welcome back, ${persona.greetingName}" on a dashboard. The sentence should reference one specific detail from the customer's situation — their location (${ctx.location}), the time of day (${ctx.timeOfDay}), the season (${ctx.season}), or something from their recent activity below.

Rules:
- Output ONLY the sentence. No reasoning, no preamble, no quotes, no greeting words.
- Do not include the customer's name (it's already in the heading above).
- No exclamation marks.
- Plain, calm, observational tone.

Example output: "Your Friday delivery lands in three days — looks like the team's been on a sparkling water streak this week."

Customer context:
${snapshot}`,
      },
    ],
    options: {
      system: brandPrimer,
      maxTokens: 120,
      temperature: 0.6,
    },
  };
}

// --- "Why this?" recommendation explainer -----------------------------------

export function whyRecommendationPrompt(
  persona: Persona,
  product: Product,
  reasons: string[]
): Built {
  return {
    messages: [
      {
        role: "user",
        content: `Explain in ONE sentence (max 22 words) why this product fits this specific customer. Be concrete. Reference the strongest signal from the reasons list. Do not list features; speak to the customer's situation.\n\nProduct: ${product.name} — ${product.description}\nCategory: ${product.category} · Tags: ${product.tags.join(", ")}\n\nCustomer:\n${personaSnapshot(persona.id)}\n\nSignals (strongest first):\n- ${reasons.join("\n- ")}`,
      },
    ],
    options: {
      system: brandPrimer,
      maxTokens: 120,
      temperature: 0.55,
    },
  };
}

// --- Smart reorder copy ------------------------------------------------------

export function reorderNudgePrompt(
  persona: Persona,
  productName: string,
  daysSinceLast: number,
  typicalCadenceDays: number
): Built {
  return {
    messages: [
      {
        role: "user",
        content: `Write a single-sentence reorder nudge (max 20 words) for ${persona.name.split(" ")[0]}. They usually reorder ${productName} every ~${typicalCadenceDays} days; their last order was ${daysSinceLast} days ago. Be helpful, not pushy. End with a soft question.`,
      },
    ],
    options: {
      system: brandPrimer,
      maxTokens: 80,
      temperature: 0.6,
    },
  };
}

// --- Assistant (chat) — wired in step 4 -------------------------------------

export function assistantSystemPrompt(persona: Persona, catalog: Product[]): string {
  const catalogList = catalog
    .map((p) => `- ${p.id}: ${p.name} (${p.category}, ${p.format}, $${p.pricePerUnit})`)
    .join("\n");

  return `${brandPrimer}

You are the in-app AI assistant for the persona below. Help with product questions, order modifications (simulated — you can't actually mutate orders), delivery scheduling, sustainability questions, and general support. Keep responses concise (1-3 short paragraphs). When recommending products, only reference items from the catalog. When the user asks about prior orders, use the persona snapshot. If asked about something you don't know, say so briefly and suggest a path forward.

== Persona snapshot ==
${personaSnapshot(persona.id)}

== Available catalog ==
${catalogList}`;
}

// --- Natural-language catalog search — wired in step 5 ----------------------

export function nlSearchPrompt(
  persona: Persona,
  query: string,
  catalog: Product[]
): Built {
  const catalogList = catalog
    .map((p) => `- ${p.id} | ${p.name} | ${p.category} | tags:${p.tags.join(",")} | ${p.description}`)
    .join("\n");

  return {
    messages: [
      {
        role: "user",
        content: `User query: "${query}"\n\nReturn a JSON object with exactly this shape (no prose, no markdown fences):\n{ "results": [{"id": "<product-id>", "reason": "<one short reason, max 18 words>"}], "summary": "<one sentence framing the results, max 24 words>" }\n\nRank up to 4 products. Use only product ids from the catalog below. Match the user's vibe (occasion, flavor, format) more than literal keywords.\n\nCustomer:\n${personaSnapshot(persona.id)}\n\nCatalog:\n${catalogList}`,
      },
    ],
    options: {
      system: brandPrimer,
      maxTokens: 500,
      temperature: 0.4,
    },
  };
}

// --- Analytics insights — wired in step 6 ----------------------------------

export function insightsPrompt(metricsSummary: string): Built {
  return {
    messages: [
      {
        role: "user",
        content: `You are reviewing this snapshot of the customer analytics dashboard. Write exactly 4 bullet observations a product/growth lead would care about — patterns, risks, and one concrete recommendation. Each bullet must be 1 sentence, max 22 words. Use plain English, no jargon. Output as a bulleted list using "-" prefixes; no preamble, no headers.\n\nMetrics snapshot:\n${metricsSummary}`,
      },
    ],
    options: {
      system: brandPrimer,
      maxTokens: 320,
      temperature: 0.5,
    },
  };
}

// --- Churn intervention — wired in step 7 ----------------------------------

export function churnInterventionPrompt(persona: Persona): Built {
  return {
    messages: [
      {
        role: "user",
        content: `This customer just clicked "Cancel subscription". Analyze the persona snapshot, then produce a JSON object with exactly this shape (no prose, no markdown fences):\n\n{\n  "cancelReasonGuess": "<one short label, e.g. 'frequency mismatch'>",\n  "confidence": <0-1>,\n  "interventionType": "pause" | "discount" | "frequency-change" | "let-go",\n  "interventionRationale": "<one sentence, max 22 words>",\n  "retentionMessage": {\n    "subject": "<email subject line, max 8 words>",\n    "body": "<2-3 short paragraphs, warm, no exclamation marks, no \"Dear\" salutation>"\n  }\n}\n\nPersona:\n${personaSnapshot(persona.id)}`,
      },
    ],
    options: {
      system: brandPrimer,
      maxTokens: 700,
      temperature: 0.5,
    },
  };
}
