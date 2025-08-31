# Stripe Subscription System Implementation

## 📋 **Implementierungsdokumentation: Stripe Subscription System & Pro Features**

### **Version:** 1.0.0  
**Datum:** 31.08.2025  
**Entwickler:** AI Assistant + User  
**Status:** Vollständig implementiert und getestet

---

## 🎯 **Übersicht der neuen Features**

### **Hauptfunktionalitäten:**
1. **Stripe Subscription System** - Vollständige Abo-Verwaltung
2. **Pro-User Features** - Erweiterte Funktionalitäten für zahlende Kunden
3. **Upgrade-Erfolgs-Popup** - Bessere User-Experience nach Upgrade
4. **PDF-Branding-Entfernung** - Pro-User bekommen saubere PDFs
5. **Customer Portal Integration** - Gesetzeskonforme Abo-Verwaltung

---

## 🔧 **1. Stripe Integration & Subscription System**

### **1.1 Neue API Routes**

#### **`/api/stripe/create-checkout-session`**
- **Zweck:** Erstellt Stripe Checkout Sessions für Pro-Upgrades
- **Features:**
  - Automatische Stripe Customer-Erstellung
  - Promo-Code-Unterstützung
  - Weiterleitung nach erfolgreichem Upgrade
- **Parameter:** User-ID, E-Mail, Stripe Price ID
- **Return:** Stripe Checkout URL

#### **`/api/stripe/customer-portal`**
- **Zweck:** Stripe Customer Portal für Abo-Verwaltung
- **Features:**
  - Abo kündigen (gesetzeskonform)
  - Zahlungsmethode ändern
  - Rechnungen einsehen
  - Abo pausieren/verlängern
- **Sicherheit:** Nur authentifizierte User
- **Return:** Stripe Customer Portal URL

#### **`/api/stripe/webhook`**
- **Zweck:** Verarbeitet Stripe Events
- **Verarbeitete Events:**
  - `customer.subscription.created` → User auf PRO setzen
  - `customer.subscription.updated` → Status aktualisieren
  - `customer.subscription.deleted` → User auf FREE setzen
  - `invoice.payment_succeeded` → Zahlung bestätigen
  - `invoice.payment_failed` → Zahlungsfehler behandeln

### **1.2 Datenbankschema-Erweiterungen**

#### **Neue User-Felder:**
```prisma
model User {
  // ... bestehende Felder ...
  
  // Stripe Integration
  stripeCustomerId String? @unique
  subscriptionId   String?
  subscriptionStatus SubscriptionStatus @default(FREE)
  subscriptionTier SubscriptionTier @default(FREE)
  subscriptionEndDate DateTime?
  monthlyQuoteCount Int @default(0)
  quoteCountResetDate DateTime @default(now())
}

enum SubscriptionStatus {
  FREE
  ACTIVE
  PAST_DUE
  CANCELED
  UNPAID
}

enum SubscriptionTier {
  FREE
  PRO
}
```

---

## 🎨 **2. Subscription UI Components**

### **2.1 SubscriptionBanner Component**

#### **Datei:** `src/components/subscription-banner.tsx`
- **Zweck:** Detaillierte Abo-Informationen und Upgrade-Optionen
- **Features:**
  - **Für Free-User:**
    - Progress-Bar für Quote-Limits
    - Free Plan Features aufgelistet
    - Pro Plan Benefits mit Upgrade-Button
  - **Für Pro-User:**
    - Sauberer Pro-Status
    - "Abo verwalten" Button
    - Keine Upgrade-Punkte

#### **Styling:**
- **Farbschema:** Orange-Brand-Farben (`from-orange-50 to-amber-50`)
- **Responsive Design:** Funktioniert auf allen Bildschirmgrößen
- **Branding:** Konsistent mit App-Design

### **2.2 PlanStatusMini Component**

#### **Datei:** `src/components/plan-status-mini.tsx`
- **Zweck:** Kompakte Plan-Anzeige im Dashboard
- **Features:**
  - **Nur für Free-User sichtbar**
  - Zeigt Quote-Limits an
  - "Abo verwalten" Button
- **Position:** Dashboard unter Welcome-Header

