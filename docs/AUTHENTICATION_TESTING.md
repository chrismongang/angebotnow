# Authentifizierung Test-Dokumentation

## Übersicht

Diese Dokumentation beschreibt die umfassenden Tests für das neue Authentifizierungssystem mit Email/Password und Email-Verifikation.

## Implementierte Features

### ✅ Email/Password Registrierung
- **Endpoint**: `POST /api/auth/register`
- **Features**:
  - Separate `firstName` und `lastName` Felder
  - Passwort-Hashing mit bcrypt
  - Automatische Email-Verifikation
  - Validierung mit Zod

### ✅ Email-Verifikation
- **Endpoints**: 
  - `GET /api/auth/verify-email` - Token validieren
  - `POST /api/auth/verify-email` - Email verifizieren
  - `POST /api/auth/resend-verification` - Neue Verifikations-Email
- **Features**:
  - 24-Stunden Token-Gültigkeit
  - Sichere Token-Hashing
  - Willkommens-Email nach Verifikation

### ✅ Passwort-Reset
- **Endpoints**:
  - `POST /api/auth/forgot-password` - Passwort-Reset-Email anfordern
  - `GET /api/auth/reset-password` - Token validieren
  - `POST /api/auth/reset-password` - Passwort zurücksetzen
- **Features**:
  - Nur für Email/Password User verfügbar
  - 1-Stunde Token-Gültigkeit
  - Google-User werden abgelehnt

### ✅ UI-Seiten
- `/auth/signin` - Anmeldung/Registrierung
- `/auth/verify` - Email-Verifikation
- `/auth/forgot-password` - Passwort vergessen
- `/auth/reset-password` - Passwort zurücksetzen

## Test-Szenarien

### 1. Registrierung Test

```bash
# Neue User registrieren
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com",
    "password": "testpassword123"
  }'
```

**Erwartetes Ergebnis**:
```json
{
  "message": "Benutzer erfolgreich erstellt. Bitte verifiziere deine Email-Adresse.",
  "user": {
    "id": "cmex...",
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com"
  },
  "emailSent": true
}
```

### 2. Email-Verifikation Test

```bash
# Token validieren (GET)
curl "http://localhost:3000/api/auth/verify-email?token=VALID_TOKEN"

# Email verifizieren (POST)
curl -X POST http://localhost:3000/api/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{"token": "VALID_TOKEN"}'
```

### 3. Passwort-Reset Test

```bash
# Passwort-Reset-Email anfordern
curl -X POST http://localhost:3000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'

# Token validieren
curl "http://localhost:3000/api/auth/reset-password?token=VALID_TOKEN"

# Passwort zurücksetzen
curl -X POST http://localhost:3000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token": "VALID_TOKEN",
    "password": "newpassword123",
    "confirmPassword": "newpassword123"
  }'
```

### 4. Sicherheits-Tests

#### Nicht verifizierte Email
```bash
curl -X POST http://localhost:3000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "unverified@example.com"}'
```

**Erwartetes Ergebnis**:
```json
{
  "error": "Bitte verifiziere zuerst deine Email-Adresse, bevor du dein Passwort zurücksetzen kannst."
}
```

#### Google-User Passwort-Reset
```bash
# Google-User versucht Passwort-Reset
curl -X POST http://localhost:3000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "google-user@example.com"}'
```

**Erwartetes Ergebnis**:
```json
{
  "error": "Dieses Konto wurde über Google angemeldet. Bitte verwende die Google-Anmeldung."
}
```

## Datenbank-Schema

### User Model
```prisma
model User {
  id            String    @id @default(cuid())
  firstName     String    // Vorname
  lastName      String    // Nachname
  email         String    @unique
  emailVerified DateTime?
  image         String?
  password      String?   // Für Email/Password Auth
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}
```

### VerificationToken Model
```prisma
model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime
  type       String?  @default("email") // email-verification, password-reset
  @@unique([identifier, token])
}
```

## Email-Templates

### Verifikations-Email
- **Absender**: `info@angebotnow.de`
- **Betreff**: "Verifiziere deine Email-Adresse - AngebotNow"
- **Inhalt**: Personalisierte Begrüßung mit Vorname

