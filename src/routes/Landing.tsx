import { useNavigate } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import { usePersona } from "@/store";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { PersonaId } from "@/types";

const segmentBadge = (segment: string) => {
  if (segment === "churning")
    return <Badge variant="warning">At-risk</Badge>;
  if (segment === "office") return <Badge variant="success">B2B</Badge>;
  return <Badge variant="outline">Residential</Badge>;
};

export default function Landing() {
  const { persona, personas, setPersonaId } = usePersona();
  const navigate = useNavigate();

  const choose = (id: PersonaId) => {
    setPersonaId(id);
    navigate("/home");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col justify-center px-6 py-16">
        <div className="mb-12">
          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-primo-900 text-white">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="text-lg font-semibold text-slate-900">
              Primo <span className="text-primo-700">IQ</span>
            </span>
          </div>
          <h1 className="mt-8 max-w-2xl text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
            A hyper-personalized D2C beverage experience, powered by
            generative AI.
          </h1>
          <p className="mt-4 max-w-xl text-base text-slate-600">
            Pick a persona to enter the demo from their lens. Every screen
            adapts in real time — recommendations, copy, and the assistant
            all reshape around who's signed in.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {personas.map((p) => (
            <button
              key={p.id}
              onClick={() => choose(p.id)}
              className={cn(
                "group relative flex flex-col rounded-2xl border bg-white p-6 text-left shadow-soft transition-all hover:-translate-y-0.5 hover:border-primo-300 hover:shadow-lift",
                p.id === persona.id
                  ? "border-primo-500 ring-2 ring-primo-500/20"
                  : "border-slate-200"
              )}
            >
              <div className="flex items-center justify-between">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-primo-900 text-sm font-semibold text-white">
                  {p.avatarInitials}
                </div>
                {segmentBadge(p.segment)}
              </div>
              <div className="mt-4">
                <div className="text-base font-semibold text-slate-900">
                  {p.name}
                </div>
                <div className="text-sm text-slate-500">
                  {p.role} · {p.location}
                </div>
              </div>
              <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-slate-600">
                {p.bio}
              </p>
              <div className="mt-5 flex items-center gap-1 text-sm font-medium text-primo-700">
                Enter as {p.name.split(" ")[0]}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </div>
            </button>
          ))}
        </div>

        <div className="mt-12 flex items-center gap-2 text-xs text-slate-400">
          <Sparkles className="h-3 w-3" />
          Built for the Primo Brands hackathon · No real customer data
        </div>
      </div>
    </div>
  );
}
