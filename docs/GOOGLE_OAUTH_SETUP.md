# Google OAuth Setup Anleitung

## Schritt 1: Google Cloud Console aufrufen
1. Gehe zu [Google Cloud Console](https://console.cloud.google.com/)
2. Melde dich mit deinem Google-Konto an

## Schritt 2: Projekt erstellen/auswählen
1. Klicke auf das Projekt-Dropdown oben links
2. Wähle "Neues Projekt" oder ein bestehendes Projekt
3. Gib einen Projektnamen ein (z.B. "AngebotNow")

## Schritt 3: Google+ API aktivieren
1. Gehe zu "APIs & Services" → "Library"
2. Suche nach "Google+ API" oder "Google Identity"
3. Klicke auf "Aktivieren"

## Schritt 4: OAuth 2.0 Client ID erstellen
1. Gehe zu "APIs & Services" → "Credentials"
2. Klicke auf "Create Credentials" → "OAuth 2.0 Client IDs"
3. Falls gefragt, konfiguriere den OAuth-Zustimmungsbildschirm:
   - Wähle "External" (für Entwicklung)
   - Fülle die Pflichtfelder aus (App-Name, E-Mail)
   - Speichere

## Schritt 5: Web-Anwendung konfigurieren
1. Wähle "Web application" als Anwendungstyp
2. Gib einen Namen ein (z.B. "AngebotNow Web Client")
3. **Authorized redirect URIs hinzufügen:**
   - `http://localhost:3000/api/auth/callback/google` (für Entwicklung)
   - `https://deine-domain.com/api/auth/callback/google` (für Produktion)
4. Klicke auf "Create"

## Schritt 6: Client ID und Secret kopieren
Nach der Erstellung erhältst du:
- **Client ID** (z.B. `123456789-abcdef.apps.googleusercontent.com`)
- **Client Secret** (z.B. `GOCSPX-abcdefghijklmnop`)

## Schritt 7: In .env.local eintragen
```bash
GOOGLE_CLIENT_ID="deine-client-id-hier"
GOOGLE_CLIENT_SECRET="dein-client-secret-hier"
```

## Schritt 8: Server neu starten
```bash
npm run dev
```

## Schritt 9: Testen
Gehe zu `http://localhost:3000/test-auth` und überprüfe, ob alle Variablen grüne Häkchen haben.

## Troubleshooting
- **Fehler "redirect_uri_mismatch"**: Überprüfe die redirect URIs in der Google Cloud Console
- **Fehler "invalid_client"**: Überprüfe Client ID und Secret
- **Fehler "access_denied"**: Überprüfe die OAuth-Zustimmungseinstellungen
