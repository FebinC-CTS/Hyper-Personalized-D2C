import { useState } from "react";
import { Plus, Search, Sparkles } from "lucide-react";
import { useCart, usePersona } from "@/store";
import { products, getProduct } from "@/data/products";
import { claudeKeyConfigured, complete, parseJsonObject } from "@/lib/claude";
import { nlSearchPrompt } from "@/lib/prompts";
import { cn, formatCurrency } from "@/lib/utils";
import { AIResponse } from "@/components/AIResponse";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Product } from "@/types";

interface SearchResult {
  product: Product;
  reason: string;
}

const EXAMPLES = [
  "something light and fizzy for a summer picnic",
  "premium glass bottles for a dinner party",
  "zero-sugar flavored water the kids will like",
  "an eco-friendly option for the office",
];

function ProductCard({ product, reason }: { product: Product; reason?: string }) {
  const { addItem } = useCart();
  return (
    <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-soft">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
            {product.brand}
          </div>
          <div className="mt-0.5 text-sm font-semibold text-slate-900">
            {product.name}
          </div>
          <div className="mt-0.5 text-xs text-slate-500">{product.format}</div>
        </div>
        <Badge variant="outline" className="capitalize">
          {product.category}
        </Badge>
      </div>

      {reason && (
        <div className="mt-3 rounded-xl border border-primo-100 bg-primo-50/40 p-2.5 text-xs leading-relaxed text-slate-700">
          <span className="mr-1 font-semibold text-primo-700">Why:</span>
          {reason}
        </div>
      )}

      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
        <span className="text-sm font-semibold text-slate-900">
          {formatCurrency(product.pricePerUnit)}
        </span>
        <Button
          size="sm"
          variant="subtle"
          className="gap-1"
          onClick={() => addItem(product.id)}
        >
          <Plus className="h-3.5 w-3.5" />
          Add
        </Button>
      </div>
    </div>
  );
}

export default function Catalog() {
  const { persona } = usePersona();
  const [input, setInput] = useState("");
  const [submitted, setSubmitted] = useState("");
  const [results, setResults] = useState<SearchResult[] | null>(null);
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async (raw: string) => {
    const q = raw.trim();
    if (!q || loading) return;
    setSubmitted(q);
    setLoading(true);
    setError(null);
    setResults(null);
    setSummary("");
    try {
      const { messages, options } = nlSearchPrompt(persona, q, products);
      const text = await complete(messages, options);
      const obj = parseJsonObject<{
        results: { id: string; reason: string }[];
        summary: string;
      }>(text);
      const mapped = (obj.results ?? [])
        .map((r) => {
          const product = getProduct(r.id);
          return product ? { product, reason: r.reason } : null;
        })
        .filter((r): r is SearchResult => r !== null);
      setResults(mapped);
      setSummary(obj.summary ?? "");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  const clear = () => {
    setSubmitted("");
    setResults(null);
    setSummary("");
    setError(null);
    setInput("");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
          Product discovery
        </h1>
        <p className="mt-1 text-slate-600">
          Search the Primo Brands catalog in plain English — Claude ranks by your
          intent, not just keywords.
        </p>
      </div>

      {/* Search box */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void run(input);
          }}
          className="flex items-center gap-2"
        >
          <div className="flex flex-1 items-center gap-2 rounded-xl border border-slate-200 px-3">
            <Search className="h-4 w-4 shrink-0 text-slate-400" />
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={!claudeKeyConfigured}
              placeholder="e.g. something light and fizzy for a summer picnic"
              className="w-full bg-transparent py-2.5 text-sm text-slate-800 outline-none disabled:opacity-60"
            />
          </div>
          <Button
            type="submit"
            variant="ai"
            disabled={!claudeKeyConfigured || loading || !input.trim()}
          >
            <Sparkles className="h-4 w-4" />
            Search
          </Button>
        </form>

        {!claudeKeyConfigured ? (
          <p className="mt-2 text-xs text-coral-600">
            Add ANTHROPIC_API_KEY to .env.local to enable natural-language search.
          </p>
        ) : (
          <div className="mt-3 flex flex-wrap gap-2">
            {EXAMPLES.map((ex) => (
              <button
                key={ex}
                onClick={() => {
                  setInput(ex);
                  void run(ex);
                }}
                className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-600 transition-colors hover:border-primo-300 hover:bg-primo-50"
              >
                {ex}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Search results */}
      {submitted && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-slate-500">
              Results for{" "}
              <span className="font-semibold text-slate-800">
                "{submitted}"
              </span>
            </h2>
            <button
              onClick={clear}
              className="text-xs font-medium text-slate-500 hover:text-slate-800"
            >
              Clear
            </button>
          </div>

          <AIResponse
            loading={loading}
            error={error}
            onRetry={() => void run(submitted)}
            badgeLabel="AI match"
            size="sm"
            skeletonLines={2}
          >
            {summary && <p className="leading-relaxed">{summary}</p>}
          </AIResponse>

          {results && results.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {results.map((r) => (
                <ProductCard
                  key={r.product.id}
                  product={r.product}
                  reason={r.reason}
                />
              ))}
            </div>
          )}
          {results && results.length === 0 && !loading && (
            <p className="text-sm text-slate-500">
              No matching products found. Try rephrasing your search.
            </p>
          )}
        </div>
      )}

      {/* Full catalog */}
      <div className={cn(submitted && "border-t border-slate-200 pt-6")}>
        <h2 className="mb-3 text-sm font-medium uppercase tracking-wider text-slate-500">
          Full catalog · {products.length} SKUs
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </div>
  );
}