### **2.3 PlanStatusBadge Component**

#### **Datei:** `src/components/plan-status-badge.tsx`
- **Zweck:** Plan-Badge neben User-Namen
- **Features:**
  - **FREE:** Hellgrauer Badge (`bg-gray-300`)
  - **PRO:** Orange Badge mit Gradient (`from-[#FFA200] to-[#FFB366]`)
- **Position:** Dashboard, rechts neben User-Vorname

---

## 🚀 **3. Pro-User Features**

### **3.1 Position Editing (Pro-Only)**

#### **Implementierung:**
- **API Route:** `/api/subscription/can-edit-positions`
- **Zweck:** Prüft ob User Positionen bearbeiten darf
- **Logik:** Nur Pro-User können Positionen bearbeiten

#### **UI/UX:**
- **Für Free-User:**
  - "Bearbeiten" Button ist grau und deaktiviert
  - Hinweis: "Bearbeiten nur im Pro-Plan verfügbar"
  - Crown-Icon zur Verdeutlichung
- **Für Pro-User:**
  - "Bearbeiten" Button ist orange und funktional

### **3.2 Quote Limits**

#### **Implementierung:**
- **Free-User:** Maximal 5 Angebote pro Monat
- **Pro-User:** Unbegrenzte Angebote
- **Enforcement:** Server-seitig in `createQuote` Action

#### **UI-Feedback:**
- **Dashboard:** Zeigt verbleibende Angebote an
- **Quote-Limit-Fehler:** "Jetzt upgraden" Button statt "Erneut versuchen"
- **Weiterleitung:** Direkt zu `/einstellungen/app`

### **3.3 PDF Branding Removal**

#### **Implementierung:**
- **Datei:** `src/lib/pdf/generate.ts`
- **Logik:** Bedingte Branding-Anzeige basierend auf Subscription-Tier
- **Code:**
  ```typescript
  const shouldShowBranding = input.userSubscriptionTier !== 'PRO';
  
  if (shouldShowBranding) {
    // AngebotNow Branding nur für Free-User
    drawText('AngebotNow', brandingX, brandingY, 18, true, rgb(0.973, 0.596, 0.075));
    drawText('Professionelle Angebotserstellung', brandingX, brandingY - 20, 10, false, grayscale(0.5));
  }
  ```

#### **API-Integration:**
- **PDF Route:** `/api/quotes/[id]/pdf`
- **User-Context:** `include: { user: true }`
- **Subscription-Status:** Wird automatisch an PDF-Generator übergeben

---

## 🎉 **4. Upgrade Success Experience**

### **4.1 UpgradeSuccessModal Component**

#### **Datei:** `src/components/upgrade-success-modal.tsx`
- **Zweck:** Erfolgs-Popup nach erfolgreichem Pro-Upgrade
- **Features:**
  - **Header:** "Herzlichen Glückwunsch! Du bist jetzt offiziell Pro User"
  - **Feature-Liste:**
    - Unbegrenzte Angebote
    - Positionen bearbeiten
    - Prioritäts-Support
    - Kein AngebotNow Branding in PDF
  - **Styling:** Orange-Brand-Farben, moderne Icons
  - **Interaktivität:** Manuell schließbar

#### **Dashboard-Integration:**
- **URL-Parameter:** `?success=true` nach Stripe-Upgrade
- **Automatisches Öffnen:** Modal öffnet sich automatisch
- **URL-Bereinigung:** Parameter wird nach Öffnung entfernt
- **Status-Update:** Automatischer Reload nach 1 Sekunde

---

## 🔒 **5. Sicherheit & Compliance**

### **5.1 Gesetzeskonformität**

#### **Kündigungsmöglichkeit:**
- **Stripe Customer Portal:** Vollständige Abo-Verwaltung
- **Ein-Klick-Kündigung:** Gesetzeskonform (BGB § 309 Nr. 9)
- **Fernabsatzgesetz:** Erfüllt alle Anforderungen

#### **Webhook-Sicherheit:**
- **Signature-Verifizierung:** Stripe-Webhook-Signature wird geprüft
- **HTTPS-Only:** Alle API-Calls über sichere Verbindungen
- **User-Authentifizierung:** Alle Routes sind geschützt

