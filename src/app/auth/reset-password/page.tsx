'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Lock, Eye, EyeOff, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react'
import dynamic from 'next/dynamic'

// Dynamische Imports
const Card = dynamic(() => import('@/components/ui/card').then(mod => ({ default: mod.Card })), { ssr: false })
const CardContent = dynamic(() => import('@/components/ui/card').then(mod => ({ default: mod.CardContent })), { ssr: false })
const CardHeader = dynamic(() => import('@/components/ui/card').then(mod => ({ default: mod.CardHeader })), { ssr: false })
const CardTitle = dynamic(() => import('@/components/ui/card').then(mod => ({ default: mod.CardTitle })), { ssr: false })
const Button = dynamic(() => import('@/components/ui/button').then(mod => ({ default: mod.Button })), { ssr: false })
const Input = dynamic(() => import('@/components/ui/input').then(mod => ({ default: mod.Input })), { ssr: false })
const Label = dynamic(() => import('@/components/ui/label').then(mod => ({ default: mod.Label })), { ssr: false })

interface User {
  firstName: string
  lastName: string
  email: string
}

interface ResetState {
  status: 'loading' | 'valid' | 'invalid' | 'expired' | 'success' | 'error'
  user?: User
  error?: string
}

export default function ResetPasswordPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [state, setState] = useState<ResetState>({ status: 'loading' })
  const [isResetting, setIsResetting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  })

  const token = searchParams.get('token')

  useEffect(() => {
    if (!token) {
      setState({ status: 'invalid', error: 'Kein Token gefunden' })
      return
    }

    // Token validieren
    validateToken()
  }, [token])

  const validateToken = async () => {
    try {
      const response = await fetch(`/api/auth/reset-password?token=${token}`)
      const data = await response.json()

      if (response.ok && data.valid) {
        setState({ status: 'valid', user: data.user })
      } else {
        if (data.error?.includes('abgelaufen')) {
          setState({ status: 'expired', error: data.error })
        } else if (data.error?.includes('Google')) {
          setState({ status: 'invalid', error: 'Dieses Konto wurde über Google angemeldet. Passwort-Reset ist nicht verfügbar.' })
        } else {
          setState({ status: 'invalid', error: data.error || 'Ungültiger Token' })
        }
      }
    } catch (error) {
      setState({ status: 'error', error: 'Fehler bei der Token-Validierung' })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return

    setIsResetting(true)
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          password: formData.password,
          confirmPassword: formData.confirmPassword
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setState({ status: 'success', user: data.user })
      } else {
        setState({ status: 'error', error: data.error || 'Passwort-Reset fehlgeschlagen' })
      }
    } catch (error) {
      setState({ status: 'error', error: 'Fehler beim Zurücksetzen des Passworts' })
    } finally {
      setIsResetting(false)
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
          <div className="space-y-4">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-800">
                Neues Passwort festlegen
              </h2>
              <p className="text-gray-600 mt-2">
                Hallo {state.user?.firstName}, lege ein neues Passwort für dein Konto fest.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Neues Passwort
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="pl-10 pr-10"
                    placeholder="Mindestens 8 Zeichen"
                    required
                    disabled={isResetting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                  Passwort bestätigen
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="pl-10 pr-10"
                    placeholder="Passwort wiederholen"
                    required
                    disabled={isResetting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isResetting || !formData.password || !formData.confirmPassword || formData.password !== formData.confirmPassword}
                className="w-full h-12 bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-medium transition-all duration-200 rounded-xl shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isResetting ? 'Setze zurück...' : 'Passwort zurücksetzen'}
              </Button>
            </form>
          </div>
        )

      case 'success':
        return (
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800">
              Passwort erfolgreich zurückgesetzt! 🔐
            </h2>
            <p className="text-gray-600">
              Hallo {state.user?.firstName}, dein Passwort wurde erfolgreich geändert.
            </p>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-green-800 text-sm">
                Du kannst dich jetzt mit deinem neuen Passwort anmelden!
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
              Der Passwort-Reset-Link ist abgelaufen. Bitte fordere eine neue Passwort-Reset-Email an.
            </p>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <p className="text-yellow-800 text-sm">
                Passwort-Reset-Links sind 1 Stunde gültig.
              </p>
            </div>
            <Button
              onClick={() => router.push('/auth/forgot-password')}
              className="w-full h-12 bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-medium transition-all duration-200 rounded-xl shadow-sm"
            >
              Neue Passwort-Reset-Email anfordern
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
              Der Passwort-Reset-Link ist ungültig oder fehlerhaft.
            </p>
            <div className="bg-red-50 p-4 rounded-lg">
              <p className="text-red-800 text-sm">
                {state.error || 'Bitte überprüfe den Link oder fordere eine neue Passwort-Reset-Email an.'}
              </p>
            </div>
            <Button
              onClick={() => router.push('/auth/forgot-password')}
              className="w-full h-12 bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-medium transition-all duration-200 rounded-xl shadow-sm"
            >
              Passwort-Reset-Email anfordern
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
              <Lock className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-800">
              Passwort zurücksetzen
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {renderContent()}

            {/* Help Section */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              <h3 className="font-semibold text-gray-800 text-sm flex items-center gap-2">
                <AlertCircle size={16} />
                Hilfe benötigt?
              </h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p>• Passwort muss mindestens 8 Zeichen lang sein</p>
                <p>• Reset-Links sind 1 Stunde gültig</p>
                <p>• Nur für Email/Password Konten verfügbar</p>
                <p>• Bei Problemen kontaktiere unseren Support</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
