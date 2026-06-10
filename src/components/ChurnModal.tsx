import { useEffect, useState } from "react";
import { Mail, ShieldAlert, X } from "lucide-react";
import { useChurn, usePersona, useToast } from "@/store";
import { claudeKeyConfigured, complete, parseJsonObject } from "@/lib/claude";
import { churnInterventionPrompt } from "@/lib/prompts";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ChurnIntervention {
  cancelReasonGuess: string;
  confidence: number;
  interventionType: "pause" | "discount" | "frequency-change" | "let-go";
  interventionRationale: string;
  retentionMessage: { subject: string; body: string };
}

const INTERVENTION_LABEL: Record<ChurnIntervention["interventionType"], string> = {
  pause: "Offer a pause",
  discount: "Offer a discount",
  "frequency-change": "Adjust frequency",
  "let-go": "Let go gracefully",
};

export function ChurnModal() {
  const { open, closeChurn } = useChurn();
  const { persona } = usePersona();
  const { toast } = useToast();

  const sendOffer = () => {
    closeChurn();
    toast(
      `Retention offer sent to ${persona.greetingName}. 🎉`,
      "success"
    );
  };
  const [data, setData] = useState<ChurnIntervention | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setData(null);
      setError(null);
      return;
    }
    if (!claudeKeyConfigured) {
      setError("Add ANTHROPIC_API_KEY to .env.local to run the rescue.");
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      setData(null);
      try {
        const { messages, options } = churnInterventionPrompt(persona);
        const text = await complete(messages, options);
        const obj = parseJsonObject<ChurnIntervention>(text);
        if (!cancelled) setData(obj);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, persona]);

  if (!open) return null;

  const confidencePct = data ? Math.round(data.confidence * 100) : 0;

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-slate-900/40 backdrop-blur-sm p-4"
      onClick={closeChurn}
    >
      <div
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl animate-[modalIn_0.25s_ease]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-200 bg-coral-500/5 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-coral-500/10 text-coral-600">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-900">
                Churn rescue · {persona.name}
              </div>
              <div className="text-[11px] text-slate-500">
                {persona.greetingName} just clicked "Cancel subscription"
              </div>
            </div>
          </div>
          <button
            onClick={closeChurn}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-white hover:text-slate-700"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4 px-5 py-5">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-primo-50 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primo-700">
            <ShieldAlert className="h-3 w-3" />
            AI-generated rescue
          </div>

          {loading && (
            <div className="space-y-2">
              <div className="h-3 w-2/3 rounded-full skeleton-shimmer" />
              <div className="h-3 w-full rounded-full skeleton-shimmer" />
              <div className="h-24 w-full rounded-xl skeleton-shimmer" />
            </div>
          )}

          {error && !loading && (
            <p className="rounded-xl border border-coral-500/20 bg-coral-500/5 p-3 text-sm text-coral-600">
              {error}
            </p>
          )}

          {data && !loading && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-slate-200 p-3">
                  <div className="text-[10px] uppercase tracking-wider text-slate-400">
                    Likely reason
                  </div>
                  <div className="mt-0.5 text-sm font-medium text-slate-800">
                    {data.cancelReasonGuess}
                  </div>
                </div>
                <div className="rounded-xl border border-slate-200 p-3">
                  <div className="text-[10px] uppercase tracking-wider text-slate-400">
                    Confidence
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <div className="h-1.5 flex-1 rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-primo-500"
                        style={{ width: `${confidencePct}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-slate-800">
                      {confidencePct}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 p-3">
                <div className="flex items-center justify-between">
                  <div className="text-[10px] uppercase tracking-wider text-slate-400">
                    Recommended move
                  </div>
                  <Badge variant="ai">
                    {INTERVENTION_LABEL[data.interventionType] ??
                      data.interventionType}
                  </Badge>
                </div>
                <p className="mt-1.5 text-sm text-slate-700">
                  {data.interventionRationale}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
                <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-slate-400">
                  <Mail className="h-3 w-3" />
                  Drafted retention email
                </div>
                <div className="mt-2 text-sm font-semibold text-slate-900">
                  {data.retentionMessage.subject}
                </div>
                <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                  {data.retentionMessage.body}
                </p>
              </div>
            </>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-slate-200 px-5 py-3">
          <Button variant="outline" size="sm" onClick={closeChurn}>
            Dismiss
          </Button>
          <Button
            variant="ai"
            size="sm"
            disabled={!data}
            className={cn(!data && "opacity-50")}
            onClick={sendOffer}
          >
            Send retention offer
          </Button>
        </div>
      </div>
    </div>
  );
}
