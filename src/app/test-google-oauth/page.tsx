'use client'

import { signIn, getSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function TestGoogleOAuthPage() {
  const [session, setSession] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkSession = async () => {
      const sessionData = await getSession()
      setSession(sessionData)
      setIsLoading(false)
    }
    checkSession()
  }, [])

  const handleGoogleSignIn = () => {
    signIn('google', { 
      callbackUrl: '/dashboard',
      redirect: true 
    })
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-8">
        <p>Lade...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Google OAuth Test</h1>
      
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Session Status</CardTitle>
          </CardHeader>
          <CardContent>
            {session ? (
              <div className="space-y-2">
                <p><strong>Angemeldet als:</strong> {session.user?.name}</p>
                <p><strong>E-Mail:</strong> {session.user?.email}</p>
                <p><strong>Bild:</strong> {session.user?.image ? 'Vorhanden' : 'Nicht vorhanden'}</p>
                <Button asChild variant="outline">
                  <Link href="/api/auth/signout">Abmelden</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-gray-600">Nicht angemeldet</p>
                <Button onClick={handleGoogleSignIn} className="w-full">
                  Mit Google anmelden
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Google OAuth Konfiguration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p><strong>Client ID:</strong> {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ? 'Gesetzt' : 'Nicht gesetzt'}</p>
              <p><strong>Redirect URI:</strong> <code className="bg-gray-100 px-2 py-1 rounded text-sm">http://localhost:3000/api/auth/callback/google</code></p>
              <p><strong>NEXTAUTH_URL:</strong> {process.env.NEXT_PUBLIC_NEXTAUTH_URL || 'http://localhost:3000'}</p>
            </div>
            
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
              <p className="text-blue-800 text-sm">
                <strong>Wichtig:</strong> Stelle sicher, dass diese Redirect URI in der Google Cloud Console hinzugefügt wurde:
              </p>
              <code className="block mt-2 bg-blue-100 p-2 rounded text-sm">
                http://localhost:3000/api/auth/callback/google
              </code>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Alternative Test-Methoden</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button asChild variant="outline" className="w-full">
                <Link href="/api/auth/signin">Direkter Signin-Link</Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/auth/signin">Signin-Seite</Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/test-auth">Umgebungsvariablen Test</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {session && (
          <Card>
            <CardHeader>
              <CardTitle>Session Details</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto">
                {JSON.stringify(session, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