### **5.2 Datenintegrität**

#### **Subscription-Status:**
- **Server-seitige Validierung:** Alle Checks laufen serverseitig
- **Automatische Updates:** Webhooks aktualisieren Status in Echtzeit
- **Fallback-Logik:** Bei Fehlern wird auf FREE gesetzt

---

## 🎨 **6. UI/UX Verbesserungen**

### **6.1 Dashboard-Layout**

#### **Vorher:**
- Großer Subscription-Banner nahm viel Platz ein
- Wenig Fokus auf aktuelle Angebote

#### **Nachher:**
- **Minimalistischer Plan-Status:** Nur Plan-Badge und verbleibende Angebote
- **Kompakte Anzeige:** Weniger Platz, mehr Fokus
- **Klare Hierarchie:** Plan-Status → Angebote → Aktionen

### **6.2 Settings-Organisation**

#### **Subscription-Banner:**
- **Position:** Über Account-Informationen (prominenter)
- **Content:** Angepasst an User-Status
- **Aktionen:** Direkte Links zu Upgrade/Verwaltung

---

## 🔧 **7. Technische Implementierungsdetails**

### **7.1 Client-Side vs Server-Side**

#### **Client-Side (Sicher):**
- `STRIPE_PLANS` Konfiguration
- UI-Komponenten
- Plan-Status-Anzeige

#### **Server-Side (Geschützt):**
- Stripe API-Calls
- Webhook-Verarbeitung
- PDF-Generierung mit Subscription-Status

### **7.2 Error Handling**

#### **Quote-Limits:**
- **Free-User:** `requiresUpgrade: true` in Error-Response
- **UI-Feedback:** Klare Upgrade-Aufforderung
- **Weiterleitung:** Direkt zu Subscription-Banner

#### **Stripe-Fehler:**
- **Customer Portal:** Fallback bei Fehlern
- **Webhook-Fehler:** Logging und Retry-Logik
- **API-Fehler:** Benutzerfreundliche Fehlermeldungen

---

## 🚀 **8. Deployment & Testing**

### **8.1 Lokales Testing**

#### **Stripe CLI:**
```bash
# Webhooks lokal testen
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Neue Webhook-Secret in .env.local setzen
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxx
```

#### **Pro-User simulieren:**
```bash
# Prisma Studio starten
npx prisma studio

# User manuell auf PRO setzen:
subscriptionTier: 'PRO'
subscriptionStatus: 'ACTIVE'
```

### **8.2 Produktions-Deployment**

#### **Webhook-Konfiguration:**
- **Domain:** `https://www.angebotnow.de/api/stripe/webhook`
- **Events:** Alle Subscription-bezogenen Events
- **Retry-Logic:** Automatische Wiederholung bei Fehlern

---

## ⚙️ **9. Konfiguration & Umgebungsvariablen**

### **9.1 Erforderliche .env Variablen**

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxxxxxxxxxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxxxxxxxxxx
STRIPE_PRO_PRICE_ID=price_xxxxxxxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxx

# NextAuth Configuration
NEXTAUTH_URL=https://www.angebotnow.de
NEXTAUTH_SECRET=your-secret-here
```

### **9.2 Stripe Dashboard Setup**

#### **Products & Prices:**
- **Pro Plan:** 19,99€/Monat
- **Price ID:** In STRIPE_PRO_PRICE_ID setzen

#### **Webhooks:**
- **Endpoint:** `https://www.angebotnow.de/api/stripe/webhook`
- **Events:** Alle Subscription-Events aktivieren

---

## 🔮 **10. Zukünftige Features (Geplant)**

### **10.1 Eigenes Logo in PDF**
- **Zweck:** Pro-User können eigenes Logo hochladen
- **Implementierung:** Logo-Upload + PDF-Integration
- **Position:** Ersetzt AngebotNow Branding

### **10.2 Erweiterte Analytics**
- **Zweck:** Subscription-Metriken und User-Verhalten
- **Features:** Conversion-Rates, Churn-Analyse, Revenue-Tracking

