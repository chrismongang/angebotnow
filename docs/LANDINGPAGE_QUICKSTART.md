# Landingpage-System Quickstart Guide

## Für Anfänger: Schritt-für-Schritt Anleitung

### Was wurde erstellt?

Das Landingpage-System für AngebotNow ist jetzt vollständig eingerichtet und einsatzbereit. Hier ist eine Übersicht der wichtigsten Komponenten:

## 📁 Neue Verzeichnisse und Dateien

### 1. Marketing-Layout
- `src/app/(marketing)/layout.tsx` - Spezielles Layout für Marketing-Seiten
- `src/app/(marketing)/globals.css` - Marketing-spezifische Styles

### 2. Landingpage-Komponenten
- `src/components/landing/` - 9 wiederverwendbare Komponenten
- `src/components/landing/index.ts` - Komponenten-Registry

### 3. Content-Management
- `src/content/landing/main.json` - Haupt-Landingpage-Content
- `src/content/onepagers/` - Onepager-Konfigurationen

### 4. Utility-Funktionen
- `src/lib/onepager.ts` - Content-Loading und Merging
- `src/lib/seo.ts` - SEO und Metadata
- `src/lib/utm.ts` - UTM-Parameter-Handling
- `src/lib/ab.ts` - A/B-Testing

### 5. Routen
- `src/app/(marketing)/landing/page.tsx` - Haupt-Landingpage
- `src/app/(marketing)/lp/[slug]/page.tsx` - Dynamische Onepager

## 🚀 Sofort verfügbare URLs

Nach dem Deployment sind folgende URLs verfügbar:

- **Haupt-Landingpage**: `https://angebotnow.de/landing`
- **Handwerker-Onepager**: `https://angebotnow.de/lp/handwerk`
- **Solar-Onepager**: `https://angebotnow.de/lp/solar`
- **Sitemap**: `https://angebotnow.de/sitemap.xml`
- **Robots.txt**: `https://angebotnow.de/robots.txt`

## 🛠️ Wie du neue Onepager erstellst

### Schritt 1: Neue JSON-Datei erstellen

Erstelle eine neue Datei in `src/content/onepagers/`:

```bash
# Beispiel: Für Elektriker
touch src/content/onepagers/elektriker.json
```

### Schritt 2: Content hinzufügen

```json
{
  "meta": {
    "title": "AngebotNow für Elektriker - KI-gestützte Angebotserstellung",
    "description": "Speziell für Elektriker: Erstelle professionelle Angebote in Minuten.",
    "ogImage": "/images/og-elektriker.png"
  },
  "variant": "elektriker",
  "sections": [
    {
      "type": "Hero",
      "props": {
        "eyebrow": "Für Elektriker",
        "title": "Elektro-Angebote in Minuten erstellen",
        "subtitle": "KI erkennt automatisch alle Elektroinstallationen",
        "primaryCta": {
          "label": "Für Elektriker starten",
          "href": "/auth/signin?utm_source=elektriker&utm_medium=landing"
        }
      }
    }
  ]
}
```

### Schritt 3: Fertig!

Die URL `https://angebotnow.de/lp/elektriker` ist automatisch verfügbar.

## 📊 UTM-Parameter für Kampagnen

### Google Ads Kampagne
```
https://angebotnow.de/lp/handwerk?utm_source=google&utm_medium=cpc&utm_campaign=handwerk_q4
```

### Facebook Kampagne
```
https://angebotnow.de/lp/solar?utm_source=facebook&utm_medium=social&utm_campaign=solar_installer
```

### E-Mail Marketing
```
https://angebotnow.de/landing?utm_source=newsletter&utm_medium=email&utm_campaign=monthly_update
```

## 🎨 Komponenten verstehen

### Hero-Komponente
```json
{
  "type": "Hero",
  "props": {
    "eyebrow": "Für Handwerker",
    "title": "Hauptüberschrift",
    "subtitle": "Untertitel",
    "primaryCta": {
      "label": "Button-Text",
      "href": "/link"
    },
    "badges": ["DSGVO-konform", "Made in Germany"]
  }
}
```

### FeatureGrid-Komponente
```json
{
  "type": "FeatureGrid",
  "props": {
    "title": "Warum AngebotNow?",
    "features": [
      {
        "icon": "clock",
        "title": "Zeit sparen",
        "description": "Reduziere deine Angebotserstellung von Stunden auf Minuten."
      }
    ]
  }
}
```

