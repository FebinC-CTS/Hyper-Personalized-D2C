import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  LineChart,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
} from "lucide-react";
import { usePersona, useSession } from "@/store";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { PersonaId } from "@/types";

const segmentBadge = (segment: string) => {
  if (segment === "churning") return <Badge variant="warning">At-risk</Badge>;
  if (segment === "office") return <Badge variant="success">B2B</Badge>;
  return <Badge variant="outline">Residential</Badge>;
};

export default function Landing() {
  const { persona, personas } = usePersona();
  const { enterAsCustomer, enterAsAdmin } = useSession();
  const navigate = useNavigate();
  const [step, setStep] = useState<"choose" | "persona">("choose");

  const chooseCustomer = (id: PersonaId) => {
    enterAsCustomer(id);
    navigate("/home");
  };

  const chooseAdmin = () => {
    enterAsAdmin();
    navigate("/admin");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col justify-center px-6 py-16">
        {/* Brand */}
        <div className="mb-10">
          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-primo-900 text-white">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="text-lg font-semibold text-slate-900">
              Primo <span className="text-primo-700">IQ</span>
            </span>
          </div>
          <h1 className="mt-8 max-w-2xl text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
            A hyper-personalized D2C beverage experience, powered by generative
            AI.
          </h1>
          <p className="mt-4 max-w-xl text-base text-slate-600">
            {step === "choose"
              ? "Choose how you want to enter the demo — as a customer shopping the storefront, or as staff in the admin console."
              : "Pick a persona to enter the storefront from their lens. Every screen adapts in real time around who's signed in."}
          </p>
        </div>

        {/* Step 1 — portal chooser */}
        {step === "choose" && (
          <div className="grid gap-4 md:grid-cols-2">
            <button
              onClick={() => setStep("persona")}
              className="group relative flex flex-col rounded-2xl border border-slate-200 bg-white p-7 text-left shadow-soft transition-all hover:-translate-y-0.5 hover:border-primo-300 hover:shadow-lift"
            >
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primo-50 text-primo-700">
                <ShoppingBag className="h-6 w-6" />
              </div>
              <div className="mt-5 text-xl font-semibold text-slate-900">
                Customer experience
              </div>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Shop the storefront with AI-personalized recommendations, natural
                language product discovery, smart reordering, and a live
                shopping assistant.
              </p>
              <div className="mt-6 flex items-center gap-1 text-sm font-medium text-primo-700">
                Choose a persona
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </div>
            </button>

            <button
              onClick={chooseAdmin}
              className="group relative flex flex-col rounded-2xl border border-slate-200 bg-white p-7 text-left shadow-soft transition-all hover:-translate-y-0.5 hover:border-primo-300 hover:shadow-lift"
            >
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primo-900 text-white">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div className="mt-5 flex items-center gap-2 text-xl font-semibold text-slate-900">
                Admin console
                <Badge variant="default">Staff</Badge>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Monitor the subscriber base — KPIs, acquisition funnel, cohort
                retention, AI insights, churn-risk monitoring, and catalog
                management.
              </p>
              <div className="mt-6 flex items-center gap-1 text-sm font-medium text-primo-700">
                <LineChart className="h-4 w-4" />
                Enter console
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </div>
            </button>
          </div>
        )}

        {/* Step 2 — persona picker */}
        {step === "persona" && (
          <>
            <button
              onClick={() => setStep("choose")}
              className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-slate-500 transition-colors hover:text-slate-800"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to portals
            </button>
            <div className="grid gap-4 md:grid-cols-3">
              {personas.map((p) => (
                <button
                  key={p.id}
                  onClick={() => chooseCustomer(p.id)}
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
          </>
        )}

        <div className="mt-12 flex items-center gap-2 text-xs text-slate-400">
          <Sparkles className="h-3 w-3" />
          Built for the Primo Brands hackathon · No real customer data
        </div>
      </div>
    </div>
  );
}
