'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, CheckCircle, XCircle, Mail, Clock, AlertCircle } from 'lucide-react'
import dynamicImport from 'next/dynamic'

// Force dynamic rendering to avoid prerendering issues
export const dynamic = 'force-dynamic'

// Dynamische Imports
const Card = dynamicImport(() => import('@/components/ui/card').then(mod => ({ default: mod.Card })), { ssr: false })
const CardContent = dynamicImport(() => import('@/components/ui/card').then(mod => ({ default: mod.CardContent })), { ssr: false })
const CardHeader = dynamicImport(() => import('@/components/ui/card').then(mod => ({ default: mod.CardHeader })), { ssr: false })
const CardTitle = dynamicImport(() => import('@/components/ui/card').then(mod => ({ default: mod.CardTitle })), { ssr: false })
const Button = dynamicImport(() => import('@/components/ui/button').then(mod => ({ default: mod.Button })), { ssr: false })

interface User {
  firstName: string
  lastName: string
  email: string
}

interface VerificationState {
  status: 'loading' | 'valid' | 'invalid' | 'expired' | 'success' | 'error'
  user?: User
  error?: string
}

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [state, setState] = useState<VerificationState>({ status: 'loading' })
  const [isVerifying, setIsVerifying] = useState(false)
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const token = searchParams.get('token')

  useEffect(() => {
    const validateToken = async () => {
      try {
        const response = await fetch(`/api/auth/verify-email?token=${token}`)
        const data = await response.json()

        if (response.ok && data.valid) {
          setState({ status: 'valid', user: data.user })
        } else {
          if (data.error?.includes('abgelaufen')) {
            setState({ status: 'expired', error: data.error })
          } else {
            setState({ status: 'invalid', error: data.error || 'Ungültiger Token' })
          }
        }
      } catch (error) {
        setState({ status: 'error', error: 'Fehler bei der Token-Validierung' })
      }
    }

    if (!token) {
      setState({ status: 'invalid', error: 'Kein Token gefunden' })
      return
    }

    // Token validieren
    validateToken()
  }, [token])

  const verifyEmail = async () => {
    if (!token) return

    setIsVerifying(true)
    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      })

      const data = await response.json()

      if (response.ok) {
        setState({ status: 'success', user: data.user })
      } else {
        setState({ status: 'error', error: data.error || 'Verifikation fehlgeschlagen' })
      }
    } catch (error) {
      setState({ status: 'error', error: 'Fehler bei der Email-Verifikation' })
    } finally {
      setIsVerifying(false)
    }
  }

  const resendVerificationEmail = async () => {
    if (!state.user?.email) return

    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: state.user.email }),
      })

      if (response.ok) {
        alert('Verifikations-Email wurde erneut gesendet!')
      } else {
        alert('Fehler beim Senden der Verifikations-Email')
      }
    } catch (error) {
      alert('Fehler beim Senden der Verifikations-Email')
    }
  }

  const renderContent = () => {
    switch (state.status) {
      case 'loading':
        return (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Überprüfe Token...</p>
          </div>
        )

      case 'valid':
        return (
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Mail className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800">
              Email-Adresse verifizieren
            </h2>
            <p className="text-gray-600">
              Hallo {state.user?.firstName}, bitte bestätige die Verifikation deiner Email-Adresse.
            </p>
            <Button
              onClick={verifyEmail}
              disabled={isVerifying}
              className="w-full h-12 bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-medium transition-all duration-200 rounded-xl shadow-sm"
            >
              {isVerifying ? 'Verifiziere...' : 'Email-Adresse verifizieren'}
            </Button>
          </div>
        )

      case 'success':
        return (
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800">
              Email erfolgreich verifiziert! 🎉
            </h2>
            <p className="text-gray-600">
              Hallo {state.user?.firstName}, deine Email-Adresse wurde erfolgreich verifiziert.
            </p>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-green-800 text-sm">
                Du kannst jetzt alle Features von AngebotNow nutzen!
              </p>
            </div>
            <Button
              onClick={() => router.push('/dashboard')}
              className="w-full h-12 bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-medium transition-all duration-200 rounded-xl shadow-sm"
            >
              Zum Dashboard
            </Button>
          </div>
        )

      case 'expired':
        return (
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800">
              Token abgelaufen
            </h2>
            <p className="text-gray-600">
              Der Verifikations-Link ist abgelaufen. Bitte fordere eine neue Verifikations-Email an.
            </p>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <p className="text-yellow-800 text-sm">
                Verifikations-Links sind 24 Stunden gültig.
              </p>
            </div>
            <Button
              onClick={resendVerificationEmail}
              className="w-full h-12 bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-medium transition-all duration-200 rounded-xl shadow-sm"
            >
              Neue Verifikations-Email anfordern
            </Button>
          </div>
        )

      case 'invalid':
      case 'error':
        return (
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800">
              Ungültiger Link
            </h2>
            <p className="text-gray-600">
              Der Verifikations-Link ist ungültig oder fehlerhaft.
            </p>
            <div className="bg-red-50 p-4 rounded-lg">
              <p className="text-red-800 text-sm">
                {state.error || 'Bitte überprüfe den Link oder fordere eine neue Verifikations-Email an.'}
              </p>
            </div>
            <Button
              onClick={() => router.push('/auth/signin')}
              className="w-full h-12 bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-medium transition-all duration-200 rounded-xl shadow-sm"
            >
              Zur Anmeldung
            </Button>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-gray-600 hover:text-gray-800 flex items-center gap-2" 
            asChild
          >
            <Link href="/auth/signin">
              <ArrowLeft size={16} />
              Zurück zur Anmeldung
            </Link>
          </Button>
        </div>

        {/* Main Card */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-full flex items-center justify-center">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-800">
              Email-Verifikation
            </CardTitle>
          </CardHeader>
          
          {/* Notifications */}
          {notification && (
            <div className={`mx-6 p-3 rounded-lg text-sm ${
              notification.type === 'success' 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {notification.message}
            </div>
          )}
          
          <CardContent className="space-y-6">
            {renderContent()}

            {/* Help Section */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              <h3 className="font-semibold text-gray-800 text-sm flex items-center gap-2">
                <AlertCircle size={16} />
                Hilfe benötigt?
              </h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p>• Überprüfe dein Email-Postfach (auch Spam-Ordner)</p>
                <p>• Verifikations-Links sind 24 Stunden gültig</p>
                <p>• Bei Problemen kontaktiere unseren Support</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
                <p className="text-gray-600">Lade...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  )
}
