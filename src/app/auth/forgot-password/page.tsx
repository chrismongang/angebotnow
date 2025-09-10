'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Mail, AlertCircle, CheckCircle } from 'lucide-react'
import dynamicImport from 'next/dynamic'

// Force dynamic rendering to avoid prerendering issues
export const dynamic = 'force-dynamic'

// Dynamische Imports
const Card = dynamicImport(() => import('@/components/ui/card').then(mod => ({ default: mod.Card })), { ssr: false })
const CardContent = dynamicImport(() => import('@/components/ui/card').then(mod => ({ default: mod.CardContent })), { ssr: false })
const CardHeader = dynamicImport(() => import('@/components/ui/card').then(mod => ({ default: mod.CardHeader })), { ssr: false })
const CardTitle = dynamicImport(() => import('@/components/ui/card').then(mod => ({ default: mod.CardTitle })), { ssr: false })
const Button = dynamicImport(() => import('@/components/ui/button').then(mod => ({ default: mod.Button })), { ssr: false })
const Input = dynamicImport(() => import('@/components/ui/input').then(mod => ({ default: mod.Input })), { ssr: false })
const Label = dynamicImport(() => import('@/components/ui/label').then(mod => ({ default: mod.Label })), { ssr: false })

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
      } else {
        setError(data.error || 'Fehler beim Senden der Passwort-Reset-Email')
      }
    } catch (error) {
      setError('Fehler beim Senden der Anfrage')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
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

          {/* Success Card */}
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center pb-6">
              <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-800">
                Email gesendet! 📧
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="text-center space-y-4">
                <p className="text-gray-600">
                  Falls ein Konto mit der Email-Adresse <strong>{email}</strong> existiert, haben wir eine Passwort-Reset-Email gesendet.
                </p>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-blue-800 text-sm">
                    <strong>Wichtige Hinweise:</strong>
                  </p>
                  <ul className="text-blue-700 text-sm mt-2 space-y-1">
                    <li>• Überprüfe dein Email-Postfach (auch Spam-Ordner)</li>
                    <li>• Der Reset-Link ist 1 Stunde gültig</li>
                    <li>• Klicke auf den Link in der Email</li>
                  </ul>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700 text-sm">
                    <strong>Keine Email erhalten?</strong>
                  </p>
                  <ul className="text-gray-600 text-sm mt-2 space-y-1">
                    <li>• Überprüfe die Email-Adresse</li>
                    <li>• Warte einige Minuten</li>
                    <li>• Kontaktiere unseren Support</li>
                  </ul>
                </div>

                <Button
                  onClick={() => router.push('/auth/signin')}
                  className="w-full h-12 bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-medium transition-all duration-200 rounded-xl shadow-sm"
                >
                  Zurück zur Anmeldung
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
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
              Passwort vergessen?
            </CardTitle>
            <p className="text-gray-600 mt-2">
              Gib deine Email-Adresse ein und wir senden dir einen Link zum Zurücksetzen deines Passworts.
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email-Adresse
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    placeholder="deine@email.de"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    <p className="text-red-800 text-sm">{error}</p>
                  </div>
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoading || !email}
                className="w-full h-12 bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-medium transition-all duration-200 rounded-xl shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Sende...' : 'Passwort-Reset-Email senden'}
              </Button>
            </form>

            {/* Help Section */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              <h3 className="font-semibold text-gray-800 text-sm flex items-center gap-2">
                <AlertCircle size={16} />
                Hilfe benötigt?
              </h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p>• Nur für Email/Password Konten verfügbar</p>
                <p>• Google-Konten verwenden Google-Anmeldung</p>
                <p>• Email muss verifiziert sein</p>
                <p>• Reset-Links sind 1 Stunde gültig</p>
              </div>
            </div>

            {/* Alternative Options */}
            <div className="text-center">
              <p className="text-gray-600 text-sm">
                Zurück zur{' '}
                <Link href="/auth/signin" className="text-orange-600 hover:text-orange-700 font-medium">
                  Anmeldung
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
