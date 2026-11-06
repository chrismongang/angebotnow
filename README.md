# AngebotNow – KI-gestützte Angebote für Handwerker

**[angebotnow.de](https://angebotnow.de)**

Handwerker fotografieren die Baustelle, beschreiben den Auftrag in ein paar Sätzen, und AngebotNow erstellt daraus ein fertiges, gebrandetes Angebot als PDF. Es enthält Positionen, Preise, MwSt. und Unterschriftsfeld und ist direkt vom Handy aus versendbar.

## Features

- **KI-Angebotserstellung:** OpenAI (Text und Vision) wertet Fotos und Beschreibung aus und erzeugt daraus Leistungspositionen.
- **PDF-Export:** professionelles Layout mit Firmenlogo, Bauvorhaben-Adresse, Gültigkeitsdauer und Reverse-Charge nach § 13b UStG.
- **Abos und Paywall:** Free- und Pro-Plan über Stripe Subscriptions inklusive Webhooks.
- **Empfehlungsprogramm:** Gratis-Angebote für Einladende und Eingeladene.
- **Mobile First:** für den Einsatz auf der Baustelle gebaut.
- **Auth und E-Mails:** Google OAuth und E-Mail-Login über NextAuth, Transaktionsmails über Resend.
- **Growth:** Landingpages, Meta Pixel und Conversions API, In-App-Feedback.

## Tech Stack

| Bereich | Technologie |
|---|---|
| App | Next.js 15 (App Router), React, TypeScript, Tailwind CSS |
| Daten | PostgreSQL (Neon), Prisma ORM |
| KI | OpenAI API |
| Zahlungen | Stripe |
| Auth | NextAuth.js (Google OAuth) |
| Dateien und PDF | Cloudinary, pdf-lib |
| Qualität | Vitest, ESLint, GitHub Actions CI, Sentry |
| Hosting | Vercel |

## Lokal starten

```bash
npm install --legacy-peer-deps
cp .env.example .env.local   # Werte eintragen, siehe unten
npx prisma migrate deploy
npm run dev
```

Benötigte Umgebungsvariablen: `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `OPENAI_API_KEY`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `RESEND_API_KEY` sowie die Stripe-Keys für Abos.

```bash
npm run build   # Production-Build
npm run lint
npm test        # Vitest
```

## Projektstruktur

```
src/
  app/           Seiten und API-Routen (Angebote, Einstellungen, Admin, Auth, Stripe-Webhooks)
  components/    UI-Komponenten
  lib/           KI-Integration, PDF-Generierung, Stripe, E-Mail, Auth
prisma/          Schema und Migrationen
docs/            Feature- und Architektur-Dokumentation
```

Ausführliche Dokumentation zu einzelnen Features liegt in [docs/](docs/README.md). Änderungen stehen im [CHANGELOG](CHANGELOG.md).

---

Konzipiert und entwickelt von [Chris Mongang](https://www.chrismongang.com).
