'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

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

        <Card>
          <CardHeader>
            <CardTitle>Test Google OAuth</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Klicke auf den Button unten, um zu testen, ob Google OAuth korrekt konfiguriert ist:
            </p>
            <a 
              href="/api/auth/signin"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Mit Google anmelden testen
            </a>
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

