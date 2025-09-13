# Meta Conversions API - Erweiterte Implementierung

## 📋 Übersicht

Diese erweiterte Meta Conversions API Implementation bietet verbesserte Tracking-Qualität, bessere Attribution und deduplizierte Events für optimale Meta Ads Performance.

**Pixel ID:** `1824927524761347`

## ✅ Neue Features

### 1. **Verbesserte Datenqualität**
- ✅ Erweiterte User-Daten (Phone, Location, etc.)
- ✅ Facebook Click ID (FBC) und Browser ID (FBP) Tracking
- ✅ Client IP und User Agent für bessere Attribution
- ✅ Event ID Generation für Deduplizierung
- ✅ Retry-Logik mit Exponential Backoff

### 2. **Enhanced Events**
- ✅ `CompleteRegistration` - User-Registrierung
- ✅ `Purchase` - Abonnement-Abschluss
- ✅ `Upgrade` - Plan-Upgrade
- ✅ `Lead` - Lead-Generierung
- ✅ `InitiateCheckout` - Checkout-Start
- ✅ `Subscribe` - Newsletter-Anmeldung

### 3. **Deduplizierung**
- ✅ Server-side + Client-side Tracking
- ✅ Event ID für Duplikat-Vermeidung
- ✅ Facebook Click ID Integration
- ✅ Browser ID Tracking

## 🔧 Technische Implementierung

### API-Endpunkte

#### `/api/analytics/meta-pixel` (Enhanced)
**Zweck:** Erweiterte Conversions API mit besserer Datenqualität

**Neue Features:**
- Client IP und User Agent Tracking
- Facebook Click ID (FBC) und Browser ID (FBP)
- Event ID Generation
- Retry-Logik mit Exponential Backoff
- Erweiterte User-Daten (Phone, Location)

#### `/api/analytics/meta-events` (NEW)
**Zweck:** Client-side Event Tracking für authentifizierte User

**Endpoints:**
- `POST` - Allgemeine Events
- `PUT` - Spezifische Actions (upgrade, lead, checkout)

### Enhanced User Data

```typescript
interface UserData {
  email: string;           // SHA-256 hashed
  firstName: string;       // SHA-256 hashed
  lastName: string;        // SHA-256 hashed
  userId: string;          // SHA-256 hashed
  phone?: string;          // SHA-256 hashed
  city?: string;           // SHA-256 hashed
  state?: string;          // SHA-256 hashed
  zipCode?: string;        // SHA-256 hashed
  country?: string;        // SHA-256 hashed
  fbc?: string;           // Facebook Click ID
  fbp?: string;           // Facebook Browser ID
  subscriptionId?: string; // Subscription ID
}
```

### Enhanced Event Data

```typescript
interface EventData {
  value?: number;
  currency?: string;
  content_name?: string;
  content_category?: string;
  content_type?: string;
  content_ids?: string[];
  num_items?: number;
  search_string?: string;
  status?: string;
  plan?: string;
  source?: string;
  // Custom fields
  [key: string]: any;
}
```

## 🎯 Tracking-Funktionen

### Server-Side Tracking

```typescript
import { 
  trackUserRegistration,
  trackSubscriptionPurchase,
  trackUpgrade,
  trackLead,
  trackInitiateCheckout 
} from '@/lib/meta-conversions';

// User-Registrierung
await trackUserRegistration({
  email: 'user@example.com',
  firstName: 'Max',
  lastName: 'Mustermann',
  userId: 'user_123',
  fbc: 'fb.1.1234567890.1234567890',
  fbp: 'fb.1.1234567890.1234567890',
}, 'email_password');

// Abonnement-Kauf
await trackSubscriptionPurchase({
  email: 'user@example.com',
  firstName: 'Max',
  lastName: 'Mustermann',
  userId: 'user_123',
}, {
  value: 49.0,
  currency: 'EUR',
  plan: 'pro',
  subscriptionId: 'sub_123',
  checkoutSessionId: 'cs_123',
});

// Plan-Upgrade
await trackUpgrade({
  email: 'user@example.com',
  firstName: 'Max',
  lastName: 'Mustermann',
  userId: 'user_123',
}, {
  fromPlan: 'free',
  toPlan: 'pro',
  value: 49.0,
  currency: 'EUR',
  source: 'dashboard',
});
```

### Client-Side Tracking (React Hook)

```typescript
import { useMetaTracking } from '@/hooks/useMetaTracking';

function UpgradeButton() {
  const { trackUpgrade, trackInitiateCheckout } = useMetaTracking();

  const handleUpgrade = async () => {
    // Track checkout initiation
    await trackInitiateCheckout({
      value: 49.0,
      currency: 'EUR',
      plan: 'pro',
      source: 'dashboard',
    });

    // Redirect to checkout...
  };

  return (
    <button onClick={handleUpgrade}>
      Upgrade to Pro
    </button>
  );
}
```

