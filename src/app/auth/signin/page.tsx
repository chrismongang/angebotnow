'use client'

import { signIn, getProviders, useSession } from 'next-auth/react'
import { useEffect, useState, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Shield, CheckCircle, Mail, Lock, User, Eye, EyeOff } from 'lucide-react'
import dynamic from 'next/dynamic'

// Dynamische Imports für bessere Chunk-Verwaltung
const Card = dynamic(() => import('@/components/ui/card').then(mod => ({ default: mod.Card })), { ssr: false })
const CardContent = dynamic(() => import('@/components/ui/card').then(mod => ({ default: mod.CardContent })), { ssr: false })
const CardHeader = dynamic(() => import('@/components/ui/card').then(mod => ({ default: mod.CardHeader })), { ssr: false })
const CardTitle = dynamic(() => import('@/components/ui/card').then(mod => ({ default: mod.CardTitle })), { ssr: false })
const Button = dynamic(() => import('@/components/ui/button').then(mod => ({ default: mod.Button })), { ssr: false })
const Input = dynamic(() => import('@/components/ui/input').then(mod => ({ default: mod.Input })), { ssr: false })
const Label = dynamic(() => import('@/components/ui/label').then(mod => ({ default: mod.Label })), { ssr: false })

// Loading-Komponente
function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Lade Anmeldemethoden...</p>
      </div>
    </div>
  )
}

// Registrierungsformular
function RegisterForm({ onToggle }: { onToggle: () => void }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Passwörter stimmen nicht überein')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Registrierung fehlgeschlagen')
      }

      // Nach erfolgreicher Registrierung automatisch anmelden
      await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        callbackUrl: '/dashboard',
      })
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Ein Fehler ist aufgetreten')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">
            Vorname
          </Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              id="firstName"
              type="text"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              className="pl-10"
              placeholder="Vorname"
              required
            />
          </div>
        </div>
        <div>
          <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">
            Nachname
          </Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              id="lastName"
              type="text"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              className="pl-10"
              placeholder="Nachname"
              required
            />
          </div>
        </div>
      </div>

      <div>
        <Label htmlFor="email" className="text-sm font-medium text-gray-700">
          Email
        </Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="pl-10"
            placeholder="ihre@email.com"
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="password" className="text-sm font-medium text-gray-700">
          Passwort
        </Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="pl-10 pr-10"
            placeholder="Mindestens 8 Zeichen"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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
            type={showConfirmPassword ? "text" : "password"}
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            className="pl-10 pr-10"
            placeholder="Passwort wiederholen"
            required
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {error && (
        <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
          {error}
        </div>
      )}

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full h-12 bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-medium transition-all duration-200 rounded-xl shadow-sm"
      >
        {isLoading ? 'Registriere...' : 'Registrieren'}
      </Button>

      <div className="text-center">
        <button
          type="button"
          onClick={onToggle}
          className="text-orange-600 hover:text-orange-700 text-sm font-medium"
        >
          Bereits ein Konto? Anmelden
        </button>
      </div>
    </form>
  )
}

// Anmeldeformular
function LoginForm({ onToggle }: { onToggle: () => void }) {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      })

      if (result?.error) {
        // Spezielle Behandlung für nicht verifizierte Emails
        if (result.error.includes('unverified')) {
          setError('Bitte verifiziere zuerst deine Email-Adresse. Überprüfe dein Postfach für den Verifikations-Link.')
        } else {
          setError('Ungültige Email oder Passwort')
        }
      }
    } catch (error) {
      setError('Ein Fehler ist aufgetreten')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="login-email" className="text-sm font-medium text-gray-700">
          Email
        </Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            id="login-email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="pl-10"
            placeholder="ihre@email.com"
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="login-password" className="text-sm font-medium text-gray-700">
          Passwort
        </Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            id="login-password"
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="pl-10 pr-10"
            placeholder="Ihr Passwort"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {error && (
        <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
          {error}
        </div>
      )}

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full h-12 bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-medium transition-all duration-200 rounded-xl shadow-sm"
      >
        {isLoading ? 'Anmelden...' : 'Anmelden'}
      </Button>

      <div className="text-center space-y-2">
        <div>
          <Link 
            href="/auth/forgot-password" 
            className="text-sm text-orange-600 hover:text-orange-700 font-medium"
          >
            Passwort vergessen?
          </Link>
        </div>
        <div>
          <button
            type="button"
            onClick={onToggle}
            className="text-orange-600 hover:text-orange-700 text-sm font-medium"
          >
            Noch kein Konto? Registrieren
          </button>
        </div>
      </div>
    </form>
  )
}

