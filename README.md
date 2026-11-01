# Compliance Department Dashboard

KRA & KPI management system for the Compliance Department: hierarchical scoring engine, operational registers, SLA tracking, approval workflows and an audit trail.

It is a single Next.js (App Router) app. The UI is a client-rendered single-page app (`src/App.tsx`), and the API is served by route handlers under `src/app/api`.

## Run locally

**Prerequisites:** Node.js 20.9 or later

1. Install dependencies:
   `npm install`
2. Copy `.env.example` to `.env.local` and set `GEMINI_API_KEY` (optional; the AI advisor falls back to offline analysis without it) and `SESSION_SECRET`.
3. Start the dev server:
   `npm run dev`, then open http://localhost:3000

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Development server with hot reload |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run lint` | Type-check (`tsc --noEmit`) |

## Project layout

```
src/app/layout.tsx        Root layout and page metadata
src/app/page.tsx          Renders the client-only dashboard
src/app/api/**/route.ts   API route handlers (one per path)
src/server/               In-memory database, scoring engine, Gemini client, auth and request helpers
src/components/           Dashboard views
src/services/api.ts       Browser API client
```

## Deployment notes

- Data lives in an in-memory database that is seeded on start. It resets on every restart or redeploy, and on serverless hosts each instance has its own copy.
- Set `SESSION_SECRET` to the same value on every instance so sessions stay valid across instances.
- On Vercel, request bodies are capped at about 4.5 MB. Evidence uploads are sent base64-encoded (the UI allows files up to 3 MB, which is about 4 MB once encoded), so they come close to that limit.
