# Meta Pixel Integration - Vollständige Implementierung

## 📋 Übersicht

Die Meta Pixel Integration ist vollständig implementiert und trackt automatisch die wichtigsten Events für eure Meta Ads Kampagnen.

**Pixel ID:** `1824927524761347`

## ✅ Implementierte Features

### 1. **Automatisches PageView Tracking**
- ✅ Lädt auf allen Seiten (Marketing + App)
- ✅ Trackt automatisch Route-Änderungen (SPA-Verhalten)
- ✅ Optimiert für Next.js Performance

### 2. **User-Registrierung Tracking**
- ✅ **Event:** `CompleteRegistration`
- ✅ **Trigger:** Nach erfolgreicher Registrierung in `/api/auth/register`
- ✅ **Daten:** Email, Name, User-ID, Plan, Quelle

### 3. **Abonnement-Abschluss Tracking**
- ✅ **Event:** `Purchase`
- ✅ **Trigger:** Nach erfolgreichem Stripe Checkout in Webhook
- ✅ **Daten:** Wert, Währung, Plan, User-ID, Subscription-ID

### 4. **Serverseitiges Tracking**
- ✅ **Conversions API:** Server-to-Server Events für bessere Attribution
- ✅ **PII-Hashing:** Email und Namen werden SHA-256 gehasht
- ✅ **Fehlerbehandlung:** Tracking-Fehler brechen keine User-Flows

## 🔧 Technische Implementierung

### API-Routen

#### `/api/analytics/meta-pixel` (POST)
**Zweck:** Serverseitiges Event-Tracking über Meta Conversions API

**Parameter:**
```json
{
  "event": "CompleteRegistration" | "Purchase",
  "userData": {
    "email": "user@example.com",
    "firstName": "Max",
    "lastName": "Mustermann", 
    "userId": "user_123"
  },
  "eventData": {
    "value": 49.0,
    "currency": "EUR",
    "plan": "pro"
  }
}
```

### Integration Points

#### 1. User-Registrierung (`/api/auth/register`)
```typescript
// Nach erfolgreicher Registrierung
await fetch(`${process.env.NEXTAUTH_URL}/api/analytics/meta-pixel`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    event: 'CompleteRegistration',
    userData: { email, firstName, lastName, userId: user.id },
    eventData: { plan: 'free', source: 'email_password' }
  }),
});
```

#### 2. Abonnement-Abschluss (`/api/stripe/webhook`)
```typescript
// Bei checkout.session.completed
await fetch(`${process.env.NEXTAUTH_URL}/api/analytics/meta-pixel`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    event: 'Purchase',
    userData: { email: user.email, userId: user.id },
    eventData: {
      value: session.amount_total / 100,
      currency: session.currency,
      plan: 'pro'
    }
  }),
});
```

## 🎯 Tracking-Funktionen

### Client-Side Tracking (Optional)

```typescript
import { 
  trackRegistrationWithData, 
  trackPurchaseWithData,
  trackQuoteCreation,
  trackUpgradeClick 
} from '@/components/analytics/meta-pixel';

// Registrierung tracken
trackRegistrationWithData({
  email: 'user@example.com',
  firstName: 'Max',
  lastName: 'Mustermann',
  userId: 'user_123'
});

// Kauf tracken
trackPurchaseWithData({
  value: 49.0,
  currency: 'EUR',
  plan: 'pro',
  userId: 'user_123'
});

// Quote-Erstellung tracken
trackQuoteCreation({
  quoteId: 'quote_456',
  userId: 'user_123',
  value: 0
});

// Upgrade-Button Klick tracken
trackUpgradeClick({
  location: 'dashboard',
  userId: 'user_123',
  currentPlan: 'free'
});
```

## 🔐 Umgebungsvariablen

Für vollständige Funktionalität benötigt ihr:

```env
# Meta Pixel (bereits konfiguriert)
NEXT_PUBLIC_META_PIXEL_ID=1824927524761347

# Meta Conversions API (optional, für erweiterte Attribution)
META_ACCESS_TOKEN=your_meta_access_token
META_PIXEL_TEST_EVENT_CODE=your_test_code
```

## 📊 Events im Meta Ads Manager

Nach der Implementierung seht ihr folgende Events:

### Standard Events
- ✅ **PageView** - Automatisch auf allen Seiten
- ✅ **CompleteRegistration** - Bei User-Registrierung
- ✅ **Purchase** - Bei Abonnement-Abschluss

### Custom Events (Optional)
- **QuoteCreated** - Bei Angebotserstellung
- **UpgradeClicked** - Bei Upgrade-Button Klicks

## 🧪 Testing

### 1. Browser DevTools
```javascript
// In der Browser-Konsole testen
fbq('track', 'CompleteRegistration');
fbq('track', 'Purchase', { value: 49.0, currency: 'EUR' });
```

### 2. Meta Pixel Helper
- Browser-Extension installieren
- Events in Echtzeit überwachen
- Datenvalidierung prüfen

### 3. Meta Events Manager
- Events in Echtzeit anzeigen
- Test-Events senden
- Conversions API Status prüfen

## 🚀 Deployment Checkliste

- ✅ Meta Pixel Code installiert
- ✅ PageView Tracking aktiv
- ✅ CompleteRegistration Event implementiert
- ✅ Purchase Event implementiert
- ✅ Serverseitiges Tracking aktiv
- ✅ Fehlerbehandlung implementiert
- ✅ Performance optimiert

## 📈 Nächste Schritte

1. **Meta Ads Manager konfigurieren:**
   - Custom Audiences erstellen
   - Conversion Events definieren
   - Lookalike Audiences aufbauen

2. **Erweiterte Events (Optional):**
   - Quote-Erstellung tracken
   - Upgrade-Button Klicks tracken
   - Scroll-Depth Events

3. **A/B Testing:**
   - Verschiedene Landing Pages testen
   - Conversion-Raten optimieren
   - ROI messen

## 🔍 Troubleshooting

### Events werden nicht angezeigt
1. Prüfe Browser DevTools → Network → `fbevents.js`
2. Prüfe Meta Pixel Helper Extension
3. Prüfe Events Manager in Meta Ads

### Serverseitige Events fehlen
1. Prüfe `META_ACCESS_TOKEN` Umgebungsvariable
2. Prüfe Server-Logs auf Fehler
3. Teste API-Route direkt

### Performance-Probleme
1. Script lädt mit `strategy="afterInteractive"`
2. Events werden asynchron gesendet
3. Fehler brechen keine User-Flows

---

**Status:** ✅ Vollständig implementiert und einsatzbereit
**Letzte Aktualisierung:** $(date)
**Entwickler:** AI Assistant
