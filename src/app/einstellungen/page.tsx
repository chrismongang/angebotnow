'use client'

import { signOut, useSession } from 'next-auth/react'
import { AuthGuard } from "@/components/auth-guard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MobileNavigation } from "@/components/mobile-navigation"
import Link from 'next/link'
import { LogOut, User, Settings } from 'lucide-react'

export default function EinstellungenPage() {
  return (
    <AuthGuard>
      <EinstellungenContent />
    </AuthGuard>
  )
}

function EinstellungenContent() {
  const { data: session } = useSession()

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' })
  }

  return (
    <>
      <div className="min-h-screen bg-background p-4 sm:p-8 pb-20 md:pb-8">
        <div className="container mx-auto max-w-4xl">
          {/* Header with top spacing */}
          <div className="pt-8 sm:pt-12 mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-[#404040]">Einstellungen</h1>
            <p className="text-[#676767]">Verwalten Sie Ihr Konto und App-Einstellungen</p>
          </div>

          {/* User Info Card */}
          {session?.user && (
            <Card className="mb-6 border-green-200 bg-green-50">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg sm:text-xl text-[#404040] flex items-center gap-2">
                  <User size={20} />
                  Angemeldet als
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="font-medium text-[#404040]">{session.user.name}</p>
                  <p className="text-[#676767]">{session.user.email}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Company Information Card - Clickable */}
          <Link href="/einstellungen/konto" className="block">
            <Card className="mb-6 hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg sm:text-xl text-[#404040]">Dein Konto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <p className="text-[#676767]">Kontodaten und Firmeninformationen verwalten</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* App Settings Card */}
          <Card className="mb-6">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg sm:text-xl text-[#404040] flex items-center gap-2">
                <Settings size={20} />
                App-Einstellungen
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <p className="text-[#676767]">Hier können Sie Ihre App-Einstellungen verwalten.</p>
                <p className="text-[#676767]">Weitere Funktionen werden in Kürze verfügbar sein.</p>
              </div>
            </CardContent>
          </Card>

          {/* Sign Out Card */}
          <Card className="border-red-200 bg-red-50">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg sm:text-xl text-red-800">Sitzung beenden</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-red-700">
                  Möchten Sie sich abmelden? Sie werden zur Startseite weitergeleitet.
                </p>
                <Button 
                  onClick={handleSignOut}
                  variant="destructive"
                  className="w-full sm:w-auto"
                >
                  <LogOut size={16} className="mr-2" />
                  Abmelden
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <MobileNavigation />
    </>
  )
}
