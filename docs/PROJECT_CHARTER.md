# Projekt-Charta – AngebotNow
Ziel: Foto + kurze Infos → KI erstellt Angebotsentwurf → PDF.
Plattform: Next.js 14 (App Router), TypeScript strict, Tailwind+shadcn, Prisma+Postgres,
OpenAI (server-only), PDFKit, Zod, Sentry, Vitest/Playwright, Vercel.

Kernrouten:
- /(landing) – später
- /auth (Sign-in)
- /dashboard – Schnellstartkarte (Upload, Projektinfo, Kunde)
- /angebote – Liste mit Status-Badges
- /angebot/[id] – Detail (PDF, Kunde, Positionen)

Nichtziele P0: Zahlungen (Stripe), Mobile Wrapper. Erst Kernflow stabil.

