import { useCallback } from "react";
import { claudeKeyConfigured, useClaudeText } from "@/lib/claude";
import { greetingPrompt } from "@/lib/prompts";
import { usePersona } from "@/store";
import { AIResponse } from "@/components/AIResponse";

export function HeroGreeting() {
  const { persona } = usePersona();
  const build = useCallback(() => greetingPrompt(persona), [persona]);

  const { text, loading, error, refetch } = useClaudeText(build, {
    cacheKey: `greeting:v2:${persona.id}`,
    enabled: claudeKeyConfigured,
  });

  return (
    <section className="space-y-3">
      <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
        Welcome back, {persona.greetingName}
      </h1>
      <div className="max-w-2xl">
        {!claudeKeyConfigured ? (
          <AIResponse
            error="Add ANTHROPIC_API_KEY to .env.local and restart the dev server."
            badgeLabel="AI greeting"
          />
        ) : (
          <AIResponse
            loading={loading}
            error={error}
            onRetry={refetch}
            badgeLabel="AI greeting"
            size="lg"
            skeletonLines={2}
          >
            <p className="leading-relaxed">{text}</p>
          </AIResponse>
        )}
      </div>
    </section>
  );
}
