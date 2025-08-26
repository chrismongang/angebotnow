# AngebotNow - KI-gestützte Angebotserstellung

Eine moderne Web-Anwendung zur automatisierten Erstellung professioneller Angebote mit KI-Unterstützung.

## 🚀 Features

- **KI-gestützte Angebotserstellung**: Automatische Generierung von Angeboten basierend auf Fotos und Beschreibungen
- **PDF-Export**: Professionelle PDF-Angebote mit Firmenbranding
- **Google OAuth**: Sichere Anmeldung mit Google-Konten
- **Mobile-First Design**: Optimiert für alle Geräte
- **Datenbank-Integration**: PostgreSQL mit Neon für zuverlässige Datenspeicherung
- **Cloudinary Integration**: Sichere Bildverarbeitung und -speicherung

## 🛠️ Technologie-Stack

- **Frontend**: Next.js 15.5.0, React 18.3.1, TypeScript
- **Styling**: Tailwind CSS, Manrope Font
- **Authentication**: NextAuth.js mit Google OAuth
- **Database**: PostgreSQL (Neon) mit Prisma ORM
- **AI**: OpenAI GPT-4 für Angebotserstellung
- **File Storage**: Cloudinary für Bildverarbeitung
- **Deployment**: Vercel
- **Monitoring**: Sentry für Error-Tracking

## 📦 Installation

### Voraussetzungen

- Node.js 18+ 
- npm oder yarn
- PostgreSQL Datenbank (Neon empfohlen)
- Google Cloud Console Account
- OpenAI API Key
- Cloudinary Account

### Lokale Entwicklung

1. **Repository klonen**
   ```bash
   git clone https://github.com/your-username/angebotnow.git
   cd angebotnow
   ```

2. **Dependencies installieren**
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Umgebungsvariablen konfigurieren**
   ```bash
   cp .env.example .env.local
   ```
   
   Fülle die folgenden Variablen in `.env.local` aus:
   ```env
   # Database
   DATABASE_URL="postgresql://username:password@host:port/database?sslmode=require"
   
   # NextAuth.js
   NEXTAUTH_SECRET="your-secret-key"
   NEXTAUTH_URL="http://localhost:3000"
   
   # Google OAuth
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   
   # OpenAI
   OPENAI_API_KEY="your-openai-api-key"
   USE_OPENAI="true"
   
   # Cloudinary
   CLOUDINARY_CLOUD_NAME="your-cloud-name"
   CLOUDINARY_API_KEY="your-api-key"
   CLOUDINARY_API_SECRET="your-api-secret"
   ```

4. **Datenbank-Migrationen ausführen**
   ```bash
   npx prisma migrate deploy
   npx prisma generate
   ```

5. **Entwicklungsserver starten**
   ```bash
   npm run dev
   ```

6. **Anwendung öffnen**
   ```
   http://localhost:3000
   ```

## 🚀 Deployment auf Vercel

### 1. Vercel CLI Setup

```bash
# Vercel CLI installieren
npm i -g vercel

# Bei Vercel anmelden
vercel login

# Projekt deployen
vercel --prod
```

### 2. Umgebungsvariablen in Vercel setzen

Gehe zu Vercel Dashboard → Project Settings → Environment Variables und setze:

- `DATABASE_URL`: Deine Neon PostgreSQL URL
- `NEXTAUTH_SECRET`: Ein sicherer Secret-Key
- `NEXTAUTH_URL`: Deine Vercel-Domain (https://your-app.vercel.app)
- `GOOGLE_CLIENT_ID`: Deine Google OAuth Client ID
- `GOOGLE_CLIENT_SECRET`: Dein Google OAuth Client Secret
- `OPENAI_API_KEY`: Dein OpenAI API Key
- `CLOUDINARY_*`: Deine Cloudinary Credentials

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

## 🧪 Testing

### Build-Test
```bash
npm run build
```

### Linting
```bash
npm run lint
```

### E2E Tests (Playwright)
```bash
npm run test:e2e
```

### Unit Tests (Vitest)
```bash
npm run test
```

## 📁 Projektstruktur

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   ├── auth/              # Authentication Pages
│   ├── dashboard/         # Main Dashboard
│   ├── einstellungen/     # Settings Pages
│   └── test-*/           # Test Pages
├── components/            # React Components
│   ├── ui/               # UI Components
│   └── providers/        # Context Providers
├── lib/                  # Utility Libraries
│   ├── ai/              # AI Integration
│   ├── auth.ts          # NextAuth Configuration
│   ├── db/              # Database Configuration
│   ├── pdf/             # PDF Generation
│   └── user-data.ts     # User Data Management
└── e2e/                 # End-to-End Tests
```

## 🔧 Konfiguration

### Google OAuth Setup

1. **Google Cloud Console**: Erstelle ein neues Projekt
2. **OAuth 2.0 Client ID**: Erstelle eine Web-Anwendung
3. **Redirect URIs**: 
   - Development: `http://localhost:3000/api/auth/callback/google`
   - Production: `https://your-domain.vercel.app/api/auth/callback/google`

### Datenbank Setup (Neon)

1. **Neon Account**: Erstelle ein kostenloses Konto
2. **Datenbank erstellen**: Wähle PostgreSQL
3. **Connection String**: Kopiere die URL in `DATABASE_URL`
4. **Migrationen**: Führe `npx prisma migrate deploy` aus

## 🐛 Bekannte Issues

### PDF-Generierung
- **Problem**: Firmendaten werden nicht korrekt in PDFs angezeigt
- **Status**: Wird nach Deployment behoben
- **Workaround**: Verwende Debug-Tools unter `/test-pdf-data`

### Lokale vs. Produktionsumgebung
- **Problem**: Unterschiede in Datenverarbeitung
- **Status**: Wird nach Deployment analysiert
- **Workaround**: Teste mit echten Produktionsdaten

## 📊 Monitoring

### Vercel Analytics
- Performance-Monitoring
- Error-Tracking
- User Analytics

### Sentry Integration
- Error-Reporting
- Performance-Monitoring
- Release-Tracking

## 🤝 Contributing

1. Fork das Repository
2. Erstelle einen Feature-Branch (`git checkout -b feature/amazing-feature`)
3. Committe deine Änderungen (`git commit -m 'Add amazing feature'`)
4. Push zum Branch (`git push origin feature/amazing-feature`)
5. Öffne einen Pull Request

## 📄 Lizenz

Dieses Projekt ist unter der MIT-Lizenz lizenziert. Siehe [LICENSE](LICENSE) für Details.

## 🆘 Support

Bei Fragen oder Problemen:

1. Überprüfe die [Deployment-Checkliste](docs/DEPLOYMENT_CHECKLIST.md)
2. Schaue in die [Dokumentation](docs/)
3. Erstelle ein Issue auf GitHub
4. Kontaktiere das Entwicklungsteam

## 🎯 Roadmap

- [ ] Echte Bild-Uploads implementieren
- [ ] Angebotsnummern-System verbessern
- [ ] Multi-User-Support erweitern
- [ ] Status-System für Angebote
- [ ] E-Mail-Benachrichtigungen
- [ ] Offline-Support
- [ ] Progressive Web App (PWA)
