# TradeAI — AI-Powered Trade Analysis Platform

A professional, dark-theme fintech platform combining real-time AI trading signals, paper trading, news sentiment analysis, and an AI chat assistant.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080, proxied at `/api`)
- `pnpm --filter @workspace/trade-platform run dev` — run the frontend (port 24463, proxied at `/`)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string, `SESSION_SECRET` — HMAC signing key
- AI: `AI_INTEGRATIONS_OPENAI_BASE_URL` + `AI_INTEGRATIONS_OPENAI_API_KEY` — set via Replit AI integration (gpt-4.1)

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite, Tailwind CSS, shadcn/ui, Recharts, Wouter, React Query (Orval-generated hooks)
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- AI: OpenAI via Replit AI Integration proxy
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/trade-platform/` — React + Vite frontend
  - `src/pages/` — Landing, Login, Dashboard, Scanner, Watchlist, Portfolio, News, Chat, Settings
  - `src/components/layout.tsx` — Sidebar + responsive mobile header
  - `src/lib/auth.tsx` — AuthProvider + useAuth hook (JWT stored in localStorage)
  - `src/index.css` — CSS custom properties (dark navy theme, neon green/red accents)
- `artifacts/api-server/` — Express API server
  - `src/routes/` — auth, dashboard, scanner, watchlist, portfolio, trades, news, chat, notifications
  - `src/lib/marketData.ts` — 22 symbols (NASDAQ, NYSE, BIST, CRYPTO, FOREX) with live-ish prices
  - `src/lib/auth.ts` — HMAC-SHA256 token creation/verification
- `lib/db/` — Drizzle schema + PostgreSQL connection
  - Schema: users, ai_signals, watchlist, portfolio, positions, trades, news_articles, chat_messages, notifications
- `lib/api-spec/` — OpenAPI spec (source of truth for all endpoints)
- `lib/api-client-react/` — Orval-generated React Query hooks + Zod schemas
- `lib/api-zod/` — Zod validation schemas for request bodies (server-side)

## Architecture decisions

- Contract-first API: OpenAPI spec → Orval codegen → typed React Query hooks + Zod schemas. Never write hooks manually.
- Custom HMAC-SHA256 token auth (not JWT lib) — token format: `userId:timestamp:signature`
- Market data is simulated (no real exchange connection) — prices update on API call with realistic volatility
- AI signals computed server-side and stored in DB; scanner endpoint sorts by aiScore descending
- Chat uses OpenAI gpt-4.1 via Replit AI integration proxy (no API key needed from user)
- Paper trading: each user gets $100k paper balance + $50k portfolio on registration

## Product

- **Landing** — premium dark hero page with feature grid
- **Auth** — glassmorphism login/signup with tabbed UI
- **Dashboard** — portfolio stats, performance area chart, top movers
- **AI Scanner** — filterable signal table (STRONG_BUY → RISKY) with expandable analysis rows
- **Watchlist** — tracked symbols list with add/remove
- **Portfolio** — open positions + trade history tabs
- **News** — AI sentiment-tagged news feed + pie chart summary
- **AI Chat** — ChatGPT-like interface powered by GPT-4.1
- **Settings** — profile, risk level, notification prefs

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Do NOT run `pnpm dev` at workspace root — use `restart_workflow` instead
- `pnpm --filter @workspace/<pkg> run typecheck` to check a single package
- Market data prices are simulated; scanner signals are recalculated every API call (no caching)
- Auth token is plain `userId:timestamp:HMAC` — check `src/lib/auth.ts` before changing format
- API routes are registered under `/api` prefix in `app.ts` — route files use paths without the `/api` prefix

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
