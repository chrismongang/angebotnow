'use client'

import { AuthGuard } from "@/components/auth-guard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AuthenticatedLayout } from "@/components/authenticated-layout"
import Link from 'next/link'
import { Settings } from 'lucide-react'

export default function EinstellungenPage() {
  return (
    <AuthGuard>
      <EinstellungenContent />
    </AuthGuard>
  )
}

function EinstellungenContent() {

  return (
    <AuthenticatedLayout>
      <div className="min-h-screen bg-background p-4 sm:p-8 pb-20 md:pb-8">
        <div className="container mx-auto max-w-4xl">
          {/* Header with top spacing */}
          <div className="pt-8 sm:pt-12 mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-[#404040]">Einstellungen</h1>
            <p className="text-[#676767]">Verwalte deine Konto und App-Einstellungen</p>
          </div>



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

          {/* App Settings Card - Clickable */}
          <Link href="/einstellungen/app" className="block">
            <Card className="mb-6 hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg sm:text-xl text-[#404040] flex items-center gap-2">
                  <Settings size={20} />
                  App-Einstellungen
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <p className="text-[#676767]">Account-Informationen und Feedback</p>
                </div>
              </CardContent>
            </Card>
          </Link>


        </div>
      </div>
    </AuthenticatedLayout>
  )
}
