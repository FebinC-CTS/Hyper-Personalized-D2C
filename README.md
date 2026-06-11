# Hyper-Personalized-D2C (Primo IQ)

> A hyper-personalized D2C beverage experience powered by Claude. AI generates greetings, product recommendations, natural-language search, churn rescue, and an in-app assistant in real time — all grounded in each customer's own history and preferences.

Built for the Primo Brands portfolio (ReadyRefresh, Pure Life, Poland Spring, Perrier, S.Pellegrino, Acqua Panna, and more), Primo IQ turns a generic water-delivery storefront into a one-to-one experience that adapts to who's signed in.

## ✨ Features

| Area | What it does | AI? |
|------|--------------|-----|
| **Personalized greeting** | A welcome line written for the customer's location, season, and recent activity | ✅ Claude |
| **"Why this?" recommendations** | Per-product explanations of why an item fits this specific customer | ✅ Claude |
| **Smart reorder nudge** | Cadence-aware reminder to reorder a customer's staple SKU | ✅ Claude |
| **AI Assistant** | Streaming in-app chat grounded in the persona + full catalog | ✅ Claude |
| **Natural-language search** | Search the catalog by vibe ("light and fizzy for a picnic"), ranked by intent | ✅ Claude |
| **Analytics insights** | Auto-generated bullet observations over the metrics dashboard | ✅ Claude |
| **Churn rescue** | On cancel, predicts the reason and drafts a tailored retention email | ✅ Claude |
| **Cart & checkout** | Add to delivery, adjust quantities, free-delivery logic, place order | — |
| **Delivery management** | Pause/resume deliveries, edit upcoming order | — |
| **Persona switching** | Experience the app as an office, a family, or an at-risk customer | — |

## 🧠 How the AI works

- **Model:** Claude Sonnet 4.6 (`claude-sonnet-4-6`) via the Anthropic Messages API.
- **Prompt layer:** A single brand-safe primer plus one purpose-built prompt builder per feature, each grounded in a compact persona snapshot and the real product catalog ([`src/lib/prompts.ts`](src/lib/prompts.ts)).
- **Secure proxy:** All requests route through a Vite dev-server middleware that injects the API key server-side, so the key **never reaches the browser bundle** ([`vite.config.ts`](vite.config.ts)).
- **Resilience:** Streaming responses, in-memory caching, and graceful fallbacks if the key is missing or a call fails.

## 🛠 Tech stack

- **AI:** Claude (Anthropic), streaming via SSE
- **Frontend:** React 18 + TypeScript + Vite 5
- **UI:** Tailwind CSS, Radix UI, Framer Motion, lucide-react, Recharts
- **Routing:** React Router
- **State:** React Context store (persona, cart, assistant, churn, toasts)

## 🚀 Getting started

### Prerequisites
- Node.js 18+
- An Anthropic API key ([console.anthropic.com](https://console.anthropic.com/settings/keys))

### Setup

```bash
npm install
```

Create a `.env.local` file in the project root (this file is gitignored — never commit it):

```bash
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

### Run

```bash
npm run dev
```

Open the local URL Vite prints (e.g. http://localhost:5173). Without a key, the UI still runs and shows friendly "add your key" notices in place of the AI output.

### Build

```bash
npm run build
npm run preview
```

## 🔐 Security note

The Anthropic API key lives only in `.env.local` and is injected server-side by the Vite proxy. It is **never** bundled into the client. For a production deployment, move the same proxy logic into a serverless function or backend service rather than the Vite dev server.

## 📁 Project structure

```
src/
├── components/      # UI: Header, AssistantPanel, ChurnModal, CartDrawer, Toaster, cards
├── routes/          # Landing, Home, Catalog (NL search), Analytics (insights + churn)
├── lib/
│   ├── claude.ts    # Anthropic client: complete(), stream(), caching, hooks
│   ├── prompts.ts   # Brand primer + per-feature prompt builders
│   └── utils.ts     # Recommendation scoring, persona snapshot, formatting
├── data/            # Personas, products, orders, analytics (mock demo data)
├── store.tsx        # App state: persona, cart, assistant, churn, toasts
└── types.ts
```

## 📝 Notes

- All customer and analytics data is **fabricated for demo purposes** — no real customer data.
- Cart and order state is in-memory and resets on refresh.

---

*Prototype built for the Cognizant / Primo Brands hackathon.*
