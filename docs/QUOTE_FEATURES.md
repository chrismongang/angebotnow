# Angebot-Features: Bauvorhaben & Gültigkeitsdauer

## Übersicht

Die Angebots-PDFs wurden um zwei wichtige Features erweitert:
1. **Bauvorhaben (BV)-Feld**: Optionales Feld für die Projektadresse
2. **Gültigkeitsdauer**: Konfigurierbare Gültigkeitsdauer für Angebote

## 1. Bauvorhaben (BV)-Feld

### Funktionsweise

Das Bauvorhaben-Feld ermöglicht es, die Projektadresse im Angebot anzugeben, die von der Kundenadresse abweichen kann.

#### **Automatische Übernahme von Adresse**
- Wenn der User eine Kundenadresse eingibt, kann das BV-Feld automatisch übernommen werden
- Button "Von Adresse übernehmen" erscheint, wenn Adresse vorhanden ist
- Format: `[Straße], [PLZ Ort]`

#### **Manuelle Eingabe**
- Das BV-Feld kann auch separat ausgefüllt werden
- Nützlich, wenn die Projektadresse von der Kundenadresse abweicht
- Beispiel: Kunde wohnt in Berlin, aber das Projekt ist in München

#### **Anzeige im PDF**
- Wird über der Projektbeschreibung angezeigt
- Format: `BV: [eingegebener Text]`
- Nur sichtbar, wenn ein Wert eingegeben wurde

### UI-Integration

**Lage**: Dashboard → Angebot erstellen → Adresse hinzufügen (Checkbox aktivieren)

**Felder**:
1. Straße & Hausnummer
2. PLZ & Ort
3. **Bauvorhaben (optional)**
   - Input-Feld
   - Button "Von Adresse übernehmen" (erscheint nur bei vorhandener Adresse)

### Datenbank-Schema

```prisma
model Quote {
  // ... andere Felder ...
  clientStreet String?
  clientCity   String?
  bauvorhaben  String?  // NEU: Bauvorhaben
}
```

### Validierung

- **Maximale Länge**: 200 Zeichen
- **Optional**: Feld kann leer bleiben
- **Automatische Generierung**: Wenn Adresse vorhanden, aber BV leer → wird automatisch aus Adresse generiert

## 2. Gültigkeitsdauer für Angebote

### Funktionsweise

Die Gültigkeitsdauer bestimmt, wie lange ein Angebot gültig ist. Dieser Wert kann pro User in den Einstellungen konfiguriert werden.

#### **Standard-Wert**
- **Default**: 30 Tage für alle neuen User
- Wird automatisch gesetzt, wenn nicht konfiguriert

#### **Konfiguration**
- **Lage**: Einstellungen → Dein Konto → Geschäftsinformationen
- **Feld**: "Gültigkeitsdauer für Angebote (Tage)"
- **Eingabe**: Zahl (Minimum: 1)
- **Verhalten**: 
  - Feld kann vollständig geleert werden (wird beim Speichern auf 30 gesetzt)
  - Beim Verlassen des Feldes wird automatisch 30 gesetzt, wenn leer

#### **Anzeige im PDF**
- Positioniert **über der Grußformel**
- Format: `"Dieses Angebot ist X Tage ab Ausstellungsdatum gültig. Nach Ablauf dieser Frist behalten wir uns vor, Preise und Leistungen anzupassen."`
- Automatischer Zeilenumbruch bei langem Text
- Verwendet die konfigurierte Anzahl der Tage des Users

### Datenbank-Schema

```prisma
model User {
  // ... andere Felder ...
  offerValidityDays Int @default(30)  // Gültigkeitsdauer in Tagen
}
```

### Validierung

- **Minimum**: 1 Tag
- **Default**: 30 Tage (wenn nicht gesetzt)
- **Typ**: Integer

## Technische Implementierung

### Backend

