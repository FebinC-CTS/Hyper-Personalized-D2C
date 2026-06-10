import { useMemo } from "react";
import { Package, Repeat, TrendingDown, TrendingUp } from "lucide-react";
import { usePersona } from "@/store";
import { ordersByPersona } from "@/data/orders";
import { formatCurrency } from "@/lib/utils";

export function HomeStats() {
  const { persona } = usePersona();

  const stats = useMemo(() => {
    const orders = ordersByPersona(persona.id);
    const totalSpend = orders.reduce((sum, o) => sum + o.total, 0);
    const avg = orders.length ? totalSpend / orders.length : 0;
    return {
      orders: orders.length,
      totalSpend,
      avg,
      churnRisk: persona.churnRisk,
    };
  }, [persona]);

  const tiles = [
    {
      label: "Orders (6 mo)",
      value: stats.orders.toString(),
      icon: Package,
      color: "text-slate-700",
    },
    {
      label: "Total spend",
      value: formatCurrency(stats.totalSpend),
      icon: TrendingUp,
      color: "text-aqua-600",
    },
    {
      label: "Avg order value",
      value: formatCurrency(stats.avg),
      icon: Repeat,
      color: "text-primo-700",
    },
    {
      label: "Churn risk",
      value: `${Math.round(stats.churnRisk * 100)}%`,
      icon: TrendingDown,
      color:
        stats.churnRisk > 0.5
          ? "text-coral-600"
          : stats.churnRisk > 0.25
          ? "text-amber-600"
          : "text-aqua-600",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {tiles.map((t) => {
        const Icon = t.icon;
        return (
          <div
            key={t.label}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
                {t.label}
              </span>
              <Icon className={`h-4 w-4 ${t.color}`} />
            </div>
            <div className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
              {t.value}
            </div>
          </div>
        );
      })}
    </div>
  );
}
