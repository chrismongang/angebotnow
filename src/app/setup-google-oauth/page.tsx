'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function SetupGoogleOAuthPage() {
  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Google OAuth Setup</h1>
      
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>🚀 Schnellstart Google OAuth</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Folge diesen Schritten, um Google OAuth für deine Anwendung zu konfigurieren:
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <Button 
                  asChild
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <a 
                    href="https://console.cloud.google.com/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    Google Cloud Console öffnen
                  </a>
                </Button>
                <span className="text-sm text-gray-600">Schritt 1: Öffne die Google Cloud Console</span>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Schritt 2: Projekt erstellen/auswählen</h3>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Klicke auf das Projekt-Dropdown oben links</li>
                  <li>Wähle &quot;Neues Projekt&quot; oder ein bestehendes</li>
                  <li>Gib einen Projektnamen ein (z.B. &quot;AngebotNow&quot;)</li>
                </ul>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Schritt 3: OAuth 2.0 Client ID erstellen</h3>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Gehe zu &quot;APIs &amp; Services&quot; → &quot;Credentials&quot;</li>
                  <li>Klicke auf &quot;Create Credentials&quot; → &quot;OAuth 2.0 Client IDs&quot;</li>
                  <li>Falls gefragt, konfiguriere den OAuth-Zustimmungsbildschirm</li>
                </ul>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Schritt 4: Web-Anwendung konfigurieren</h3>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Wähle &quot;Web application&quot; als Anwendungstyp</li>
                  <li>Gib einen Namen ein (z.B. &quot;AngebotNow Web Client&quot;)</li>
                  <li><strong>Wichtig:</strong> Füge diese Redirect URI hinzu:</li>
                </ul>
                <div className="mt-2 p-2 bg-blue-100 border border-blue-300 rounded">
                  <code className="text-sm">http://localhost:3000/api/auth/callback/google</code>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Schritt 5: Client ID und Secret kopieren</h3>
                <p className="text-sm mb-2">Nach der Erstellung erhältst du:</p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li><strong>Client ID:</strong> (z.B. 123456789-abcdef.apps.googleusercontent.com)</li>
                  <li><strong>Client Secret:</strong> (z.B. GOCSPX-abcdefghijklmnop)</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>📝 Umgebungsvariablen konfigurieren</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Füge die kopierten Werte in deine <code>.env.local</code> Datei ein:
            </p>
            
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm">
              <div># Google OAuth Configuration</div>
              <div>GOOGLE_CLIENT_ID=&quot;deine-client-id-hier&quot;</div>
              <div>GOOGLE_CLIENT_SECRET=&quot;dein-client-secret-hier&quot;</div>
            </div>
            
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-yellow-800 text-sm">
                <strong>⚠️ Wichtig:</strong> Ersetze &quot;deine-client-id-hier&quot; und &quot;dein-client-secret-hier&quot; 
                mit den tatsächlichen Werten aus der Google Cloud Console.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>✅ Testen</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Nach dem Speichern der Umgebungsvariablen:
            </p>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <span className="bg-green-100 text-green-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</span>
                <span>Starte deinen Server neu: <code className="bg-gray-100 px-2 py-1 rounded">npm run dev</code></span>
              </div>
              
              <div className="flex items-center space-x-3">
                <span className="bg-green-100 text-green-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</span>
                <span>Gehe zur Test-Seite: <code className="bg-gray-100 px-2 py-1 rounded">/test-auth</code></span>
              </div>
              
              <div className="flex items-center space-x-3">
                <span className="bg-green-100 text-green-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">3</span>
                <span>Überprüfe, ob alle Variablen grüne Häkchen haben</span>
              </div>
            </div>
            
            <div className="mt-4">
              <Button asChild>
                <a href="/test-auth">Zur Test-Seite</a>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>🔧 Troubleshooting</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <h4 className="font-semibold text-red-600">Fehler: &quot;redirect_uri_mismatch&quot;</h4>
                <p className="text-sm">Überprüfe, ob die Redirect URI in der Google Cloud Console exakt stimmt.</p>
              </div>
              
              <div>
                <h4 className="font-semibold text-red-600">Fehler: &quot;invalid_client&quot;</h4>
                <p className="text-sm">Überprüfe Client ID und Secret auf Tippfehler.</p>
              </div>
              
              <div>
                <h4 className="font-semibold text-red-600">Fehler: &quot;access_denied&quot;</h4>
                <p className="text-sm">Überprüfe die OAuth-Zustimmungseinstellungen in der Google Cloud Console.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
