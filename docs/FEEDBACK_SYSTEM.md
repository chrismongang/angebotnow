# Feedback-System

## Überblick
Das Feedback-System erlaubt Nutzern, pro Angebot eine Bewertung abzugeben:
- Bewertung: Daumen hoch, Daumen runter oder Neutral
- Optionaler Freitext-Kommentar (max. 1000 Zeichen)

Admin/Owner erhalten eine E-Mail-Zusammenfassung, wenn ein Feedback mit Text gesendet wird.

## UI
- Angebotsdetailseite: Komponente `QuoteFeedback` unter der PDF-Vorschau.
- Interaktion:
  - Nutzer vergibt eine Bewertung.
  - Optional kann ein Text ergänzt und einmalig gespeichert werden.
  - Wenn Text gespeichert ist, ist das Feedback gelockt (keine weiteren Änderungen/Löschungen).

## API
Route: `src/app/api/feedback/[quoteId]/route.ts`

- `GET`: holt Feedback für ein Angebot (nur für Besitzer).
- `POST`: Upsert des Feedbacks mit Validierung.
  - Lock-Regel: Wenn bereits Text existiert, weitere Änderungen blockiert.
  - Nach erfolgreichem Upsert wird eine Zusammenfassungs-E-Mail nur gesendet, wenn `text` vorhanden ist.
- `DELETE`: Löschen ist nur möglich, solange kein Text gespeicher ist.

Schema (Zod):
- `rating`: `UP` | `DOWN` | `NEUTRAL`
- `text?`: string (<= 1000)

## E-Mail Benachrichtigung
Sender: `src/lib/email.ts` → `emailService.sendFeedbackSummaryEmail`

Auslöser: in `POST`-Handler nach erfolgreichem Upsert und nur, wenn `text` gesetzt ist.

Empfänger-Auflösung:
- `ADMIN_EMAIL` (empfohlen)
- Fallback: `FEEDBACK_EMAIL`
- Fallback: `info@angebotnow.de`

Inhalt der E-Mail:
- Angebot (Quote-Nummer oder ID)
- Kunde, Projektinfo
- Nutzer (Name/E-Mail)
- Bewertung (Daumen hoch/runter/Neutral)
- Feedback-Text (falls vorhanden)

## Konfiguration
Erforderliche Umgebungsvariablen für E-Mail-Versand:
- `RESEND_API_KEY`
- `ADMIN_EMAIL`

Optional:
- `FEEDBACK_EMAIL`

Ohne `RESEND_API_KEY` werden keine E-Mails versendet; die App funktioniert dennoch weiter.

## Testen
1. Angebot erstellen/öffnen.
2. Im Feedback-Bereich Bewertung setzen und Text hinzufügen.
3. Speichern → Prüfen, dass E-Mail an `ADMIN_EMAIL` ankommt.
4. Erneuter POST mit Text sollte 403 liefern (Lock-Regel).

## Bekannte Einschränkungen
- Pro Nutzer und Angebot ist genau ein Feedback möglich (Unique `userId_quoteId`).
- Zusammenfassungs-E-Mail wird nur bei Text gesendet, nicht bei reinen Daumen-Bewertungen.


