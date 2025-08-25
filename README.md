This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## AI Provider Configuration

The app supports two AI providers:

### Mock AI (Default)
- No configuration required
- Generates sample offer positions
- Used when `USE_OPENAI` is not set or `false`

### OpenAI
To enable OpenAI AI processing:

1. Set environment variables:
```bash
USE_OPENAI=true
OPENAI_API_KEY=your-openai-api-key
```

2. The app will use GPT-4o-mini to generate offer positions based on project descriptions.

## Manueller Testplan (5min)

### 1. Angebotserstellung testen
1. `/dashboard` öffnen
2. Bild hochladen (JPG/PNG, max. 10MB)
3. Projektinfo eintragen (z.B. "Badrenovierung mit Fliesenarbeiten")
4. Kundenname eingeben
5. "Angebot erstellen" klicken
6. **Erwartung**: Erfolgsmeldung, Weiterleitung zur Angebote-Übersicht

### 2. PDF-Download testen
1. `/angebote` → Angebot in der Liste finden
2. "Details anzeigen" klicken
3. "PDF herunterladen" klicken
4. **Erwartung**: PDF-Datei öffnet sich im Browser/Download

### 3. AI-Provider testen

#### Mit Mock-AI (Standard)
- `USE_OPENAI` nicht gesetzt oder `false`
- **Erwartung**: Mock-Inhalte sichtbar ("Fliesenlegen", "Entsorgung")
- **Gesamtbetrag**: 1746 € (fest vorgegeben)

#### Mit OpenAI
- `USE_OPENAI=true` und `OPENAI_API_KEY` gesetzt
- **Erwartung**: Plausible, dynamische Inhalte basierend auf Projektinfo
- **Server-Log**: Keine Fehler, erfolgreiche API-Calls

### 4. PDF-Generierung testen
```bash
# PDF-Test ausführen
npx vitest --config vitest.pdf.config.ts --run src/test/pdf.generate.smoke.test.ts
```
**Erwartung**: ✅ PDF generated successfully: ~1459 bytes

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
