import { useCallback } from "react";
import { ArrowDownRight, ArrowUpRight, ShieldAlert } from "lucide-react";
import { usePersona, useChurn } from "@/store";
import {
  churnRiskTable,
  cohortRetention,
  dropoffHotspots,
  funnel,
  kpis,
} from "@/data/analytics";
import { claudeKeyConfigured, useClaudeText } from "@/lib/claude";
import { insightsPrompt } from "@/lib/prompts";
import { cn, formatCurrency } from "@/lib/utils";
import { AIResponse } from "@/components/AIResponse";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// Compact, text-only snapshot of the dashboard for Claude to reason over.
function buildMetricsSummary(): string {
  const kpiLines = kpis
    .map((k) => `- ${k.label}: ${k.value} (${k.delta})`)
    .join("\n");
  const funnelLines = funnel
    .map((f) => `- ${f.step}: ${f.users.toLocaleString()}`)
    .join("\n");
  const cohortStart = cohortRetention[0];
  const cohortEnd = cohortRetention[cohortRetention.length - 1];
  const dropLines = dropoffHotspots
    .map((d) => `- ${d.page} (${d.step}): ${Math.round(d.dropoffRate * 100)}% drop`)
    .join("\n");

  return [
    "KPIs:",
    kpiLines,
    "\nAcquisition funnel (users):",
    funnelLines,
    `\nCohort retention: ${Math.round(cohortStart.retention * 100)}% at ${cohortStart.month} → ${Math.round(cohortEnd.retention * 100)}% at ${cohortEnd.month}`,
    "\nDrop-off hotspots:",
    dropLines,
    `\nAt-risk customers in table: ${churnRiskTable.length}; highest risk ${Math.round(churnRiskTable[0].riskScore * 100)}% (${churnRiskTable[0].name}).`,
  ].join("\n");
}

function parseBullets(text: string): string[] {
  return text
    .split("\n")
    .map((l) => l.replace(/^[-•*]\s*/, "").trim())
    .filter(Boolean);
}

export default function Analytics() {
  const { setPersonaId } = usePersona();
  const { openChurn } = useChurn();

  const build = useCallback(() => insightsPrompt(buildMetricsSummary()), []);
  const { text, loading, error, refetch } = useClaudeText(build, {
    cacheKey: "insights:v1",
    enabled: claudeKeyConfigured,
  });
  const bullets = text ? parseBullets(text) : [];

  const maxFunnel = funnel[0].users;

  const runRescue = (customerId: string) => {
    // Our demo persona "marcus" maps to a real persona the rescue can analyze.
    if (customerId === "marcus") setPersonaId("marcus");
    openChurn();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
          Customer analytics
        </h1>
        <p className="mt-1 text-slate-600">
          Funnel, cohort retention, AI insights, and churn-risk monitoring.
        </p>
      </div>

      {/* KPI row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => (
          <div
            key={k.label}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft"
          >
            <div className="text-xs text-slate-500">{k.label}</div>
            <div className="mt-1 text-2xl font-semibold text-slate-900">
              {k.value}
            </div>
            <div
              className={cn(
                "mt-1 inline-flex items-center gap-0.5 text-xs font-medium",
                k.positive ? "text-aqua-600" : "text-coral-600"
              )}
            >
              {k.positive ? (
                <ArrowUpRight className="h-3 w-3" />
              ) : (
                <ArrowDownRight className="h-3 w-3" />
              )}
              {k.delta}
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Funnel */}
        <Card>
          <CardHeader>
            <CardTitle>Journey funnel</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {funnel.map((f) => {
              const pct = (f.users / maxFunnel) * 100;
              return (
                <div key={f.step}>
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>{f.step}</span>
                    <span className="font-medium text-slate-800">
                      {f.users.toLocaleString()}
                    </span>
                  </div>
                  <div className="mt-1 h-2 rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-primo-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
            <div className="mt-3 border-t border-slate-100 pt-3">
              <div className="text-[10px] uppercase tracking-wider text-slate-400">
                Top drop-off hotspots
              </div>
              <div className="mt-1.5 space-y-1">
                {dropoffHotspots.slice(0, 3).map((d) => (
                  <div
                    key={d.page}
                    className="flex justify-between text-xs text-slate-600"
                  >
                    <span>{d.page}</span>
                    <span className="font-medium text-coral-600">
                      {Math.round(d.dropoffRate * 100)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI insights */}
        <Card>
          <CardHeader>
            <CardTitle>AI insights</CardTitle>
          </CardHeader>
          <CardContent>
            {!claudeKeyConfigured ? (
              <AIResponse
                error="Add ANTHROPIC_API_KEY to .env.local to generate insights."
                badgeLabel="AI insights"
                size="sm"
              />
            ) : (
              <AIResponse
                loading={loading}
                error={error}
                onRetry={refetch}
                badgeLabel="AI insights"
                size="sm"
                skeletonLines={4}
              >
                <ul className="space-y-2">
                  {bullets.map((b, i) => (
                    <li key={i} className="flex gap-2 leading-relaxed">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primo-500" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </AIResponse>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Cohort retention */}
      <Card>
        <CardHeader>
          <CardTitle>Cohort retention · Nov '25 cohort</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-3">
            {cohortRetention.map((c) => (
              <div key={c.month} className="flex flex-1 flex-col items-center gap-1.5">
                <div className="text-[11px] font-medium text-slate-700">
                  {Math.round(c.retention * 100)}%
                </div>
                <div className="flex h-32 w-full items-end">
                  <div
                    className="w-full rounded-t-lg bg-aqua-500/70"
                    style={{ height: `${c.retention * 100}%` }}
                  />
                </div>
                <div className="text-[10px] text-slate-400">{c.month}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Churn risk table */}
      <Card>
        <CardHeader>
          <CardTitle>Churn-risk monitor</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-[10px] uppercase tracking-wider text-slate-400">
                <th className="pb-2 font-medium">Customer</th>
                <th className="pb-2 font-medium">Risk</th>
                <th className="pb-2 font-medium">Top reasons</th>
                <th className="pb-2 font-medium">Last order</th>
                <th className="pb-2 font-medium">LTV</th>
                <th className="pb-2 font-medium" />
              </tr>
            </thead>
            <tbody>
              {churnRiskTable.map((row) => (
                <tr
                  key={row.customerId}
                  className="border-b border-slate-100 last:border-0"
                >
                  <td className="py-2.5 font-medium text-slate-800">
                    {row.name}
                  </td>
                  <td className="py-2.5">
                    <Badge
                      variant={row.riskScore >= 0.65 ? "warning" : "default"}
                    >
                      {Math.round(row.riskScore * 100)}%
                    </Badge>
                  </td>
                  <td className="max-w-xs py-2.5 text-xs text-slate-500">
                    {row.topReasons.join(" · ")}
                  </td>
                  <td className="py-2.5 text-slate-600">
                    {row.lastOrderDaysAgo}d ago
                  </td>
                  <td className="py-2.5 text-slate-600">
                    {formatCurrency(row.ltv)}
                  </td>
                  <td className="py-2.5 text-right">
                    <Button
                      variant={row.customerId === "marcus" ? "ai" : "outline"}
                      size="sm"
                      onClick={() => runRescue(row.customerId)}
                      title={
                        row.customerId === "marcus"
                          ? "Generate an AI churn rescue for Marcus"
                          : "Live rescue is wired for the Marcus demo persona"
                      }
                    >
                      <ShieldAlert className="h-3.5 w-3.5" />
                      Rescue
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
