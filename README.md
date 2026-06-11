<div align="center">

# Primo IQ

### Hyper-Personalized D2C Commerce, Powered by Generative AI

Every customer touchpoint — greetings, recommendations, search, support, and retention — written in real time by Claude and grounded in that customer's own history and preferences.

<p>
  <img alt="React" src="https://img.shields.io/badge/React-18-149ECA?logo=react&logoColor=white" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white" />
  <img alt="Vite" src="https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white" />
  <img alt="Tailwind CSS" src="https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?logo=tailwindcss&logoColor=white" />
  <img alt="Claude" src="https://img.shields.io/badge/AI-Claude_Sonnet_4.6-D97757" />
</p>

</div>

---

## Overview

Most direct-to-consumer storefronts treat every customer identically: the same greeting, the same "bestseller" carousel, the same blunt reorder reminder. **Primo IQ** turns a generic water-delivery storefront into a one-to-one experience.

For the Primo Brands portfolio — ReadyRefresh, Pure Life, Poland Spring, Perrier, S.Pellegrino, Acqua Panna, and more — every screen reshapes around who is signed in. An office manager, a suburban family, and an at-risk solo professional each see copy, recommendations, and an assistant generated for *their* situation, in real time, by Claude.

The result is a personalization layer that builds loyalty, lifts conversion, and reduces churn — without a content team hand-writing thousands of copy variants.

## Key Features

| # | Feature | Description | AI |
|---|---------|-------------|:--:|
| 1 | **Personalized greeting** | A welcome line referencing the customer's location, season, and recent activity | ● |
| 2 | **"Why this?" explainer** | Per-product reasoning for why an item fits this specific customer | ● |
| 3 | **Smart reorder nudge** | Cadence-aware reminder to reorder a customer's staple SKU | ● |
| 4 | **In-app AI assistant** | Streaming chat grounded in the persona snapshot and full catalog | ● |
| 5 | **Natural-language search** | Search the catalog by intent ("light and fizzy for a picnic"), ranked by vibe | ● |
| 6 | **Analytics insights** | Auto-generated observations over the metrics dashboard for growth leads | ● |
| 7 | **Churn rescue** | On cancellation, predicts the reason and drafts a tailored retention email | ● |
| 8 | **Cart & checkout** | Add to delivery, adjust quantities, free-delivery logic, place order | ○ |
| 9 | **Delivery management** | Pause / resume deliveries and edit the upcoming order | ○ |
| 10 | **Persona switching** | Experience the app as an office, a family, or an at-risk customer | ○ |

<sub>● AI-powered (Claude) &nbsp;·&nbsp; ○ Deterministic application logic</sub>

## How the AI Works

```
 Customer / Persona            office · residential · churning
        │
        ▼
 React + TypeScript SPA        greeting · recommendations · NL search ·
        │                      assistant · analytics insights · churn rescue
        ▼
 Prompt layer                  brand-safe primer + per-feature prompt builders,
 (src/lib/prompts.ts)          grounded in persona snapshot + product catalog
        │
        ▼
 Claude client                 complete() · stream() · in-memory caching
 (src/lib/claude.ts)
        │
        ▼
 Secure dev-server proxy       injects ANTHROPIC_API_KEY server-side —
 (vite.config.ts)              the key never enters the browser bundle
        │
        ▼
 Anthropic Messages API        Claude Sonnet 4.6
```

- **Model:** Claude Sonnet 4.6 (`claude-sonnet-4-6`).
- **Brand-safe by design:** a single primer governs every prompt — the model never invents products outside the catalog or customer details beyond the supplied persona.
- **Secure key handling:** all requests route through a server-side proxy; the API key is never shipped to the client.
- **Resilient:** streaming responses, response caching, and graceful fallbacks when the key is missing or a call fails.

## Tech Stack

| Layer | Technology |
|-------|------------|
| AI / LLM | Claude (Anthropic) — Messages API, SSE streaming |
| Framework | React 18, TypeScript |
| Build | Vite 5 |
| Styling | Tailwind CSS |
| UI primitives | Radix UI, lucide-react, Framer Motion, Recharts |
| Routing | React Router |
| State | React Context (persona · cart · assistant · churn · toasts) |

## Getting Started

### Prerequisites

- **Node.js** 18 or later
- An **Anthropic API key** — create one at [console.anthropic.com](https://console.anthropic.com/settings/keys)

### Installation

```bash
git clone https://github.com/FebinC-CTS/Hyper-Personalized-D2C.git
cd Hyper-Personalized-D2C
npm install
```

### Configuration

Create a `.env.local` file in the project root:

```bash
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

> `.env.local` is gitignored and read **server-side only** — it never reaches the browser bundle. Never commit it.

### Run

```bash
npm run dev
```

Open the URL Vite prints (e.g. `http://localhost:5173`). Without a key the UI still runs and shows friendly "add your key" prompts in place of AI output.

### Build for production

```bash
npm run build
npm run preview
```

## Project Structure

```
src/
├── components/         UI — Header, AssistantPanel, ChurnModal, CartDrawer,
│   │                   Toaster, recommendation & delivery cards
│   └── ui/             Reusable primitives (button, card, badge, dropdown)
├── routes/             Landing · Home · Catalog (NL search) · Analytics
├── lib/
│   ├── claude.ts       Anthropic client — complete(), stream(), caching, hooks
│   ├── prompts.ts      Brand primer + one prompt builder per AI feature
│   └── utils.ts        Recommendation scoring, persona snapshot, formatting
├── data/               Personas, products, orders, analytics (mock demo data)
├── store.tsx           App state — persona, cart, assistant, churn, toasts
└── types.ts            Shared domain types
```

## Demo Walkthrough

1. **Landing** — choose a persona to enter from their lens.
2. **Home** — the AI greeting writes itself; open a recommendation's **"Why this?"** for live reasoning, then **Add to next delivery**.
3. **Smart Reorder** — **Reorder now** drops the predicted SKU into the cart.
4. **Cart** — adjust quantities, see the free-delivery threshold, **Place order**.
5. **Catalog** — search in plain English; results are ranked by intent with an AI match reason.
6. **Analytics** (Admin view) — AI insight bullets generate over the metrics; **Rescue** opens an AI-drafted churn intervention.
7. **AI Assistant** — ask anything; the reply streams in, grounded in the persona and catalog.

## Security

The Anthropic API key lives only in `.env.local` and is injected server-side by the Vite proxy — it is never bundled into the client. For a production deployment, move the same proxy logic into a serverless function or backend service rather than the Vite dev server.

## Roadmap

- [ ] Persist cart and orders to `localStorage` / a backend
- [ ] Flow placed orders back into customer history and analytics
- [ ] Streaming for all single-shot AI features (search, insights, churn)
- [ ] Production proxy as a serverless function

## Disclaimer

All customer, order, and analytics data in this repository is **fabricated for demonstration purposes**. No real customer data is used. Prices are illustrative.

---

<div align="center">
<sub>Prototype built for the Cognizant × Primo Brands hackathon.</sub>
</div>