// Hauptkomponente
function SignInContent() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [providers, setProviders] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  // const [isLoginMode, setIsLoginMode] = useState(true) // Temporär deaktiviert für Entwicklung

  useEffect(() => {
    // Redirect authenticated users to dashboard
    if (status === 'authenticated') {
      router.push('/dashboard')
      return
    }

    const fetchProviders = async () => {
      try {
        const res = await getProviders()
        setProviders(res)
      } catch (error) {
        console.error('Error fetching providers:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    if (status !== 'loading') {
      fetchProviders()
    }
  }, [status, router])

  if (isLoading || status === 'loading') {
    return <LoadingSpinner />
  }

  // Don't show signin page if already authenticated
  if (status === 'authenticated') {
    return null
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
            <Link href="/">
              <ArrowLeft size={16} />
              Zurück zur Startseite
            </Link>
          </Button>
        </div>

        {/* Main Card */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-full flex items-center justify-center">
              <Shield className="w-8 h-8 text-white" />
            </div>
                        <CardTitle className="text-2xl font-bold text-gray-800">
              Willkommen bei AngebotNow
            </CardTitle>
            <p className="text-gray-600 mt-2">
              Melde dich an, um deine Angebote zu verwalten
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Email/Password Form - Temporär versteckt für Entwicklung */}
            {/* 
            {isLoginMode ? (
              <LoginForm onToggle={() => setIsLoginMode(false)} />
            ) : (
              <RegisterForm onToggle={() => setIsLoginMode(true)} />
            )}

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">oder</span>
              </div>
            </div>
            */}

            {/* Social Providers - Credentials Provider versteckt für Entwicklung */}
            {providers && Object.values(providers)
              .filter((provider: any) => provider.id !== 'credentials') // Credentials Provider verstecken
              .map((provider: any) => (
                <Button
                  key={provider.id}
                  onClick={() => signIn(provider.id, { callbackUrl: '/dashboard' })}
                  className={`w-full h-12 font-medium transition-all duration-200 rounded-xl shadow-sm ${
                    provider.id === 'google' 
                      ? 'bg-white border-2 border-gray-200 hover:border-orange-300 hover:bg-orange-50 text-gray-700' 
                      : provider.id === 'azure-ad'
                      ? 'bg-[#2F2F2F] hover:bg-[#1F1F1F] text-white border-0'
                      : 'bg-white border-2 border-gray-200 hover:border-orange-300 hover:bg-orange-50 text-gray-700'
                  }`}
                  variant="outline"
                >
                  {provider.id === 'google' && (
                    <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                  )}
                  {provider.id === 'azure-ad' && (
                    <svg className="w-5 h-5 mr-3" viewBox="0 0 21 21" xmlns="http://www.w3.org/2000/svg">
                      <g fill="none" fillRule="evenodd">
                        <path d="M0 0h10v10H0z" fill="#F25022" />
                        <path d="M11 0h10v10H11z" fill="#7FBA00" />
                        <path d="M0 11h10v10H0z" fill="#00A4EF" />
                        <path d="M11 11h10v10H11z" fill="#FFB900" />
                      </g>
                    </svg>
                  )}
                  Mit {provider.name} anmelden
                </Button>
              ))}

            {/* Features */}
            <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl p-4 space-y-3">
              <h3 className="font-semibold text-gray-800 text-sm">Was dich erwartet:</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle size={14} className="text-green-500 flex-shrink-0" />
                  <span>KI-gestützte Angebotserstellung</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle size={14} className="text-green-500 flex-shrink-0" />
                  <span>Professionelle PDF-Generierung</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle size={14} className="text-green-500 flex-shrink-0" />
                  <span>Sichere Cloud-Speicherung</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle size={14} className="text-green-500 flex-shrink-0" />
                  <span>Mobile-optimierte Benutzeroberfläche</span>
                </div>
              </div>
            </div>

            {/* Privacy Notice */}
            <div className="text-center text-xs text-gray-500">
              <p>
                Durch die Anmeldung stimmen Sie unseren{' '}
                <Link href="/privacy" className="text-orange-600 hover:underline">
                  Datenschutzrichtlinien
                </Link>{' '}
                und{' '}
                <Link href="/terms" className="text-orange-600 hover:underline">
                  Nutzungsbedingungen
                </Link>{' '}
                zu.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Hauptexport mit Suspense
export default function SignInPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <SignInContent />
    </Suspense>
  )
}