## 🔐 Umgebungsvariablen

```env
# Meta Pixel (bereits konfiguriert)
NEXT_PUBLIC_META_PIXEL_ID=1824927524761347

# Meta Conversions API (erforderlich)
META_ACCESS_TOKEN=your_meta_access_token
META_PIXEL_TEST_EVENT_CODE=your_test_code

# Optional: Für erweiterte Attribution
NEXTAUTH_URL=https://angebotnow.com
```

## 📊 Meta Ads Manager Konfiguration

### 1. Conversions API Setup
1. Gehe zu Meta Events Manager
2. Wähle deinen Pixel: `1824927524761347`
3. Gehe zu "Conversions API"
4. Füge deinen Access Token hinzu
5. Aktiviere "Conversions API"

### 2. Event-Verifikation
Nach der Implementierung solltest du folgende Events sehen:

#### Standard Events
- ✅ **PageView** - Automatisch auf allen Seiten
- ✅ **CompleteRegistration** - Bei User-Registrierung
- ✅ **Purchase** - Bei Abonnement-Abschluss

#### Custom Events
- ✅ **Upgrade** - Bei Plan-Upgrades
- ✅ **Lead** - Bei Lead-Generierung
- ✅ **InitiateCheckout** - Bei Checkout-Start

### 3. Qualitätsmetriken überwachen

Nach 24-48 Stunden siehst du in Meta Events Manager:

1. **Event-Abgleichsqualität** - Sollte >80% sein
2. **Deduplizierungsrate** - Sollte >90% sein
3. **Datenaktualität** - Sollte <1 Stunde sein
4. **Event-Abdeckung** - Sollte 100% sein

## 🧪 Testing

### 1. Server-Side Testing

```bash
# Test CompleteRegistration
curl -X POST http://localhost:3000/api/analytics/meta-pixel \
  -H "Content-Type: application/json" \
  -d '{
    "event": "CompleteRegistration",
    "userData": {
      "email": "test@example.com",
      "firstName": "Test",
      "lastName": "User",
      "userId": "test_123"
    },
    "eventData": {
      "plan": "free",
      "source": "test"
    }
  }'
```

### 2. Client-Side Testing

```javascript
// In Browser DevTools
const { trackEvent } = useMetaTracking();
await trackEvent('Lead', {
  contentName: 'Test Lead',
  contentCategory: 'Test',
  value: 0
});
```

### 3. Test-Seite verwenden

Besuche `/test-meta-tracking` um alle Events zu testen.

### 4. Meta Pixel Helper
- Browser-Extension installieren
- Events in Echtzeit überwachen
- Datenvalidierung prüfen

## 🚀 Deployment Checkliste

- ✅ Enhanced Conversions API implementiert
- ✅ Event ID Generation aktiv
- ✅ Facebook Click ID Integration
- ✅ Retry-Logik implementiert
- ✅ Client-Side Hook erstellt
- ✅ Deduplizierung aktiviert
- ✅ Erweiterte User-Daten
- ✅ Fehlerbehandlung verbessert
- ✅ Test-Seite erstellt

## 📈 Performance Optimierungen

### 1. **Deduplizierung**
- Server-side + Client-side Events
- Event ID für Duplikat-Vermeidung
- Facebook Click ID Integration

### 2. **Attribution**
- Client IP und User Agent Tracking
- Facebook Click ID (FBC) für bessere Attribution
- Browser ID (FBP) für Cross-Device Tracking

### 3. **Datenqualität**
- SHA-256 Hashing für PII
- Erweiterte User-Daten
- Standardisierte Event-Parameter

## 🔍 Troubleshooting

### Events werden nicht angezeigt
1. Prüfe `META_ACCESS_TOKEN` Umgebungsvariable
2. Prüfe Meta Events Manager → Conversions API Status
3. Prüfe Server-Logs auf Fehler
4. Teste mit Meta Pixel Helper

### Niedrige Event-Abgleichsqualität
1. Stelle sicher, dass Email und Name korrekt gehasht werden
2. Prüfe Facebook Click ID Integration
3. Aktiviere Client-Side Tracking für Deduplizierung

### Performance-Probleme
1. Events werden asynchron gesendet
2. Retry-Logik verhindert Blocking
3. Fehler brechen keine User-Flows

---

**Status:** ✅ Erweitert und einsatzbereit
**Letzte Aktualisierung:** $(date)
**Entwickler:** AI Assistant
