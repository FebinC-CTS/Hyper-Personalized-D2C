import { defineConfig, loadEnv } from "vite";
import type { Plugin } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

// We don't use Vite's built-in `server.proxy` because its underlying
// http-proxy forwards the browser's Origin/Referer headers, which Anthropic
// then treats as a CORS request and rejects under our org policy. Instead,
// we mount a tiny custom middleware that uses fetch() — full control over
// the outbound headers, transparent streaming pass-through.
function anthropicProxyPlugin(apiKey: string | undefined): Plugin {
  return {
    name: "primo-iq-anthropic-proxy",
    configureServer(server) {
      server.middlewares.use("/api/anthropic", async (req, res) => {
        const targetPath = req.url ?? "/";
        const target = "https://api.anthropic.com" + targetPath;

        if (!apiKey) {
          res.statusCode = 500;
          res.setHeader("content-type", "application/json");
          res.end(
            JSON.stringify({
              error: {
                message:
                  "ANTHROPIC_API_KEY is missing on the dev server. Add it to .env.local and restart `npm run dev`.",
              },
            })
          );
          return;
        }

        try {
          const chunks: Buffer[] = [];
          for await (const chunk of req) {
            chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
          }
          const body = chunks.length ? Buffer.concat(chunks) : undefined;

          const upstream = await fetch(target, {
            method: req.method,
            headers: {
              "content-type": "application/json",
              "x-api-key": apiKey,
              "anthropic-version": "2023-06-01",
            },
            body,
          });

          res.statusCode = upstream.status;
          upstream.headers.forEach((value, key) => {
            // Drop hop-by-hop / encoding headers — fetch already decoded.
            if (
              key === "content-encoding" ||
              key === "content-length" ||
              key === "transfer-encoding" ||
              key === "connection"
            ) {
              return;
            }
            res.setHeader(key, value);
          });

          if (!upstream.body) {
            res.end();
            return;
          }

          const reader = upstream.body.getReader();
          while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            res.write(Buffer.from(value));
          }
          res.end();
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          res.statusCode = 502;
          res.setHeader("content-type", "application/json");
          res.end(
            JSON.stringify({
              error: { message: `Proxy failure: ${message}` },
            })
          );
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const anthropicKey = env.ANTHROPIC_API_KEY;

  if (anthropicKey) {
    process.stdout.write(
      `[primo-iq] Anthropic proxy ready (key length=${anthropicKey.length}, starts="${anthropicKey.slice(0, 7)}…")\n`
    );
  } else {
    process.stdout.write(
      "[primo-iq] WARNING: ANTHROPIC_API_KEY missing from .env.local — proxy will return 500.\n"
    );
  }

  return {
    plugins: [anthropicProxyPlugin(anthropicKey), react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