### Pricing-Komponente
```json
{
  "type": "Pricing",
  "props": {
    "title": "Einfache, transparente Preise",
    "plans": [
      {
        "name": "Starter",
        "price": { "monthly": 0 },
        "features": ["3 Angebote pro Monat"],
        "cta": {
          "label": "Kostenlos starten",
          "href": "/auth/signin"
        }
      }
    ]
  }
}
```

## 🔧 Häufige Anpassungen

### 1. Text ändern
Bearbeite einfach die JSON-Dateien in `src/content/`:

```json
{
  "title": "Neuer Titel hier",
  "description": "Neue Beschreibung hier"
}
```

### 2. Button-Links ändern
```json
{
  "primaryCta": {
    "label": "Neuer Button-Text",
    "href": "/neuer-link"
  }
}
```

### 3. Bilder hinzufügen
```json
{
  "image": {
    "src": "/images/neues-bild.jpg",
    "alt": "Beschreibung des Bildes"
  }
}
```

## 📈 Analytics verstehen

### Automatisches Tracking
Das System erfasst automatisch:
- Seitenaufrufe
- UTM-Parameter
- CTA-Klicks
- Scroll-Tiefe
- Formular-Interaktionen

### Google Analytics 4 Events
```javascript
// Automatisch erfasste Events:
gtag('event', 'page_view', { utm_source: 'google' });
gtag('event', 'cta_click', { cta_type: 'primary' });
gtag('event', 'scroll_depth', { scroll_depth: 75 });
```

## 🧪 A/B-Tests durchführen

### Hero-Headline testen
Das System testet automatisch verschiedene Headlines:

1. **Control**: "Schneller zu Aufträgen mit KI-gestützten Angeboten"
2. **Variant A**: "KI erstellt deine Angebote automatisch"
3. **Variant B**: "Angebotserstellung in 5 Minuten"

### Neue Tests hinzufügen
Bearbeite `src/lib/ab.ts`:

```typescript
const AB_TESTS = {
  new_test: {
    name: 'Neuer Test',
    enabled: true,
    variants: [
      {
        name: 'control',
        weight: 50,
        config: { /* Control-Konfiguration */ }
      },
      {
        name: 'variant_a',
        weight: 50,
        config: { /* Variant-Konfiguration */ }
      }
    ]
  }
};
```

## 🚨 Wichtige Hinweise

### 1. Manrope-Schriftart
Die Schriftart Manrope ist bereits korrekt konfiguriert und wird automatisch verwendet.

### 2. Mobile-Optimierung
Alle Komponenten sind mobile-first optimiert und funktionieren auf allen Geräten.

### 3. SEO-Optimierung
- Automatische Meta-Tags
- Strukturierte Daten
- Sitemap-Generierung
- Robots.txt

### 4. Performance
- Statisches Rendering
- Optimierte Bilder
- Minimale JavaScript-Bundles

## 🔍 Debugging

### Probleme mit Komponenten
```bash
# Prüfe die Browser-Konsole auf Fehler
# Validiere JSON-Syntax in Content-Dateien
```

### UTM-Parameter nicht erfasst
```bash
# Prüfe Cookie-Einstellungen
# Validiere UTM-Parameter-Format
```

### SEO-Meta-Tags fehlen
```bash
# Prüfe generateMetadata-Funktion
# Validiere Content-Konfiguration
```

## 📞 Support

Bei Fragen oder Problemen:

1. **Dokumentation lesen**: `docs/LANDINGPAGE_SYSTEM.md`
2. **Code-Beispiele**: Schaue dir die bestehenden Onepager an
3. **Debug-Modus**: Aktiviere Console-Logging für Details

## 🎯 Nächste Schritte

1. **Teste die URLs**: Besuche `/landing` und `/lp/handwerk`
2. **Erstelle einen neuen Onepager**: Für deine nächste Kampagne
3. **Analytics einrichten**: Google Analytics 4 konfigurieren
4. **A/B-Tests starten**: Verschiedene Varianten testen

Das System ist jetzt vollständig einsatzbereit und kann sofort für Marketing-Kampagnen verwendet werden! 🚀
