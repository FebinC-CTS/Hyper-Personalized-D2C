import { useMemo } from "react";
import { Sparkles } from "lucide-react";
import { usePersona } from "@/store";
import { recommendProducts } from "@/lib/utils";
import { RecommendationCard } from "@/components/RecommendationCard";

export function RecommendationCarousel() {
  const { persona } = usePersona();
  const recs = useMemo(() => recommendProducts(persona.id, 6), [persona.id]);

  return (
    <section>
      <div className="mb-4 flex items-end justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">
            Recommended for you
          </h2>
          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500">
            <Sparkles className="h-3 w-3 text-primo-700" />
            Scored against your behavior, history, and stated preferences
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {recs.map((rec) => (
          <RecommendationCard key={rec.product.id} rec={rec} />
        ))}
      </div>
    </section>
  );
}
