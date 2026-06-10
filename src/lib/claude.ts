import { useCallback, useEffect, useRef, useState } from "react";

// Requests are routed through Vite's dev-server proxy (see vite.config.ts).
// The actual API key lives in .env.local as ANTHROPIC_API_KEY (no VITE_
// prefix) and is injected server-side, never reaching the browser bundle.
// VITE_CLAUDE_PROXY_READY is a flag the dev server sets so the UI can render
// a friendly hint when the key is missing on the server.
const DEFAULT_MODEL = "claude-sonnet-4-6";
const API_URL = "/api/anthropic/v1/messages";

export const claudeKeyConfigured =
  (import.meta.env.VITE_CLAUDE_PROXY_READY ?? "true") === "true";

export class ClaudeError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = "ClaudeError";
    this.status = status;
  }
}

export interface ClaudeMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ClaudeOptions {
  system?: string;
  maxTokens?: number;
  temperature?: number;
  model?: string;
  signal?: AbortSignal;
}

function buildBody(
  messages: ClaudeMessage[],
  opts: ClaudeOptions,
  stream: boolean
) {
  return JSON.stringify({
    model: opts.model ?? DEFAULT_MODEL,
    max_tokens: opts.maxTokens ?? 512,
    temperature: opts.temperature ?? 0.7,
    system: opts.system,
    stream,
    messages,
  });
}

const PROXY_HEADERS: HeadersInit = {
  "Content-Type": "application/json",
};

async function readErrorBody(res: Response): Promise<string> {
  const text = await res.text().catch(() => "");
  if (res.status === 401) {
    return "Anthropic returned 401. Ensure ANTHROPIC_API_KEY is set in .env.local (no VITE_ prefix) and that you restarted `npm run dev` after adding it.";
  }
  return `Claude API ${res.status}: ${text.slice(0, 200)}`;
}

export async function complete(
  messages: ClaudeMessage[],
  opts: ClaudeOptions = {}
): Promise<string> {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: PROXY_HEADERS,
    body: buildBody(messages, opts, false),
    signal: opts.signal,
  });

  if (!res.ok) {
    throw new ClaudeError(await readErrorBody(res), res.status);
  }

  const data = await res.json();
  const block = data?.content?.[0];
  if (!block || block.type !== "text") {
    throw new ClaudeError("Unexpected Claude response shape.");
  }
  return block.text as string;
}

export async function* stream(
  messages: ClaudeMessage[],
  opts: ClaudeOptions = {}
): AsyncGenerator<string> {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: PROXY_HEADERS,
    body: buildBody(messages, opts, true),
    signal: opts.signal,
  });

  if (!res.ok || !res.body) {
    throw new ClaudeError(await readErrorBody(res), res.status);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    // SSE events are separated by blank lines.
    let idx;
    while ((idx = buffer.indexOf("\n\n")) !== -1) {
      const rawEvent = buffer.slice(0, idx);
      buffer = buffer.slice(idx + 2);

      for (const line of rawEvent.split("\n")) {
        if (!line.startsWith("data:")) continue;
        const payload = line.slice(5).trim();
        if (!payload || payload === "[DONE]") continue;
        try {
          const evt = JSON.parse(payload);
          if (
            evt.type === "content_block_delta" &&
            evt.delta?.type === "text_delta"
          ) {
            yield evt.delta.text as string;
          }
        } catch {
          // ignore malformed chunks
        }
      }
    }
  }
}

// Pulls the first {...} JSON object out of a model response, tolerating any
// stray prose or ```json fences the model may add despite instructions.
export function parseJsonObject<T = unknown>(text: string): T {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end < start) {
    throw new Error("No JSON object found in response.");
  }
  return JSON.parse(text.slice(start, end + 1)) as T;
}

// --- Cache + hooks -------------------------------------------------------

const memoCache = new Map<string, string>();

export function getCached(key: string): string | undefined {
  return memoCache.get(key);
}

export function setCached(key: string, value: string) {
  memoCache.set(key, value);
}

export interface UseClaudeTextOptions {
  cacheKey?: string;
  enabled?: boolean;
}

export interface UseClaudeTextResult {
  text: string;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

// Auto-fetch a one-shot Claude completion when the component mounts or
// `cacheKey` changes. Cached responses skip the network entirely.
export function useClaudeText(
  build: () => { messages: ClaudeMessage[]; options?: ClaudeOptions },
  { cacheKey, enabled = true }: UseClaudeTextOptions = {}
): UseClaudeTextResult {
  const [text, setText] = useState<string>(() =>
    cacheKey ? memoCache.get(cacheKey) ?? "" : ""
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const tokenRef = useRef(0);

  const run = useCallback(async () => {
    const token = ++tokenRef.current;
    setError(null);
    if (cacheKey) {
      const hit = memoCache.get(cacheKey);
      if (hit) {
        setText(hit);
        return;
      }
    }
    setLoading(true);
    try {
      const { messages, options } = build();
      const out = await complete(messages, options);
      if (token !== tokenRef.current) return;
      const trimmed = out.trim();
      setText(trimmed);
      if (cacheKey) memoCache.set(cacheKey, trimmed);
    } catch (e) {
      if (token !== tokenRef.current) return;
      const message = e instanceof Error ? e.message : String(e);
      setError(message);
    } finally {
      if (token === tokenRef.current) setLoading(false);
    }
  }, [build, cacheKey]);

  useEffect(() => {
    if (!enabled) return;
    void run();
    return () => {
      tokenRef.current++;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cacheKey, enabled]);

  return { text, loading, error, refetch: run };
}

// Lazy variant — caller decides when to fire (e.g. tooltip on click).
export function useLazyClaudeText(
  build: () => { messages: ClaudeMessage[]; options?: ClaudeOptions },
  cacheKey?: string
) {
  const [text, setText] = useState<string>(() =>
    cacheKey ? memoCache.get(cacheKey) ?? "" : ""
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fire = useCallback(async () => {
    if (cacheKey) {
      const hit = memoCache.get(cacheKey);
      if (hit) {
        setText(hit);
        return;
      }
    }
    setError(null);
    setLoading(true);
    try {
      const { messages, options } = build();
      const out = await complete(messages, options);
      const trimmed = out.trim();
      setText(trimmed);
      if (cacheKey) memoCache.set(cacheKey, trimmed);
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [build, cacheKey]);

  return { text, loading, error, fire };
}
