# Database Issues & Solutions

## Foreign Key Constraint Error

### Problem
```
Foreign key constraint violated on the constraint: `Quote_userId_fkey`
```

### Ursache
Das Prisma-Schema definiert eine obligatorische Beziehung zwischen `Quote` und `User`:
```prisma
model Quote {
  userId      String
  user        User       @relation(fields: [userId], references: [id])
  // ...
}
```

Beim Erstellen einer Quote wird `userId: 'mock-user-id'` verwendet, aber dieser User existiert nicht in der Datenbank.

### Lösung
**Automatische Mock-User-Erstellung** in `src/lib/actions.ts`:

```typescript
// First, ensure a mock user exists
let mockUser = await prisma.user.findUnique({
  where: { email: 'mock@angebotnow.de' }
});

if (!mockUser) {
  mockUser = await prisma.user.create({
    data: {
      email: 'mock@angebotnow.de',
    }
  });
}

const quote = await prisma.quote.create({
  data: {
    clientName: validatedData.clientName,
    projectInfo: validatedData.projectInfo,
    status: 'PENDING',
    userId: mockUser.id, // Use real user ID
  },
})
```

### Vorteile
- ✅ **Keine Migration nötig**: Funktioniert mit bestehendem Schema
- ✅ **Automatisch**: Mock-User wird bei Bedarf erstellt
- ✅ **Konsistent**: Alle Quotes haben einen gültigen User
- ✅ **MVP-kompatibel**: Keine Authentication-Änderungen nötig

### Alternative Lösungen (nicht implementiert)

#### Option 1: User optional machen
```prisma
model Quote {
  userId      String?
  user        User?      @relation(fields: [userId], references: [id])
  // ...
}
```
**Nachteile**: Migration erforderlich, DATABASE_URL nötig

#### Option 2: Mock-User in Migration
```sql
INSERT INTO "User" (id, email, "createdAt") 
VALUES ('mock-user-id', 'mock@angebotnow.de', NOW());
```
**Nachteile**: Migration erforderlich, weniger flexibel

### Status
- ✅ **Gelöst**: Mock-User wird automatisch erstellt
- ✅ **Getestet**: Build erfolgreich
- ✅ **Dokumentiert**: Diese Datei
