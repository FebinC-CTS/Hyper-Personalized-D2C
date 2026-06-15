import { ShieldAlert } from "lucide-react";
import { usePersona, useChurn } from "@/store";
import { churnRiskTable } from "@/data/analytics";
import { cn, formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { PersonaId } from "@/types";

const riskBadge = (risk: number) => {
  if (risk >= 0.65) return <Badge variant="warning">High</Badge>;
  if (risk >= 0.4) return <Badge variant="default">Medium</Badge>;
  return <Badge variant="success">Low</Badge>;
};

export default function Customers() {
  const { personas, setPersonaId } = usePersona();
  const { openChurn } = useChurn();

  // Open the AI churn-rescue for a known persona profile.
  const rescuePersona = (id: PersonaId) => {
    setPersonaId(id);
    openChurn();
  };

  // The monitor table includes rows that don't map to a demo persona; only
  // Marcus is wired to a live AI rescue, matching the available profile data.
  const rescueRow = (customerId: string) => {
    if (customerId === "marcus") setPersonaId("marcus");
    openChurn();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
          Customers
        </h1>
        <p className="mt-1 text-slate-600">
          Subscriber profiles and churn-risk monitoring with AI-generated
          retention rescues.
        </p>
      </div>

      {/* Subscriber profiles */}
      <Card>
        <CardHeader>
          <CardTitle>Subscriber profiles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {personas.map((p) => {
              const risk = p.churnRisk;
              return (
                <div
                  key={p.id}
                  className="flex flex-col rounded-2xl border border-slate-200 bg-white p-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="grid h-10 w-10 place-items-center rounded-xl bg-primo-900 text-sm font-semibold text-white">
                        {p.avatarInitials}
                      </span>
                      <div className="leading-tight">
                        <div className="text-sm font-semibold text-slate-900">
                          {p.name}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {p.role} · {p.location}
                        </div>
                      </div>
                    </div>
                    {riskBadge(risk)}
                  </div>

                  <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-xl bg-slate-50 p-2">
                      <dt className="text-[10px] uppercase tracking-wider text-slate-400">
                        Risk
                      </dt>
                      <dd
                        className={cn(
                          "mt-0.5 text-sm font-semibold",
                          risk >= 0.65 ? "text-coral-600" : "text-slate-800"
                        )}
                      >
                        {Math.round(risk * 100)}%
                      </dd>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-2">
                      <dt className="text-[10px] uppercase tracking-wider text-slate-400">
                        Tenure
                      </dt>
                      <dd className="mt-0.5 text-sm font-semibold text-slate-800">
                        {p.tenureMonths}mo
                      </dd>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-2">
                      <dt className="text-[10px] uppercase tracking-wider text-slate-400">
                        Last order
                      </dt>
                      <dd className="mt-0.5 text-sm font-semibold text-slate-800">
                        {p.lastOrderDaysAgo}d
                      </dd>
                    </div>
                  </dl>

                  <p className="mt-3 line-clamp-3 flex-1 text-xs leading-relaxed text-slate-600">
                    {p.bio}
                  </p>

                  <Button
                    variant={risk >= 0.65 ? "ai" : "outline"}
                    size="sm"
                    className="mt-4 w-full"
                    onClick={() => rescuePersona(p.id)}
                  >
                    <ShieldAlert className="h-3.5 w-3.5" />
                    Generate AI rescue
                  </Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Churn risk monitor */}
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
                      onClick={() => rescueRow(row.customerId)}
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
