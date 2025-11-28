# Angebot-Features: Bauvorhaben, Gültigkeitsdauer, § 13b UStG & Löschfunktion

## Übersicht

Die Angebots-PDFs wurden um wichtige Features erweitert:
1. **Bauvorhaben (BV)-Feld**: Optionales Feld für die Projektadresse
2. **Gültigkeitsdauer**: Konfigurierbare Gültigkeitsdauer für Angebote
3. **§ 13b UStG - Reverse Charge**: Angebote ohne Mehrwertsteuer für Bauunternehmen
4. **Löschfunktion**: Angebote löschen mit Swipe-to-Delete und Bestätigungsmodal (siehe [QUOTE_DELETE_FEATURE.md](./QUOTE_DELETE_FEATURE.md))

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

## 3. § 13b UStG - Reverse Charge für Bauunternehmen

### Funktionsweise

Gemäß § 13b UStG (Umsatzsteuergesetz) entfällt die Mehrwertsteuer bei Angeboten an andere Bauunternehmen. Die Steuerschuldnerschaft liegt beim Leistungsempfänger (Reverse Charge).

#### **Rechtliche Grundlage**
- **§ 13b UStG**: Steuerschuldnerschaft des Leistungsempfängers
- Gilt für Bauleistungen zwischen Bauunternehmen
- Der Leistungsempfänger (Auftraggeber) ist für die Umsatzsteuer zuständig
- Der Leistungserbringer (Anbieter) stellt keine MwSt. in Rechnung

#### **Funktionsweise in der App**
- Checkbox "Auftraggeber ist Bauunternehmen (§ 13b UStG - keine MwSt.)"
- Wenn aktiviert:
  - **Keine MwSt. wird berechnet** (Gesamtbetrag = Zwischensumme)
  - **Hinweistext im PDF**: "Steuerschuldnerschaft des Leistungsempfängers gem. § 13b UStG"
  - **UI-Anzeige**: Statt "19% MwSt." wird "§ 13b UStG" angezeigt

### UI-Integration

**Lage**: 
- **Quote-Erstellung**: Dashboard → Angebot erstellen → Nach "Name des Auftraggebers"
- **Quote-Bearbeitung**: Angebots-Detailseite → Auftraggeberinformationen bearbeiten

**Checkbox**:
- Label: "Auftraggeber ist Bauunternehmen (§ 13b UStG - keine MwSt.)"
- Erklärungstext erscheint bei Aktivierung
- Kann jederzeit aktiviert/deaktiviert werden

### Datenbank-Schema

```prisma
model Quote {
  // ... andere Felder ...
  excludeVAT   Boolean     @default(false) // § 13b UStG - Steuerschuldnerschaft des Leistungsempfängers
}
```

### Validierung

- **Typ**: Boolean (true/false)
- **Default**: false (MwSt. wird standardmäßig berechnet)
- **Änderbar**: Kann bei Quote-Erstellung und -Bearbeitung geändert werden

### Anzeige im PDF

**Normale Berechnung (excludeVAT = false)**:
```
Zwischensumme:                   1.000,00 EUR
19% MwSt.:                         190,00 EUR
─────────────────────────────────────────────
Gesamtbetrag:                    1.190,00 EUR
```

**§ 13b UStG (excludeVAT = true)**:
```
Zwischensumme:                   1.000,00 EUR
Steuerschuldnerschaft des Leistungsempfängers gem. § 13b UStG
─────────────────────────────────────────────
Gesamtbetrag:                    1.000,00 EUR
```

### UI-Anzeige in der Quote-Detailseite

**Normale Berechnung**:
- Zwischensumme: 1.000,00 EUR
- 19% MwSt.: 190,00 EUR
- Gesamt: 1.190,00 EUR

**§ 13b UStG aktiviert**:
- Zwischensumme: 1.000,00 EUR
- § 13b UStG: —
- Gesamt: 1.000,00 EUR

## Technische Implementierung

### Backend

