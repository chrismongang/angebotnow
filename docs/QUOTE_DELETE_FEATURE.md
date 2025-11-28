# Angebot-Löschfunktion

## Übersicht

Die Angebot-Löschfunktion ermöglicht es Benutzern, erstellte Angebote zu löschen. Die Funktion ist sowohl in der Angebot-Übersicht als auch auf der Angebot-Detail-Seite verfügbar.

## Features

### 1. Swipe-to-Delete in der Angebot-Übersicht

#### Funktionsweise
- **Swipe-Geste**: Benutzer können auf Mobile-Geräten nach links wischen, um den Lösch-Button anzuzeigen
- **Desktop-Unterstützung**: Auch auf Desktop-Geräten funktioniert die Drag-Geste mit der Maus
- **Minimalistisches Design**: Keine zusätzlichen Buttons in den Cards, um das Design sauber zu halten
- **Erweiterbar**: Die Swipeable-Komponente kann in Zukunft für weitere Aktionen erweitert werden (z.B. Archivieren, Status ändern)

#### Technische Details
- **Schwellenwerte**:
  - `SWIPE_THRESHOLD`: 60px - Zeigt den Lösch-Button an
  - `DELETE_THRESHOLD`: 80px - Löscht das Angebot direkt
- **Touch-Events**: Unterstützt sowohl Touch- als auch Mouse-Events
- **Click-Prevention**: Verhindert Link-Navigation während des Swipe-Vorgangs

### 2. Lösch-Button auf der Detail-Seite

#### Positionierung
- **Lage**: Ganz unten auf der Angebot-Detail-Seite
- **Design**: Konsistent mit anderen Card-Blöcken (Projektinfos, Angebotskalkulation)
- **Card-Layout**: Wird in einem eigenen Card-Block mit Header und Content dargestellt

#### UI-Elemente
- **Card-Header**: "Angebot löschen" als Titel
- **Beschreibung**: Hinweistext, dass das Löschen dauerhaft ist
- **Button**: Roter Lösch-Button mit Trash-Icon

### 3. Bestätigungsmodal

#### Sicherheitsfeature
- **Warnung**: Zeigt eine Warnung vor dem endgültigen Löschen
- **Angebotsinformationen**: Zeigt Angebotsnummer und Kundenname zur Bestätigung
- **Loading-State**: Zeigt einen Ladeindikator während des Löschvorgangs
- **Zwei-Button-Design**: "Abbrechen" und "Löschen" Buttons

## Technische Implementierung

### API-Endpunkt

#### DELETE `/api/quotes/[id]`

**Authentifizierung**: Erforderlich
**Authorization**: Nur der Besitzer des Angebots kann es löschen

**Request**:
```typescript
DELETE /api/quotes/[id]
```

**Response (Success)**:
```json
{
  "success": true
}
```

**Response (Error)**:
```json
{
  "error": "Angebot nicht gefunden" // 404
}
// oder
{
  "error": "Forbidden" // 403
}
// oder
{
  "error": "Interner Serverfehler" // 500
}
```

### Komponenten

#### 1. `SwipeableQuoteCard` (`src/components/swipeable-quote-card.tsx`)

**Zweck**: Wrapper-Komponente für swipebare Angebot-Cards

**Props**:
```typescript
interface SwipeableQuoteCardProps {
  children: React.ReactNode
  onDelete: () => void
  className?: string
}
```

**Features**:
- Touch- und Mouse-Event-Handling
- Swipe-Gesten-Erkennung
- Delete-Button beim Swipe
- Click-Outside-Reset
- Schatten-Erhaltung (kein `overflow-hidden`)

#### 2. `DeleteQuoteModal` (`src/components/delete-quote-modal.tsx`)

**Zweck**: Bestätigungsmodal für das Löschen von Angeboten

**Props**:
```typescript
interface DeleteQuoteModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  quoteNumber?: string
  clientName?: string
  isDeleting?: boolean
}
```

**Features**:
- Warnung mit Alert-Icon
- Angebotsinformationen anzeigen
- Loading-State während des Löschens
- Responsive Design

### Integration

#### Angebot-Übersicht (`src/app/angebote/page.tsx`)

**Implementierung**:
1. `SwipeableQuoteCard` um jede Angebot-Card wrappen
2. `DeleteQuoteModal` am Ende der Komponente hinzufügen
3. State-Management für Modal und Löschvorgang
4. Liste nach erfolgreichem Löschen aktualisieren

**Code-Beispiel**:
```typescript
<SwipeableQuoteCard
  key={quote.id}
  onDelete={() => handleDeleteClick(quote)}
>
  <Link href={`/angebot/${quote.id}`}>
    <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
      {/* Card Content */}
    </Card>
  </Link>
</SwipeableQuoteCard>
```

#### Angebot-Detail-Seite (`src/app/angebot/[id]/page.tsx`)

