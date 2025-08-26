'use client'

import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Suspense } from 'react'

function AuthErrorContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case 'Configuration':
        return 'Es gibt ein Problem mit der Server-Konfiguration.'
      case 'AccessDenied':
        return 'Du hast den Zugriff verweigert.'
      case 'Verification':
        return 'Der Verifizierungslink ist ungültig oder abgelaufen.'
      case 'OAuthSignin':
        return 'Fehler beim OAuth-Signin.'
      case 'OAuthCallback':
        return 'Fehler beim OAuth-Callback.'
      case 'OAuthCreateAccount':
        return 'Fehler beim Erstellen des OAuth-Kontos.'
      case 'EmailCreateAccount':
        return 'Fehler beim Erstellen des E-Mail-Kontos.'
      case 'Callback':
        return 'Fehler beim Callback.'
      case 'OAuthAccountNotLinked':
        return 'Das E-Mail-Konto ist bereits mit einem anderen Provider verknüpft.'
      case 'EmailSignin':
        return 'Fehler beim E-Mail-Signin.'
      case 'CredentialsSignin':
        return 'Fehler beim Anmelden mit Anmeldedaten.'
      case 'SessionRequired':
        return 'Du musst angemeldet sein, um auf diese Seite zuzugreifen.'
      default:
        return 'Ein unbekannter Fehler ist aufgetreten.'
    }
  }

  return (
    <div className="container mx-auto p-8 max-w-md">
      <Card>
        <CardHeader>
          <CardTitle className="text-center text-red-600">Anmeldung fehlgeschlagen</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <p className="text-gray-700 mb-4">
              {getErrorMessage(error)}
            </p>
            
            {error && (
              <div className="bg-gray-100 p-3 rounded text-sm">
                <p className="font-mono text-gray-600">Fehler: {error}</p>
              </div>
            )}
          </div>
          
          <div className="flex space-x-2">
            <Button asChild className="flex-1">
              <Link href="/auth/signin">Erneut versuchen</Link>
            </Button>
            <Button asChild variant="outline" className="flex-1">
              <Link href="/">Zur Startseite</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto p-8 max-w-md">
        <div className="text-center">
          <p>Lade...</p>
        </div>
      </div>
    }>
      <AuthErrorContent />
    </Suspense>
  )
}
