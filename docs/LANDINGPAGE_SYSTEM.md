# Landingpage-System für AngebotNow

## Übersicht

Das Landingpage-System für AngebotNow ist ein modulares, content-getriebenes System, das es ermöglicht, schnell neue Landingpages und Onepager für verschiedene Kampagnen zu erstellen. Das System ist vollständig von der Hauptanwendung isoliert und nutzt statisches Rendering für optimale Performance.

## Architektur

### Verzeichnisstruktur

```
src/
├── app/
│   └── (marketing)/                    # Marketing-spezifische Routen
│       ├── layout.tsx                  # Marketing-Layout (ohne Auth)
│       ├── globals.css                 # Marketing-spezifische Styles
│       ├── landing/
│       │   └── page.tsx                # Haupt-Landingpage
│       ├── lp/
│       │   └── [slug]/
│       │       └── page.tsx            # Dynamische Onepager
│       ├── sitemap.xml/
│       │   └── route.ts                # Automatische Sitemap
│       └── robots.txt/
│           └── route.ts                # SEO-optimierte Robots.txt
├── components/
│   ├── landing/                        # Landingpage-Komponenten
│   │   ├── Hero.tsx
│   │   ├── SocialProof.tsx
│   │   ├── FeatureGrid.tsx
│   │   ├── ProblemSolution.tsx
│   │   ├── Steps.tsx
│   │   ├── Pricing.tsx
│   │   ├── FAQ.tsx
│   │   ├── CTA.tsx
│   │   ├── Footer.tsx
│   │   └── index.ts                    # Komponenten-Registry
│   └── analytics/
│       └── tracker.tsx                 # Analytics & Tracking
├── content/
│   ├── landing/
│   │   └── main.json                   # Haupt-Landingpage-Content
│   └── onepagers/
│       ├── base.json                   # Basis-Konfiguration
│       ├── handwerk.json               # Handwerker-Onepager
│       └── solar.json                  # Solar-Onepager
└── lib/
    ├── onepager.ts                     # Content-Loading & Merging
    ├── seo.ts                          # SEO & Metadata
    ├── utm.ts                          # UTM-Parameter-Handling
    └── ab.ts                           # A/B-Testing
```

## Komponenten-System

### Verfügbare Komponenten

1. **Hero** - Hauptbanner mit CTA
2. **SocialProof** - Logos, Testimonials, Statistiken
3. **FeatureGrid** - Feature-Übersicht in Grid-Format
4. **ProblemSolution** - Vorher/Nachher-Darstellung
5. **Steps** - Schritt-für-Schritt-Anleitung
6. **Pricing** - Preispläne mit Vergleich
7. **FAQ** - Häufige Fragen mit Accordion
8. **CTA** - Call-to-Action-Sektion
9. **Footer** - Footer mit Links und Kontakt

### Komponenten-Registry

Alle Komponenten sind in der Registry registriert und können dynamisch geladen werden:

```typescript
export const componentRegistry = {
  Hero,
  SocialProof,
  FeatureGrid,
  // ... weitere Komponenten
} as const;
```

## Content-Management

### JSON-basierte Konfiguration

Landingpages werden über JSON-Dateien konfiguriert:

```json
{
  "meta": {
    "title": "Seitentitel",
    "description": "Meta-Description",
    "keywords": ["keyword1", "keyword2"],
    "ogImage": "/images/og-image.png"
  },
  "sections": [
    {
      "type": "Hero",
      "props": {
        "title": "Hauptüberschrift",
        "subtitle": "Untertitel",
        "primaryCta": {
          "label": "Button-Text",
          "href": "/link"
        }
      }
    }
  ]
}
```

### Content-Merging

Das System unterstützt das Merging von Basis- und spezifischen Konfigurationen:

1. **Base-Konfiguration** (`base.json`) - Standard-Sektionen
2. **Spezifische Konfiguration** (`{slug}.json`) - Kampagnen-spezifische Anpassungen
3. **UTM-Overrides** - Dynamische Anpassungen basierend auf UTM-Parametern

## SEO & Performance

### Statisches Rendering

Alle Landingpages werden statisch gerendert (`export const dynamic = 'force-static'`) für optimale Performance.

### SEO-Features

- Automatische Meta-Tags
- Open Graph & Twitter Cards
- Strukturierte Daten (FAQ, Organization, Software)
- Automatische Sitemap-Generierung
- SEO-optimierte Robots.txt

### Performance-Optimierungen

- Lazy Loading von Komponenten
- Optimierte Bilder
- Minimale JavaScript-Bundles
- CDN-freundliche Struktur

## UTM-Tracking

### UTM-Parameter-Handling

Das System erfasst und speichert UTM-Parameter automatisch:

```typescript
// UTM-Parameter werden automatisch erfasst
const utmParams = extractUTMParams(searchParams);
await saveUTMParams(utmParams);
```

### Conversion-Tracking

UTM-Daten werden für Conversion-Tracking verwendet:

```typescript
const conversionParams = createConversionParams(utmParams, 'signup');
```

## A/B-Testing

### Verfügbare Tests

1. **Hero Headline Test** - Verschiedene Hauptüberschriften
2. **CTA Button Test** - Verschiedene Button-Texte

