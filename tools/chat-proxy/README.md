# Tutor chat proxy

The study modules get an "Ask the tutor" panel from `assets/chat.js`.
It never talks to OpenRouter directly; it posts to this proxy, which holds the API key.

## Run locally

```
node tools/chat-proxy/server.js
```

Serves the whole site plus `/chat` at http://localhost:8787 and reads the key and model from the repo's `.env`:

```
OPENROUTER_API_KEY=sk-or-...
CHAT_MODEL=z-ai/glm-5.3-flash
```

## Host it for the GitHub Pages site

GitHub Pages is static, so the proxy runs as a Cloudflare Worker (free tier is plenty).

```
cd tools/chat-proxy
npx wrangler login
npx wrangler secret put OPENROUTER_API_KEY
npx wrangler deploy
```

Paste the printed `https://study-chat.<you>.workers.dev` URL into `HOSTED_ENDPOINT` at the top of `assets/chat.js` and push.
`wrangler.toml` sets the model; only page origins listed in `handler.js` (`DEFAULT_ORIGINS`) or the `ALLOWED_ORIGINS` var may call it.

## Change the model

Set `CHAT_MODEL` in `.env` (local) or `wrangler.toml` (hosted).
Run `node tools/chat-bench/bench.mjs out.md <model>` first and read the report; correctness alone is not the bar, the explanations have to teach.
