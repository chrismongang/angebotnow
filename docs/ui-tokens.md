# UI Design Tokens - AngebotNow

## Farben

### Primary Colors
- **Primary**: `#F89813` (Orange)
- **Primary Foreground**: `#FFFFFF` (Weiß)

### Background Colors
- **Background**: `#FFFFFF` (Weiß)
- **Card**: `#FFFFFF` (Weiß)
- **Muted**: `#F4F4F4` (Hellgrau)

### Border & Input Colors
- **Border**: `#EAEAEA` (Hellgrau)
- **Input**: `#EAEAEA` (Hellgrau)

### Text Colors
- **Foreground**: `#171717` (Dunkelgrau)
- **Muted Foreground**: `#6B7280` (Mittelgrau)

### Utility Colors
- **Destructive**: `#EF4444` (Rot)
- **Ring**: `#F89813` (Orange)

## Border Radius

- **sm**: `calc(var(--radius) - 4px)` (6px)
- **md**: `calc(var(--radius) - 2px)` (8px)
- **lg**: `var(--radius)` (10px)
- **xl**: `20px`
- **2xl**: `24px`

## Shadows

- **soft**: `0 8px 24px rgba(0,0,0,0.06)` (Weicher Schatten)

## Typography

- **Font Family**: `Inter, system-ui, sans-serif`
- **Font Weights**: 300, 400, 500, 600, 700

## Komponenten-Styling

### Button
- **Border Radius**: `rounded-2xl` (24px)
- **Shadow**: `shadow-soft`
- **Variants**: default, destructive, outline, secondary, ghost, link

### Card
- **Border Radius**: `rounded-2xl` (24px)
- **Shadow**: `shadow-soft`
- **Background**: `bg-card`

### Input
- **Border Radius**: `rounded-2xl` (24px)
- **Border**: `border-input`
- **Focus Ring**: `ring-ring`

### Textarea
- **Border Radius**: `rounded-2xl` (24px)
- **Min Height**: `min-h-[80px]`
- **Border**: `border-input`

### Badge
- **Border Radius**: `rounded-xl` (20px)
- **Variants**: default, secondary, destructive, outline

## Verwendung

### CSS Classes
```css
/* Farben */
.text-primary { color: #F89813; }
.bg-primary { background-color: #F89813; }
.bg-muted { background-color: #F4F4F4; }

/* Border Radius */
.rounded-xl { border-radius: 20px; }
.rounded-2xl { border-radius: 24px; }

/* Shadows */
.shadow-soft { box-shadow: 0 8px 24px rgba(0,0,0,0.06); }
```

### Tailwind Classes
```jsx
// Button mit Design Tokens
<Button className="bg-primary text-primary-foreground rounded-2xl shadow-soft">
  Klick mich
</Button>

// Card mit Design Tokens
<Card className="rounded-2xl shadow-soft bg-card">
  <CardContent>Inhalt</CardContent>
</Card>

// Input mit Design Tokens
<Input className="rounded-2xl border-input" placeholder="Eingabe..." />
```

## Best Practices

1. **Konsistenz**: Verwende immer die definierten Design Tokens
2. **Kontrast**: Stelle sicher, dass Text auf Hintergründen gut lesbar ist
3. **Hierarchie**: Nutze verschiedene Schatten und Radien für visuelle Hierarchie
4. **Zugänglichkeit**: Achte auf ausreichende Kontraste und Focus-States