### Test-Konfiguration

```typescript
const AB_TESTS = {
  hero_headline: {
    name: 'Hero Headline Test',
    enabled: true,
    variants: [
      {
        name: 'control',
        weight: 50,
        config: { title: 'Original Title' }
      },
      {
        name: 'variant_a',
        weight: 25,
        config: { title: 'Alternative Title' }
      }
    ]
  }
};
```

## Analytics & Tracking

### Google Analytics 4 Integration

```typescript
// Automatisches Page-View-Tracking
gtag('event', 'page_view', {
  page_title: document.title,
  utm_source: utmParams.utm_source,
  variant: variant,
});

// CTA-Click-Tracking
gtag('event', 'cta_click', {
  cta_type: 'primary',
  cta_text: 'Kostenlos starten',
});
```

### Custom Analytics

Das System unterstützt auch Custom Analytics-Lösungen über Hooks:

```typescript
const { trackCTAClick } = useCTATracking();
const { trackFormStart } = useFormTracking();
```

## Neue Onepager erstellen

### 1. Content-Datei erstellen

Erstelle eine neue JSON-Datei in `src/content/onepagers/`:

```json
{
  "meta": {
    "title": "AngebotNow für [Zielgruppe]",
    "description": "Spezifische Beschreibung für Zielgruppe",
    "ogImage": "/images/og-[zielgruppe].png"
  },
  "variant": "[zielgruppe]",
  "sections": [
    // Sektionen hier definieren
  ]
}
```

### 2. Route ist automatisch verfügbar

Die Route `/lp/[zielgruppe]` ist automatisch verfügbar, sobald die JSON-Datei existiert.

### 3. UTM-Parameter hinzufügen

Füge UTM-spezifische Anpassungen in der Content-Datei hinzu:

```json
{
  "primaryCta": {
    "label": "Für [Zielgruppe] starten",
    "href": "/auth/signin?utm_source=[zielgruppe]&utm_medium=landing"
  }
}
```

## Best Practices

### Content-Erstellung

1. **Konsistente Struktur** - Verwende die gleiche Sektionen-Reihenfolge
2. **Mobile-First** - Alle Inhalte müssen mobile-optimiert sein
3. **SEO-optimiert** - Verwende relevante Keywords in Titeln und Beschreibungen
4. **Call-to-Actions** - Jede Seite sollte klare CTAs haben

### Performance

1. **Bildoptimierung** - Verwende optimierte Bilder mit korrekten Alt-Texten
2. **Lazy Loading** - Nicht-kritische Sektionen werden lazy geladen
3. **Minimale Dependencies** - Vermeide unnötige JavaScript-Bibliotheken

### Analytics

1. **UTM-Parameter** - Verwende konsistente UTM-Parameter für alle Kampagnen
2. **Conversion-Tracking** - Verfolge alle wichtigen Conversion-Events
3. **A/B-Tests** - Teste regelmäßig verschiedene Varianten

## Deployment

### Statische Generierung

```bash
# Build für Produktion
npm run build

# Statische Seiten werden automatisch generiert
# /landing
# /lp/handwerk
# /lp/solar
# /sitemap.xml
# /robots.txt
```

### Umgebungsvariablen

```env
NEXT_PUBLIC_BASE_URL=https://angebotnow.de
```

## Wartung & Updates

### Content-Updates

1. **JSON-Dateien bearbeiten** - Direkte Bearbeitung der Content-Dateien
2. **Neue Sektionen hinzufügen** - Erweitere die Komponenten-Registry
3. **A/B-Tests anpassen** - Bearbeite die Test-Konfiguration in `ab.ts`

### Monitoring

- **Performance** - Überwache Core Web Vitals
- **Analytics** - Verfolge Conversion-Raten und UTM-Performance
- **SEO** - Überwache Rankings und organischen Traffic

## Troubleshooting

### Häufige Probleme

1. **Komponente wird nicht gerendert**
   - Prüfe, ob die Komponente in der Registry registriert ist
   - Validiere die JSON-Syntax

2. **UTM-Parameter werden nicht erfasst**
   - Prüfe die Cookie-Einstellungen
   - Validiere die UTM-Parameter-Formate

3. **SEO-Meta-Tags fehlen**
   - Prüfe die `generateMetadata`-Funktion
   - Validiere die Content-Konfiguration

### Debug-Modus

```typescript
// Debug-Informationen aktivieren
console.log('Config:', config);
console.log('UTM Params:', utmParams);
console.log('AB Test Variant:', variant);
```

## Erweiterungen

### Neue Komponenten hinzufügen

1. Komponente in `src/components/landing/` erstellen
2. In `index.ts` registrieren
3. TypeScript-Typen erweitern
4. Dokumentation aktualisieren

### CMS-Integration

Das System kann erweitert werden, um ein CMS zu unterstützen:

1. API-Endpoints für Content-Management
2. Admin-Interface für Content-Bearbeitung
3. Versionierung und Rollback-Funktionen

### Mehrsprachigkeit

Für internationale Kampagnen:

1. i18n-Integration
2. Sprach-spezifische Content-Dateien
3. Automatische Sprach-Erkennung
