# Vercel Deployment Checklist

## ✅ Pre-Deployment Checks

### 1. Build-Tests
- [x] `npm run build` erfolgreich
- [x] Keine TypeScript-Fehler
- [x] Keine ESLint-Fehler
- [x] Alle Dependencies installiert

### 2. Code-Qualität
- [x] HTML-Links durch Next.js Link-Komponenten ersetzt
- [x] Unescaped quotes korrigiert
- [x] useEffect Dependencies korrekt
- [x] Suspense für useSearchParams implementiert

### 3. Umgebungsvariablen
- [x] `DATABASE_URL` konfiguriert (Neon PostgreSQL)
- [x] `NEXTAUTH_SECRET` gesetzt
- [x] `NEXTAUTH_URL` für Produktion konfiguriert
- [x] `GOOGLE_CLIENT_ID` und `GOOGLE_CLIENT_SECRET` gesetzt
- [x] `OPENAI_API_KEY` konfiguriert
- [x] `CLOUDINARY_*` Variablen gesetzt

## 🚀 Deployment Steps

### 1. Vercel Setup
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy to Vercel
vercel --prod
```

### 2. Umgebungsvariablen in Vercel setzen
Gehe zu Vercel Dashboard → Project Settings → Environment Variables:

```
DATABASE_URL=postgresql://user:password@host/database
SHADOW_DATABASE_URL=postgresql://user:password@host/shadow_database
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=https://your-domain.vercel.app
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
OPENAI_API_KEY=sk-your-openai-api-key
USE_OPENAI=true
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
RESEND_API_KEY=re_your-resend-api-key
SENTRY_DSN=https://placeholder@placeholder.ingest.sentry.io/placeholder
NEXT_PUBLIC_SENTRY_DSN=https://placeholder@placeholder.ingest.sentry.io/placeholder
```

### 3. Google OAuth für Produktion konfigurieren
1. Gehe zu [Google Cloud Console](https://console.cloud.google.com/)
2. Wähle dein Projekt
3. Gehe zu "APIs & Services" → "Credentials"
4. Bearbeite deine OAuth 2.0 Client ID
5. Füge Produktions-Redirect URI hinzu:
   ```
   https://your-domain.vercel.app/api/auth/callback/google
   ```

### 4. Datenbank-Migrationen
```bash
# Lokal testen
npx prisma migrate deploy

# In Vercel (falls nötig)
vercel env pull .env.local
npx prisma migrate deploy
```

## 🔧 Post-Deployment Tests

### 1. Funktionalitätstests
- [ ] Startseite lädt korrekt
- [ ] Google OAuth Login funktioniert
- [ ] Benutzerdaten werden gespeichert
- [ ] Angebote können erstellt werden
- [ ] PDF-Generierung funktioniert
- [ ] Mobile Navigation funktioniert

### 2. Performance-Tests
- [ ] Page Load Times < 3s
- [ ] API Response Times < 1s
- [ ] PDF Generation < 10s
- [ ] Mobile Performance OK

### 3. Sicherheitstests
- [ ] HTTPS funktioniert
- [ ] Umgebungsvariablen nicht exponiert
- [ ] OAuth Redirect URIs korrekt
- [ ] CORS-Einstellungen korrekt

## 🐛 Bekannte Issues

### PDF-Generierung
- **Problem:** Firmendaten werden nicht korrekt in PDFs angezeigt
- **Status:** Wird nach Deployment behoben
- **Workaround:** Verwende Debug-Tools unter `/test-pdf-data`

### Lokale vs. Produktionsumgebung
- **Problem:** Unterschiede in Datenverarbeitung
- **Status:** Wird nach Deployment analysiert
- **Workaround:** Teste mit echten Produktionsdaten

## 📊 Monitoring

### Vercel Analytics
- [ ] Vercel Analytics aktiviert
- [ ] Performance-Monitoring konfiguriert
- [ ] Error-Tracking eingerichtet

### Sentry Integration
- [ ] Sentry DSN korrekt konfiguriert
- [ ] Error-Reporting funktioniert
- [ ] Performance-Monitoring aktiv

## 🔄 Continuous Deployment

### GitHub Integration
- [ ] Repository mit Vercel verbunden
- [ ] Auto-Deploy bei Push aktiviert
- [ ] Preview Deployments konfiguriert

### Branch Protection
- [ ] Main Branch geschützt
- [ ] Code Review erforderlich
- [ ] Build-Tests müssen passieren

## 📝 Deployment Notes

### Version: 1.0.0
- **Build:** ✅ Erfolgreich
- **TypeScript:** ✅ Keine Fehler
- **ESLint:** ✅ Keine Fehler
- **Dependencies:** ✅ Alle installiert

### Nächste Schritte
1. Vercel Deployment durchführen
2. Umgebungsvariablen setzen
3. Google OAuth für Produktion konfigurieren
4. Funktionalitätstests durchführen
5. PDF-Problem beheben
6. Performance optimieren