### Passwort-Reset-Email
- **Absender**: `info@angebotnow.de`
- **Betreff**: "Passwort zurücksetzen - AngebotNow"
- **Inhalt**: Sicherheitshinweise und Reset-Link

### Willkommens-Email
- **Absender**: `info@angebotnow.de`
- **Betreff**: "Willkommen bei AngebotNow! 🎉"
- **Inhalt**: Feature-Übersicht und nächste Schritte

## Session-Management

### Session-Daten
```typescript
interface Session {
  user: {
    id: string
    email: string
    name: string
    firstName?: string
    lastName?: string
    image?: string
  }
}
```

### Dashboard-Integration
- Personalisierte Begrüßung mit Vorname
- Fallback auf `name` Feld für Kompatibilität
- Automatische Weiterleitung nach Anmeldung

## Sicherheits-Features

### ✅ Token-Sicherheit
- Sichere Token-Generierung mit `crypto.randomBytes(32)`
- SHA-256 Hashing für Datenbank-Speicherung
- Automatische Token-Bereinigung nach Verwendung

### ✅ Passwort-Sicherheit
- bcrypt Hashing mit Salt-Rounds 12
- Mindestlänge 8 Zeichen
- Passwort-Bestätigung erforderlich

### ✅ Email-Sicherheit
- Nur verifizierte Emails können sich anmelden
- Passwort-Reset nur für Email/Password User
- Rate-Limiting durch Resend

### ✅ OAuth-Integration
- Google-User werden korrekt erkannt
- Passwort-Reset für OAuth-User deaktiviert
- Klare Fehlermeldungen für User

## Fehlerbehandlung

### Validierungsfehler
```json
{
  "error": "Ungültige Eingabedaten",
  "details": [
    {
      "code": "invalid_string",
      "minimum": 8,
      "type": "string",
      "inclusive": true,
      "exact": false,
      "message": "Passwort muss mindestens 8 Zeichen lang sein",
      "path": ["password"]
    }
  ]
}
```

### Token-Fehler
```json
{
  "error": "Token ist abgelaufen. Bitte fordere eine neue Verifikations-Email an."
}
```

### User-Fehler
```json
{
  "error": "Ein Benutzer mit dieser Email-Adresse existiert bereits"
}
```

## Performance-Optimierungen

### ✅ Datenbank-Optimierungen
- Selektive Feld-Abfragen mit `select`
- Indizierte Email-Felder
- Effiziente Token-Lookups

### ✅ Email-Optimierungen
- Asynchrone Email-Versendung
- Graceful Fallbacks bei Email-Fehlern
- Keine Blockierung der User-Registrierung

### ✅ UI-Optimierungen
- Client-side Rendering für dynamische Komponenten
- Lazy Loading von UI-Komponenten
- Responsive Design für alle Geräte

## Deployment-Checkliste

### ✅ Vorbereitung
- [ ] RESEND_API_KEY konfiguriert
- [ ] NEXTAUTH_SECRET gesetzt
- [ ] NEXTAUTH_URL konfiguriert
- [ ] Datenbank-Migrationen ausgeführt

### ✅ Email-Konfiguration
- [ ] Resend-Domain verifiziert
- [ ] Email-Templates getestet
- [ ] Absender-Adresse konfiguriert

### ✅ Sicherheit
- [ ] HTTPS in Produktion aktiviert
- [ ] Secure Cookies konfiguriert
- [ ] Rate-Limiting aktiviert

## Monitoring und Logging

### Logging-Strategie
- Erfolgreiche Registrierungen
- Email-Versand-Fehler
- Token-Validierungsfehler
- Passwort-Reset-Versuche

### Metriken
- Registrierungsrate
- Email-Verifikationsrate
- Passwort-Reset-Rate
- Anmelde-Erfolgsrate

## Wartung und Updates

### Regelmäßige Aufgaben
- Überprüfung abgelaufener Tokens
- Email-Deliverability-Monitoring
- Sicherheits-Audits
- Performance-Optimierungen

### Zukünftige Erweiterungen
- Apple Sign-In Integration
- Microsoft OAuth Support
- Zwei-Faktor-Authentifizierung
- Erweiterte Passwort-Richtlinien