#### **Quote-Erstellung** (`src/lib/actions.ts`)
```typescript
// BV-Feld wird aus FormData gelesen
const bauvorhaben = formData.get('bauvorhaben') as string
const excludeVAT = formData.get('excludeVAT') === 'true'

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
    excludeVAT: excludeVAT,
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

// Total-Berechnung mit § 13b UStG Unterstützung
const excludeVAT = input.excludeVAT || false;

if (excludeVAT) {
  // § 13b UStG - Keine MwSt., stattdessen Hinweistext
  const legalText = "Steuerschuldnerschaft des Leistungsempfängers gem. § 13b UStG";
  drawText(legalText, totalSectionLeft, currentY, 9, false, rgb(0, 0, 0), page);
  currentY -= 20;
  
  // Total = Subtotal (keine MwSt.)
  const total = subtotal;
} else {
  // Normale Berechnung mit 19% MwSt.
  const vat = subtotal * 0.19;
  const total = subtotal + vat;
  
  drawText('19% MwSt.:', totalSectionLeft, currentY, 10, true, rgb(0, 0, 0), page);
  const vatText = `${formatCurrency(vat)} EUR`;
  drawText(vatText, totalSectionRight - vatTextWidth, currentY, 10, true, rgb(0, 0, 0), page);
  currentY -= 20;
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
  excludeVAT: quote.excludeVAT || false,
})
```

### Frontend

#### **Angebot-Erstellung** (`src/app/dashboard/page.tsx`)
```typescript
// State
const [bauvorhaben, setBauvorhaben] = useState('')
const [excludeVAT, setExcludeVAT] = useState(false)

// UI - § 13b UStG Checkbox (nach Auftraggeber-Name)
<div className="space-y-3">
  <div className="flex items-center gap-2">
    <input
      type="checkbox"
      id="excludeVAT"
      checked={excludeVAT}
      onChange={(e) => setExcludeVAT(e.target.checked)}
    />
    <Label htmlFor="excludeVAT">
      Auftraggeber ist Bauunternehmen (§ 13b UStG - keine MwSt.)
    </Label>
  </div>
  {excludeVAT && (
    <p className="text-sm text-[#676767] pl-6">
      Bei Angeboten an andere Bauunternehmen entfällt die Mehrwertsteuer gem. § 13b UStG.
    </p>
  )}
</div>

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

### Migration 3: § 13b UStG Feld
```sql
-- 20251111174759_add_exclude_vat
ALTER TABLE "public"."Quote" ADD COLUMN "excludeVAT" BOOLEAN NOT NULL DEFAULT false;
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

### 3. § 13b UStG aktivieren

**Bei Quote-Erstellung**:
1. Angebot erstellen
2. Nach Eingabe des Auftraggeber-Namens
3. Checkbox "Auftraggeber ist Bauunternehmen (§ 13b UStG - keine MwSt.)" aktivieren
4. Angebot erstellen

**Bei Quote-Bearbeitung**:
1. Zu Angebots-Detailseite navigieren
2. "Auftraggeberinformationen bearbeiten" klicken
3. Checkbox "Auftraggeber ist Bauunternehmen (§ 13b UStG - keine MwSt.)" aktivieren/deaktivieren
4. "Speichern" klicken

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

### PDF-Ausgabe mit § 13b UStG

```
[Positions-Tabelle...]

Zwischensumme:                   5.000,00 EUR
Steuerschuldnerschaft des Leistungsempfängers gem. § 13b UStG
─────────────────────────────────────────────
Gesamtbetrag:                    5.000,00 EUR

[Gültigkeitsdauer...]
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

### § 13b UStG
- **Nur bei B2B-Bauunternehmen**: Aktivieren Sie diese Option nur, wenn der Auftraggeber ein Bauunternehmen ist
- **Rechtliche Prüfung**: Stellen Sie sicher, dass die Voraussetzungen für § 13b UStG erfüllt sind
- **Klarstellung im PDF**: Der Hinweistext im PDF macht die Steuerschuldnerschaft des Leistungsempfängers deutlich
- **Nachträgliche Änderung**: Kann jederzeit bei der Quote-Bearbeitung aktiviert/deaktiviert werden

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

### § 13b UStG wird nicht angewendet
- Prüfen Sie, ob die Checkbox aktiviert wurde
- Prüfen Sie, ob `excludeVAT` in der Datenbank auf `true` gesetzt ist
- Prüfen Sie die PDF-Generierung - der Hinweistext sollte erscheinen
- Bei bestehenden Quotes: Prüfen Sie, ob die Quote-Bearbeitung erfolgreich war

## Verwandte Dokumentation

- [USER_DATA_INTEGRATION.md](./USER_DATA_INTEGRATION.md) - Benutzerdaten-Verwaltung
- [PDF_GENERATION.md](./PDF_GENERATION.md) - PDF-Generierung im Detail
- [QUOTE_DELETE_FEATURE.md](./QUOTE_DELETE_FEATURE.md) - Angebot-Löschfunktion (Swipe-to-Delete)