### **10.3 Team-Features**
- **Zweck:** Mehrere User pro Subscription
- **Features:** User-Management, Rollen, Berechtigungen

---

## ✅ **11. Implementierungsstatus**

### **Vollständig implementiert:**
- ✅ Stripe Integration & Webhooks
- ✅ Subscription System (FREE/PRO)
- ✅ Pro-User Features (Position Editing, Quote Limits)
- ✅ PDF Branding Removal
- ✅ Upgrade Success Modal
- ✅ Customer Portal Integration
- ✅ UI/UX Verbesserungen
- ✅ Sicherheit & Compliance

### **Getestet und funktionsfähig:**
- ✅ Lokale Entwicklung
- ✅ Build-Prozess
- ✅ TypeScript-Validierung
- ✅ Error Handling
- ✅ User Experience

---

## 📚 **12. Wartung & Updates**

### **12.1 Regelmäßige Checks**
- **Stripe Webhook-Status:** Dashboard überwachen
- **Subscription-Synchronisation:** Datenbank-Status prüfen
- **Error-Logs:** API-Fehler überwachen

### **12.2 Updates & Verbesserungen**
- **Stripe API:** Regelmäßige Updates auf neueste Version
- **Security:** Webhook-Signature-Verifizierung aktuell halten
- **Performance:** PDF-Generierung optimieren

---

## 🎯 **Zusammenfassung**

**Das Stripe Subscription System ist vollständig implementiert und bietet:**

1. **Professionelle Abo-Verwaltung** mit Stripe
2. **Klare Free/Pro-Unterscheidung** mit erweiterten Features
3. **Gesetzeskonforme Kündigungsmöglichkeit**
4. **Verbesserte User-Experience** mit Upgrade-Flow
5. **Saubere PDFs** für Pro-User ohne Branding
6. **Skalierbare Architektur** für zukünftige Features
7. **Social Login** mit Google und Microsoft
8. **Vollständige Auth-Integration** mit NextAuth.js

**Die App ist jetzt bereit für den kommerziellen Betrieb mit einem vollständigen Subscription-System!** 🚀

**Hinweis:** Email/Passwort Sign-In ist Backend-technisch vollständig implementiert, aber UI-seitig ausgeblendet. Kann bei Bedarf in 5 Minuten aktiviert werden.

---

## 📁 **Dateistruktur der neuen Features**

```
src/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── [...nextauth]/
│   │   │   │   └── route.ts (Google + Microsoft Provider)
│   │   │   ├── register/
│   │   │   │   └── route.ts (Email/Passwort Registrierung)
│   │   │   ├── verify-email/
│   │   │   │   └── route.ts (Email-Verifikation)
│   │   │   ├── forgot-password/
│   │   │   │   └── route.ts (Passwort vergessen)
│   │   │   └── reset-password/
│   │   │       └── route.ts (Passwort zurücksetzen)
│   │   └── stripe/
│   │       ├── create-checkout-session/
│   │       │   └── route.ts
│   │       ├── customer-portal/
│   │       │   └── route.ts
│   │       └── webhook/
│   │           └── route.ts
│   └── einstellungen/
│       └── app/
│           └── page.tsx (SubscriptionBanner integriert)
├── components/
│   ├── subscription-banner.tsx
│   ├── plan-status-mini.tsx
│   ├── plan-status-badge.tsx
│   ├── upgrade-success-modal.tsx
│   └── microsoft-signin-button.tsx
├── lib/
│   ├── auth.ts (Google + Microsoft Provider)
│   ├── stripe.ts (Server-seitige Stripe-Client)
│   ├── stripe-client.ts (Client-seitige Konfiguration)
│   ├── subscription.ts (Subscription-Logik)
│   ├── tokens.ts (Email + Passwort-Reset Token-System)
│   ├── email.ts (Email-Service mit Resend)
│   └── pdf/
│       └── generate.ts (PDF-Generator mit Branding-Logik)
└── prisma/
    └── schema.prisma (Erweiterte User-Modelle + VerificationToken)
```

---

**Dokumentation erstellt von:** AI Assistant  
**Datum:** 31.08.2025  
**Version:** 1.1.0  
**Status:** Vollständig implementiert und bereit für Deployment
