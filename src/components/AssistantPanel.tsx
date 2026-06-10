import { useEffect, useRef, useState } from "react";
import { MessageSquare, Send, Sparkles, X } from "lucide-react";
import { useAssistant, usePersona } from "@/store";
import { claudeKeyConfigured, stream } from "@/lib/claude";
import { assistantSystemPrompt } from "@/lib/prompts";
import { products } from "@/data/products";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { ChatMessage } from "@/types";

const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const SUGGESTIONS = [
  "What sparkling water do you recommend for me?",
  "When is my next delivery?",
  "Can I make my orders more sustainable?",
];

export function AssistantPanel() {
  const { open, closeAssistant, messages, appendMessage, updateMessage } =
    useAssistant();
  const { persona } = usePersona();
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, open]);

  const send = async (raw: string) => {
    const q = raw.trim();
    if (!q || busy) return;
    setInput("");

    const userMsg: ChatMessage = { id: uid(), role: "user", content: q };
    appendMessage(userMsg);

    // Snapshot the conversation that exists *before* the placeholder.
    const apiMessages = [...messages, userMsg].map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const asstId = uid();
    appendMessage({ id: asstId, role: "assistant", content: "", pending: true });
    setBusy(true);

    try {
      let acc = "";
      for await (const chunk of stream(apiMessages, {
        system: assistantSystemPrompt(persona, products),
        maxTokens: 700,
        temperature: 0.6,
      })) {
        acc += chunk;
        updateMessage(asstId, { content: acc, pending: true });
      }
      updateMessage(asstId, {
        content: acc || "(no response)",
        pending: false,
      });
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      updateMessage(asstId, {
        content: `Sorry — I couldn't reach Claude. ${message}`,
        pending: false,
      });
    } finally {
      setBusy(false);
    }
  };

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-sm"
        onClick={closeAssistant}
      />
      <aside className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l border-slate-200 bg-white shadow-2xl animate-[slideIn_0.25s_ease]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-xl bg-ai-gradient bg-[length:200%_200%] animate-ai-pulse text-white">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-900">
                Primo IQ Assistant
              </div>
              <div className="text-[11px] text-slate-500">
                Helping {persona.greetingName}
              </div>
            </div>
          </div>
          <button
            onClick={closeAssistant}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close assistant"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
          {messages.length === 0 && (
            <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
              <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-primo-700">
                <MessageSquare className="h-3.5 w-3.5" />
                Ask me anything
              </div>
              <p className="mt-1.5 text-sm text-slate-600">
                I know {persona.greetingName}'s orders, preferences, and the full
                Primo Brands catalog. Try one of these:
              </p>
              <div className="mt-3 flex flex-col gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    disabled={!claudeKeyConfigured}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-left text-sm text-slate-700 transition-colors hover:border-primo-300 hover:bg-primo-50 disabled:opacity-50"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m) => (
            <div
              key={m.id}
              className={cn(
                "flex",
                m.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                  m.role === "user"
                    ? "bg-primo-900 text-white"
                    : "border border-slate-200 bg-white text-slate-700"
                )}
              >
                {m.content || (m.pending ? "…" : "")}
                {m.pending && m.content && (
                  <span className="ml-0.5 inline-block h-3 w-1.5 animate-pulse bg-primo-400 align-middle" />
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Composer */}
        <div className="border-t border-slate-200 p-4">
          {!claudeKeyConfigured && (
            <p className="mb-2 text-xs text-coral-600">
              Add ANTHROPIC_API_KEY to .env.local to chat with Claude.
            </p>
          )}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void send(input);
            }}
            className="flex items-center gap-2"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={!claudeKeyConfigured || busy}
              placeholder={busy ? "Thinking…" : "Message the assistant…"}
              className="flex-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition-colors focus:border-primo-400 focus:ring-2 focus:ring-primo-500/20 disabled:opacity-60"
            />
            <Button
              type="submit"
              variant="ai"
              size="icon"
              disabled={!claudeKeyConfigured || busy || !input.trim()}
              aria-label="Send"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </aside>
    </>
  );
}
