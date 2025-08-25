# Next.js 15 Compatibility Issues & Solutions

## Event Handlers in Server Components

### Problem
```
Event handlers cannot be passed to Client Component props.
  <img src=... alt=... className=... onError={function onError}>
                                             ^^^^^^^^^^^^^
If you need interactivity, consider converting part of this to a Client Component.
```

### Ursache
Next.js 15 hat strengere Regeln für Server Components:
- **Server Components** können keine Event-Handler verwenden
- **onError**, **onClick**, **onChange** etc. sind nicht erlaubt
- **Interaktivität** erfordert Client Components

### Betroffene Stellen
1. **`src/app/angebote/page.tsx`**: `<img onError={...}>`
2. **`src/app/angebot/[id]/page.tsx`**: `<img onError={...}>`

### Lösung
**Client Component für Bilder** erstellt: `src/components/ui/image.tsx`

```typescript
'use client'

import { useState } from 'react'

interface ImageProps {
  src: string
  alt: string
  className?: string
}

export function Image({ src, alt, className }: ImageProps) {
  const [hasError, setHasError] = useState(false)

  if (hasError) {
    return null
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setHasError(true)}
    />
  )
}
```

### Implementierung

#### 1. Image Component erstellt
- **Client Component**: `'use client'` Direktive
- **Error Handling**: Automatisches Verstecken bei Fehlern
- **State Management**: `useState` für Error-Status

#### 2. Server Components aktualisiert
```typescript
// Vorher (Server Component)
<img
  src={quote.imagePath}
  alt="Projektfoto"
  onError={(e) => { e.currentTarget.style.display = 'none' }}
/>

// Nachher (Server Component mit Client Component)
<Image
  src={quote.imagePath}
  alt="Projektfoto"
  className="w-full rounded-xl"
/>
```

### Vorteile
- ✅ **Next.js 15 kompatibel**: Keine Event-Handler in Server Components
- ✅ **Bessere UX**: Automatisches Error-Handling
- ✅ **Wiederverwendbar**: Image Component für alle Bilder
- ✅ **TypeScript**: Vollständig typisiert
- ✅ **Performance**: Client Component nur bei Bedarf

### Alternative Lösungen (nicht implementiert)

#### Option 1: next/image verwenden
```typescript
import Image from 'next/image'
```
**Nachteile**: Komplexere Konfiguration, Cloudinary-URLs

#### Option 2: Event-Handler entfernen
```typescript
<img src={src} alt={alt} />
```
**Nachteile**: Keine Error-Behandlung, gebrochene Bilder sichtbar

#### Option 3: Server-Side Image-Validierung
```typescript
// Server-Side prüfen ob Bild existiert
```
**Nachteile**: Komplex, Performance-Impact

### Status
- ✅ **Gelöst**: Client Component für Bilder erstellt
- ✅ **Getestet**: Build erfolgreich
- ✅ **Implementiert**: Alle betroffenen Stellen aktualisiert
- ✅ **Dokumentiert**: Diese Datei
