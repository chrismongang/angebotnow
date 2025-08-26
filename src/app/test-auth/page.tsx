'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default function TestAuthPage() {
  const [envStatus, setEnvStatus] = useState<{
    NEXTAUTH_SECRET: boolean
    NEXTAUTH_URL: boolean
    GOOGLE_CLIENT_ID: boolean
    GOOGLE_CLIENT_SECRET: boolean
    DATABASE_URL: boolean
  } | null>(null)

  useEffect(() => {
    // Test environment variables by making a request to the API
    const testEnvVars = async () => {
      try {
        const response = await fetch('/api/test-env')
        const data = await response.json()
        setEnvStatus(data)
      } catch (error) {
        console.error('Error testing environment variables:', error)
        setEnvStatus({
          NEXTAUTH_SECRET: false,
          NEXTAUTH_URL: false,
          GOOGLE_CLIENT_ID: false,
          GOOGLE_CLIENT_SECRET: false,
          DATABASE_URL: false
        })
      }
    }

    testEnvVars()
  }, [])

  if (!envStatus) {
    return (
      <div className="container mx-auto p-8">
        <h1 className="text-2xl font-bold mb-4">NextAuth.js Konfiguration Test</h1>
        <p>Lade Konfiguration...</p>
      </div>
    )
  }

  const missingGoogleVars = !envStatus.GOOGLE_CLIENT_ID || !envStatus.GOOGLE_CLIENT_SECRET

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">NextAuth.js Konfiguration Test</h1>
      
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Umgebungsvariablen Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span>NEXTAUTH_SECRET:</span>
                <span className={envStatus.NEXTAUTH_SECRET ? 'text-green-600' : 'text-red-600'}>
                  {envStatus.NEXTAUTH_SECRET ? '✅ Gesetzt' : '❌ Fehlt'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>NEXTAUTH_URL:</span>
                <span className={envStatus.NEXTAUTH_URL ? 'text-green-600' : 'text-red-600'}>
                  {envStatus.NEXTAUTH_URL ? '✅ Gesetzt' : '❌ Fehlt'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>GOOGLE_CLIENT_ID:</span>
                <span className={envStatus.GOOGLE_CLIENT_ID ? 'text-green-600' : 'text-red-600'}>
                  {envStatus.GOOGLE_CLIENT_ID ? '✅ Gesetzt' : '❌ Fehlt'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>GOOGLE_CLIENT_SECRET:</span>
                <span className={envStatus.GOOGLE_CLIENT_SECRET ? 'text-green-600' : 'text-red-600'}>
                  {envStatus.GOOGLE_CLIENT_SECRET ? '✅ Gesetzt' : '❌ Fehlt'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>DATABASE_URL:</span>
                <span className={envStatus.DATABASE_URL ? 'text-green-600' : 'text-red-600'}>
                  {envStatus.DATABASE_URL ? '✅ Gesetzt' : '❌ Fehlt'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {missingGoogleVars && (
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="text-orange-800">🔧 Google OAuth Konfiguration erforderlich</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-orange-700">
                  Die Google OAuth Umgebungsvariablen sind nicht konfiguriert. Folge diesen Schritten:
                </p>
                
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <span className="bg-orange-100 text-orange-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</span>
                    <div>
                      <p className="font-semibold">Google Cloud Console öffnen</p>
                      <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" 
                         className="text-blue-600 hover:underline">https://console.cloud.google.com/</a>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <span className="bg-orange-100 text-orange-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</span>
                    <div>
                      <p className="font-semibold">OAuth 2.0 Client ID erstellen</p>
                      <p className="text-sm">APIs &amp; Services → Credentials → Create Credentials → OAuth 2.0 Client IDs</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <span className="bg-orange-100 text-orange-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">3</span>
                    <div>
                      <p className="font-semibold">Redirect URI hinzufügen</p>
                      <code className="bg-gray-100 px-2 py-1 rounded text-sm">http://localhost:3000/api/auth/callback/google</code>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <span className="bg-orange-100 text-orange-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">4</span>
                    <div>
                      <p className="font-semibold">In .env.local eintragen</p>
                      <div className="bg-gray-100 p-3 rounded text-sm">
                        <div>GOOGLE_CLIENT_ID=&quot;deine-client-id&quot;</div>
                        <div>GOOGLE_CLIENT_SECRET=&quot;dein-client-secret&quot;</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <span className="bg-orange-100 text-orange-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">5</span>
                    <div>
                      <p className="font-semibold">Server neu starten</p>
                      <code className="bg-gray-100 px-2 py-1 rounded text-sm">npm run dev</code>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                  <p className="text-blue-800 text-sm mb-2">
                    <strong>Detaillierte Anleitung:</strong> Siehe <code>docs/GOOGLE_OAUTH_SETUP.md</code>
                  </p>
                  <Link 
                    href="/setup-google-oauth" 
                    className="inline-flex items-center px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                  >
                    🚀 Interaktive Setup-Anleitung öffnen
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Test Google OAuth</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Klicke auf den Button unten, um zu testen, ob Google OAuth korrekt konfiguriert ist:
            </p>
            <Link 
              href="/api/auth/signin"
              className={`inline-flex items-center px-4 py-2 rounded-lg transition-colors ${
                missingGoogleVars 
                  ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {missingGoogleVars ? 'Google OAuth nicht konfiguriert' : 'Mit Google anmelden testen'}
            </Link>
            {missingGoogleVars && (
              <p className="text-sm text-gray-600 mt-2">
                Konfiguriere zuerst die Google OAuth Variablen oben.
              </p>
            )}
          </CardContent>
        </Card>

        {Object.values(envStatus).every(Boolean) ? (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="text-lg font-semibold text-green-800 mb-2">✅ Alle Konfigurationen korrekt!</h3>
            <p className="text-green-700">
              Deine NextAuth.js Konfiguration ist vollständig. Du kannst jetzt:
            </p>
            <ul className="list-disc list-inside mt-2 text-green-700">
              <li>Google OAuth Login verwenden</li>
              <li>Angebote erstellen und in der Datenbank speichern</li>
              <li>PDFs generieren und herunterladen</li>
            </ul>
          </div>
        ) : (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <h3 className="text-lg font-semibold text-red-800 mb-2">❌ Konfiguration unvollständig</h3>
            <p className="text-red-700">
              Einige Umgebungsvariablen fehlen. Bitte überprüfe deine .env.local Datei.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

