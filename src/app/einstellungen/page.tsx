import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MobileNavigation } from "@/components/mobile-navigation"
import Link from 'next/link'

export default function EinstellungenPage() {
  return (
    <>
      <div className="min-h-screen bg-background p-4 sm:p-8 pb-20 md:pb-8">
        <div className="container mx-auto max-w-4xl">
          {/* Header with top spacing */}
          <div className="pt-8 sm:pt-12 mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-[#404040]">Einstellungen</h1>
            <p className="text-[#676767]">Verwalten Sie Ihr Konto und App-Einstellungen</p>
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

          {/* App Settings Card */}
          <Card className="mb-6">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg sm:text-xl text-[#404040]">App-Einstellungen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <p className="text-[#676767]">Hier können Sie Ihre App-Einstellungen verwalten.</p>
                <p className="text-[#676767]">Weitere Funktionen werden in Kürze verfügbar sein.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <MobileNavigation />
    </>
  )
}
