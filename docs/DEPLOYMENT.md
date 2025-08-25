# Deployment Guide: AngebotNow

## 🚀 Vercel Deployment

### Voraussetzungen

1. **GitHub Repository** mit dem AngebotNow-Code
2. **Vercel Account** (kostenlos verfügbar)
3. **PostgreSQL-Datenbank** (z.B. Neon, Supabase, Railway)

### Schritt-für-Schritt Anleitung

#### 1. Repository mit Vercel verbinden

1. Gehen Sie zu [vercel.com](https://vercel.com)
2. Klicken Sie auf "New Project"
3. Wählen Sie Ihr GitHub-Repository aus
4. Klicken Sie auf "Import"

#### 2. Build-Konfiguration

Vercel erkennt automatisch Next.js-Projekte. Die Standard-Konfiguration ist:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs"
}
```

#### 3. Environment Variables setzen

Gehen Sie zu **Project Settings → Environment Variables** und fügen Sie hinzu:

##### 🔴 Kritisch (für vollständige Funktionalität)
```bash
DATABASE_URL=postgresql://username:password@host:port/database
SHADOW_DATABASE_URL=postgresql://username:password@host:port/shadow_database
```

##### 🟡 Optional (für erweiterte Features)
```bash
# Cloudinary (Bild-Upload)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# OpenAI (AI-Verarbeitung)
OPENAI_API_KEY=sk-your-openai-api-key
USE_OPENAI=true

# Sentry (Error-Tracking)
SENTRY_DSN=https://your-sentry-dsn
NEXT_PUBLIC_SENTRY_DSN=https://your-sentry-dsn
```

#### 4. Datenbank einrichten

1. **Neon** (empfohlen):
   - Gehen Sie zu [neon.tech](https://neon.tech)
   - Erstellen Sie ein neues Projekt
   - Kopieren Sie die Connection String
   - Führen Sie Migrationen aus: `npx prisma migrate deploy`

2. **Supabase**:
   - Gehen Sie zu [supabase.com](https://supabase.com)
   - Erstellen Sie ein neues Projekt
   - Verwenden Sie die PostgreSQL-URL

#### 5. Deployment auslösen

1. Klicken Sie auf "Deploy"
2. Warten Sie auf den Build-Prozess
3. Überprüfen Sie die Build-Logs auf Fehler

### 🔧 Troubleshooting

#### Build-Fehler

**Problem**: `Error: Environment variable not found: DATABASE_URL`

**Lösung**: 
- Environment Variables in Vercel Dashboard setzen
- Oder Demo-Modus verwenden (ohne DATABASE_URL)

**Problem**: `Error: Route "/angebot/[id]" used params.id`

**Lösung**: 
- ✅ Bereits behoben in der aktuellen Version
- Params werden jetzt korrekt awaited

**Problem**: `npm error code ERESOLVE` - Peer dependency conflicts

**Lösung**: 
- ✅ Bereits behoben mit React 18.3.1
- `.npmrc` mit `legacy-peer-deps=true` konfiguriert
- `vercel.json` mit korrektem Install-Command

#### Runtime-Fehler

**Problem**: Datenbank-Verbindung fehlgeschlagen

**Lösung**:
1. DATABASE_URL überprüfen
2. Datenbank-Migrationen ausführen
3. Firewall-Einstellungen prüfen

**Problem**: Cloudinary-Upload funktioniert nicht

**Lösung**:
1. Cloudinary-Credentials überprüfen
2. App läuft im Fallback-Modus (Placeholder-Bilder)

### 📊 Deployment-Status überprüfen

Nach dem Deployment können Sie den Status unter `/status` überprüfen:

```
https://your-app.vercel.app/status
```

Diese Seite zeigt:
- ✅ Verfügbare Services
- ❌ Fehlende Konfigurationen
- 📋 Nächste Schritte

### 🔄 Continuous Deployment

Vercel bietet automatisches CD:
- Jeder Push zu `main` löst ein neues Deployment aus
- Preview-Deployments für Pull Requests
- Rollback zu vorherigen Versionen möglich

### 📈 Monitoring

#### Vercel Analytics
- Automatisch aktiviert
- Performance-Metriken
- Error-Tracking

#### Sentry Integration
- Setzen Sie `SENTRY_DSN` für detailliertes Error-Monitoring
- Stack Traces und Performance-Daten

### 🛡️ Sicherheit

#### Environment Variables
- Niemals in Code committen
- Nur in Vercel Dashboard setzen
- Production/Preview/Development-Umgebungen

#### Datenbank
- Sichere Passwörter verwenden
- SSL-Verbindungen aktivieren
- Regelmäßige Backups

### 📋 Deployment-Checkliste

- [ ] Repository mit Vercel verbunden
- [ ] DATABASE_URL gesetzt
- [ ] Build erfolgreich
- [ ] Migrationen ausgeführt
- [ ] App funktioniert unter `/status`
- [ ] Core-Flow getestet (Upload → AI → PDF)
- [ ] Error-Monitoring konfiguriert (optional)

### 🎯 Demo-Modus

Falls Sie keine Datenbank einrichten möchten:

1. **Keine DATABASE_URL setzen**
2. App läuft im Demo-Modus
3. Formulare werden simuliert
4. Placeholder-Bilder verwendet
5. Mock-AI generiert Testdaten

**Perfekt für:**
- Präsentationen
- Demos
- Entwicklung
- Testing

### 📞 Support

Bei Problemen:
1. Vercel Build-Logs überprüfen
2. `/status` Route besuchen
3. GitHub Issues erstellen
4. Vercel Support kontaktieren
