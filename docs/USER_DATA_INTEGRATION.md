# Benutzerdaten-Integration

## Übersicht

Die Anwendung wurde erweitert, um Benutzerdaten zu verwalten und diese in PDFs und der Benutzeroberfläche zu verwenden.

## Implementierte Features

### 1. Erweiterte Konto-Seite (`/einstellungen/konto`)

#### **Persönliche Informationen**
- Vorname (wird im Dashboard angezeigt)
- Nachname

#### **Firmeninformationen**
- Firmenname
- Straße & Hausnummer
- PLZ & Ort
- E-Mail
- Telefon

#### **Geschäftsinformationen**
- Steuernummer
- USt-IdNr.
- Bankname
- IBAN
- BIC/SWIFT

#### **Angebot-Einstellungen**
- Angebots-Präfix (z.B. "AN")
- Währung (z.B. "EUR")
- Zahlungsbedingungen (z.B. "30 Tage netto")
- Gültigkeit (z.B. "30 Tage")

### 2. Datenverwaltung

#### **Utility-Funktionen** (`src/lib/user-data.ts`)
```typescript
// Benutzerdaten laden
getUserData(): UserData

// Benutzerdaten speichern
saveUserData(data: UserData): void

// Firmeninformationen für PDF
getCompanyInfoForPDF(): CompanyInfo

// Vorname für Dashboard
getFirstName(): string

// Vollständiger Name
getFullName(): string
```

#### **Lokale Speicherung**
- Daten werden im `localStorage` gespeichert
- Fallback auf Standarddaten, wenn keine gespeicherten Daten vorhanden
- Server-seitige Kompatibilität (keine localStorage-Zugriffe)

### 3. Dashboard-Integration

#### **Dynamischer Vorname**
- Der Vorname aus den Benutzerdaten wird unter "Willkommen!" angezeigt
- Automatische Aktualisierung beim Laden der Seite

### 4. PDF-Integration

#### **Automatische Firmeninformationen**
- Firmenname, Adresse, E-Mail und Telefon werden automatisch in PDFs eingefügt
- Positionierung in der oberen rechten Ecke des PDFs
- Format: `Firmenname, Straße, PLZ Ort`

#### **Demo-Modus**
- Auch ohne Datenbank werden PDFs mit Benutzerdaten generiert
- Fallback auf Standarddaten, wenn keine Benutzerdaten konfiguriert

## Technische Details

### Datenstruktur

```typescript
interface UserData {
  // Persönliche Informationen
  firstName: string;
  lastName: string;
  
  // Firmeninformationen
  companyName: string;
  street: string;
  city: string;
  email: string;
  phone: string;
  
  // Zusätzliche Firmeninformationen
  companyLogo: string;
  taxNumber: string;
  vatNumber: string;
  bankName: string;
  bankAccount: string;
  bankBic: string;
  
  // Angebot-Einstellungen
  defaultQuotePrefix: string;
  defaultCurrency: string;
  defaultPaymentTerms: string;
  defaultValidity: string;
}
```

### Standarddaten

```typescript
const defaultUserData = {
  firstName: 'Max',
  lastName: 'Mustermann',
  companyName: 'Inatros GmbH',
  street: 'Musterstraße 123',
  city: '90475 Nürnberg',
  email: 'info@inatros.de',
  phone: '+49 911 123456',
  // ... weitere Standarddaten
}
```

## Verwendung

### 1. Benutzerdaten konfigurieren
1. Navigieren Sie zu `/einstellungen`
2. Klicken Sie auf "Dein Konto"
3. Klicken Sie auf "Bearbeiten"
4. Füllen Sie alle gewünschten Felder aus
5. Klicken Sie auf "Speichern"

### 2. Dashboard verwenden
- Der Vorname wird automatisch unter "Willkommen!" angezeigt
- Keine zusätzliche Konfiguration erforderlich

### 3. PDFs generieren
- Firmeninformationen werden automatisch in alle PDFs eingefügt
- Keine zusätzliche Konfiguration erforderlich

## Zukünftige Erweiterungen

### Geplante Features
1. **Datenbank-Integration**: Speicherung der Benutzerdaten in der Datenbank
2. **Firmenlogo**: Upload und Integration von Firmenlogos in PDFs
3. **Mehrere Benutzer**: Unterstützung für mehrere Benutzerkonten
4. **Backup/Restore**: Export/Import von Benutzerdaten
5. **Validierung**: Erweiterte Validierung der Eingabefelder

### Technische Verbesserungen
1. **Server-seitige Speicherung**: Migration von localStorage zu Datenbank
2. **API-Endpunkte**: REST-API für Benutzerdaten-Management
3. **Verschlüsselung**: Verschlüsselung sensibler Daten
4. **Audit-Log**: Protokollierung von Änderungen

## Fehlerbehebung

### Häufige Probleme

#### **Daten werden nicht gespeichert**
- Prüfen Sie, ob localStorage verfügbar ist
- Prüfen Sie die Browser-Konsole auf Fehler

#### **PDF zeigt Standarddaten**
- Stellen Sie sicher, dass Benutzerdaten konfiguriert sind
- Prüfen Sie, ob die Daten korrekt gespeichert wurden

#### **Dashboard zeigt "Max"**
- Konfigurieren Sie Ihren Vornamen in den Einstellungen
- Prüfen Sie, ob die Daten korrekt geladen werden

## Sicherheitshinweise

### Aktuelle Implementierung
- Daten werden nur lokal im Browser gespeichert
- Keine Übertragung an externe Server
- Keine Verschlüsselung der Daten

### Empfehlungen
- Verwenden Sie sichere Passwörter für Ihr Gerät
- Regelmäßige Backups der Benutzerdaten
- Bei gemeinsam genutzten Geräten: Daten nach der Nutzung löschen