#### **Quote-Erstellung** (`src/lib/actions.ts`)
```typescript
// BV-Feld wird aus FormData gelesen
const bauvorhaben = formData.get('bauvorhaben') as string

// Logik: Wenn Adresse vorhanden aber BV leer, BV aus Adresse generieren
let finalBauvorhaben = validatedData.bauvorhaben || null
if (!finalBauvorhaben && includeAddress && validatedData.clientStreet && validatedData.clientCity) {
  finalBauvorhaben = `${validatedData.clientStreet}, ${validatedData.clientCity}`
}

// Speicherung in Datenbank
await prisma.quote.create({
  data: {
    // ... andere Felder ...
    bauvorhaben: finalBauvorhaben,
  }
})
```

#### **PDF-Generierung** (`src/lib/pdf/generate.ts`)
```typescript
// BV-Anzeige
if (input.bauvorhaben && input.bauvorhaben.trim()) {
  drawText('BV:', recipientX, currentContentY, 11, true, rgb(0, 0, 0), page);
  drawText(input.bauvorhaben, recipientX + 40, currentContentY, 11, false, rgb(0, 0, 0), page);
  currentContentY -= 25; // Abstand zwischen BV und Projektbeschreibung
}

// Gültigkeitsdauer-Anzeige
const validityDays = input.offerValidityDays || 30;
const validityText = `Dieses Angebot ist ${validityDays} Tage ab Ausstellungsdatum gültig. Nach Ablauf dieser Frist behalten wir uns vor, Preise und Leistungen anzupassen.`;
const validityLines = drawWrappedText(validityText, recipientX, currentY, totalSectionWidth, 10, false, rgb(0, 0, 0), page);
```

#### **API-Route** (`src/app/api/quotes/[id]/pdf/route.ts`)
```typescript
// Gültigkeitsdauer aus User-Daten lesen
const userData = await getUserDataFromDB(quote.userId)
const offerValidityDays = userData.offerValidityDays || 30

// An PDF-Generierung übergeben
const pdfBytes = await generatePDF({
  // ... andere Parameter ...
  bauvorhaben: quote.bauvorhaben || undefined,
  offerValidityDays: offerValidityDays,
})
```

### Frontend

#### **Angebot-Erstellung** (`src/app/dashboard/page.tsx`)
```typescript
// State
const [bauvorhaben, setBauvorhaben] = useState('')

// UI im Adress-Bereich
{includeAddress && (
  <div className="space-y-3 pl-6">
    {/* ... Adressfelder ... */}
    
    {/* Bauvorhaben */}
    <div className="space-y-2">
      <Label>Bauvorhaben (optional)</Label>
      <Input
        value={bauvorhaben}
        onChange={(e) => setBauvorhaben(e.target.value)}
        placeholder={clientStreet && clientCity 
          ? `${clientStreet}, ${clientCity}` 
          : "z.B. Musterstraße 123, 90475 Nürnberg"}
      />
      {clientStreet && clientCity && (
        <button onClick={() => setBauvorhaben(`${clientStreet}, ${clientCity}`)}>
          Von Adresse übernehmen
        </button>
      )}
    </div>
  </div>
)}
```

#### **Einstellungen** (`src/app/einstellungen/konto/page.tsx`)
```typescript
// Gültigkeitsdauer-Feld
<Input
  type="number"
  min="1"
  value={userData.offerValidityDays || ''}
  onChange={(e) => {
    const value = e.target.value;
    if (value === '') {
      setUserData({...userData, offerValidityDays: undefined});
      return;
    }
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue >= 1) {
      setUserData({...userData, offerValidityDays: numValue});
    }
  }}
  onBlur={(e) => {
    if (e.target.value === '' || !userData.offerValidityDays) {
      setUserData({...userData, offerValidityDays: 30});
    }
  }}
/>
```

## Datenbank-Migrationen

### Migration 1: Bauvorhaben-Feld
```sql
-- 20251101210703_add_bauvorhaben
ALTER TABLE "public"."Quote" ADD COLUMN "bauvorhaben" TEXT;
```