**Implementierung**:
1. Lösch-Button in einem Card-Block am Ende der Seite
2. `DeleteQuoteModal` hinzufügen
3. Redirect zu `/angebote` nach erfolgreichem Löschen

**Code-Beispiel**:
```typescript
<Card>
  <CardHeader className="pb-3">
    <CardTitle className="text-base sm:text-lg lg:text-xl">Angebot löschen</CardTitle>
  </CardHeader>
  <CardContent>
    <p className="text-sm text-[#676767] mb-4">
      Wenn Sie dieses Angebot löschen, wird es dauerhaft entfernt und kann nicht wiederhergestellt werden.
    </p>
    <Button
      variant="outline"
      onClick={handleDeleteClick}
      className="w-full border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 rounded-[14px] flex items-center justify-center gap-2"
    >
      <Trash2 size={18} />
      Angebot löschen
    </Button>
  </CardContent>
</Card>
```

## Sicherheit

### Authorization-Checks

1. **Authentifizierung**: User muss eingeloggt sein
2. **Ownership-Prüfung**: Nur der Besitzer kann sein Angebot löschen
3. **Database-Check**: Angebot muss existieren und dem User gehören

### Fehlerbehandlung

- **404**: Angebot nicht gefunden
- **403**: User ist nicht berechtigt
- **500**: Server-Fehler
- **User-Feedback**: Alerts bei Fehlern

## UX-Verbesserungen

### Mobile-First Design

- **Swipe-Gesten**: Natürliche Mobile-Interaktion
- **Touch-Optimierung**: Große Touch-Targets
- **Responsive**: Funktioniert auf allen Geräten

### Design-Konsistenz

- **Card-Layout**: Konsistent mit anderen Blöcken
- **Schatten-Erhaltung**: Cards behalten ihre Schatten
- **Spacing**: Ausreichend Abstand zur Mobile Navigation

### Accessibility

- **Keyboard-Navigation**: Unterstützt
- **Screen-Reader**: Semantische HTML-Struktur
- **Focus-Management**: Korrekte Focus-Handling

## Zukünftige Erweiterungen

### Geplante Features

1. **Archivieren**: Angebote archivieren statt löschen
2. **Status-Änderungen**: "Angenommen", "Abgelehnt" Status
3. **Bulk-Actions**: Mehrere Angebote gleichzeitig löschen
4. **Soft-Delete**: Angebote in Papierkorb verschieben
5. **Wiederherstellung**: Gelöschte Angebote wiederherstellen

### Erweiterbarkeit

Die `SwipeableQuoteCard` Komponente ist so strukturiert, dass weitere Aktionen einfach hinzugefügt werden können:

```typescript
// Zukünftige Erweiterung
<SwipeableQuoteCard
  onDelete={handleDelete}
  onArchive={handleArchive}
  onMarkAccepted={handleMarkAccepted}
  onMarkRejected={handleMarkRejected}
>
  {/* Card Content */}
</SwipeableQuoteCard>
```

## Dateistruktur

```
src/
├── app/
│   ├── api/
│   │   └── quotes/
│   │       └── [id]/
│   │           └── route.ts (DELETE Handler)
│   ├── angebote/
│   │   └── page.tsx (Swipe-to-Delete Integration)
│   └── angebot/
│       └── [id]/
│           └── page.tsx (Delete Button Integration)
├── components/
│   ├── swipeable-quote-card.tsx (NEU)
│   └── delete-quote-modal.tsx (NEU)
```

## Testing

### Manuelle Tests

1. **Swipe-to-Delete**:
   - ✅ Mobile: Swipe nach links funktioniert
   - ✅ Desktop: Drag mit Maus funktioniert
   - ✅ Schwellenwerte werden korrekt erkannt
   - ✅ Link-Navigation wird während Swipe verhindert

2. **Detail-Seite Löschen**:
   - ✅ Button ist sichtbar und funktioniert
   - ✅ Modal erscheint korrekt
   - ✅ Löschvorgang funktioniert
   - ✅ Redirect nach Löschen funktioniert

3. **Sicherheit**:
   - ✅ Nur Besitzer kann löschen
   - ✅ Authentifizierung erforderlich
   - ✅ Fehlerbehandlung funktioniert

4. **UI/UX**:
   - ✅ Schatten bleiben erhalten
   - ✅ Mobile Navigation überlappt nicht
   - ✅ Design ist konsistent
   - ✅ Loading-States funktionieren

## Zusammenfassung

Die Angebot-Löschfunktion bietet:

- ✅ **Swipe-to-Delete** in der Übersicht (Mobile & Desktop)
- ✅ **Lösch-Button** auf der Detail-Seite
- ✅ **Bestätigungsmodal** für Sicherheit
- ✅ **Sichere API** mit Authorization-Checks
- ✅ **Konsistentes Design** mit anderen Komponenten
- ✅ **Erweiterbar** für zukünftige Features

**Status**: ✅ Vollständig implementiert und getestet  
**Version**: 1.6.0  
**Datum**: 2025-01-XX

