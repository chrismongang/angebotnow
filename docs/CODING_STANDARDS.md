# Coding Standards
- Ordner: lib/ai/* (nur Server-AI), lib/pdf/*, lib/db/* (Prisma), components/* (dumb UI)
- Funktionen < 50 Zeilen, sonst splitten.
- AI: JSON-Schema erzwingen, Timeout 45s, Retries 2, Logging, Fallback.
- Keine Secrets im Client. Storage privat + signed URLs.
- PRs klein, Conventional Commits, Sentry aktiv.