### Migration 2: Gültigkeitsdauer-Feld
```sql
-- 20251101213603_add_offer_validity_days
ALTER TABLE "public"."User" ADD COLUMN "offerValidityDays" INTEGER NOT NULL DEFAULT 30;
```

## Verwendung

### 1. Bauvorhaben hinzufügen

**Szenario A: Adresse automatisch übernehmen**
1. Angebot erstellen
2. "Adresse hinzufügen" aktivieren
3. Straße und PLZ/Ort eingeben
4. Button "Von Adresse übernehmen" klicken → BV wird automatisch gefüllt

**Szenario B: Manuelle Eingabe**
1. Angebot erstellen
2. "Adresse hinzufügen" aktivieren (optional)
3. Im BV-Feld die Projektadresse eingeben
4. Angebot erstellen

**Szenario C: Kein BV**
1. Angebot erstellen
2. BV-Feld leer lassen
3. Kein BV wird im PDF angezeigt

### 2. Gültigkeitsdauer konfigurieren

1. Zu Einstellungen → Dein Konto navigieren
2. "Bearbeiten" klicken
3. Zu "Geschäftsinformationen" scrollen
4. Bei "Gültigkeitsdauer für Angebote (Tage)" die gewünschte Anzahl eingeben
5. "Speichern" klicken
6. Alle zukünftigen PDFs verwenden diese Gültigkeitsdauer

## Beispiele

### PDF-Ausgabe mit BV

```
Angebot
Angebot-Nr.: AN20250001
Datum: 01.11.2025
─────────────────────────────

BV: Musterstraße 123, 90475 Nürnberg

Detaillierte Projektbeschreibung...

[Positions-Tabelle...]
```

### PDF-Ausgabe mit Gültigkeitsdauer

```
[Totals-Sektion...]

Dieses Angebot ist 60 Tage ab Ausstellungsdatum gültig. 
Nach Ablauf dieser Frist behalten wir uns vor, Preise 
und Leistungen anzupassen.

Mit freundlichen Grüßen
Inatros GmbH
```

## Best Practices

### Bauvorhaben
- **Immer angeben**, wenn die Projektadresse von der Kundenadresse abweicht
- **Klare Formatierung**: Straße, PLZ Ort (z.B. "Hauptstraße 42, 90475 Nürnberg")
- **Bei gleicher Adresse**: Kann von Adresse automatisch übernommen werden

### Gültigkeitsdauer
- **Standard**: 30 Tage sind für die meisten Fälle ausreichend
- **Längere Projekte**: Bei größeren Projekten 60-90 Tage sinnvoll
- **Gesetzliche Vorgaben**: Prüfen Sie gesetzliche Mindestlaufzeiten in Ihrer Region

## Fehlerbehebung

### BV erscheint nicht im PDF
- Prüfen Sie, ob das BV-Feld ausgefüllt wurde
- Prüfen Sie, ob die Adresse-Checkbox aktiviert war
- BV wird nur angezeigt, wenn ein Wert vorhanden ist

### Gültigkeitsdauer wird nicht gespeichert
- Prüfen Sie, ob der Next.js Dev Server nach Schema-Änderungen neu gestartet wurde
- Prüfen Sie, ob die Migration erfolgreich angewendet wurde
- Prüfen Sie die Browser-Konsole auf Fehler

### Gültigkeitsdauer zeigt immer 30 Tage
- Prüfen Sie Ihre Einstellungen
- Stellen Sie sicher, dass der Wert gespeichert wurde
- Prüfen Sie, ob `offerValidityDays` in der Datenbank vorhanden ist

## Verwandte Dokumentation

- [USER_DATA_INTEGRATION.md](./USER_DATA_INTEGRATION.md) - Benutzerdaten-Verwaltung
- [PDF_GENERATION.md](./PDF_GENERATION.md) - PDF-Generierung im Detail

