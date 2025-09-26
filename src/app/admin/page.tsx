import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/admin'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, FileText, MessageSquare, BarChart3, Settings, Shield } from 'lucide-react'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const { isAdmin, session } = await requireAdmin()
  
  if (!isAdmin) {
    redirect('/auth/signin')
  }

  // Load quick stats + 7d trends
  const now = new Date()
  const sevenDaysAgo = new Date(now)
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  const fourteenDaysAgo = new Date(now)
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14)

  const [
    usersCount,
    quotesCount,
    feedbackCount,
    users7d,
    usersPrev7d,
    quotes7d,
    quotesPrev7d,
    feedback7d,
    feedbackPrev7d,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.quote.count(),
    prisma.feedback.count(),
    prisma.user.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    prisma.user.count({ where: { createdAt: { gte: fourteenDaysAgo, lt: sevenDaysAgo } } }),
    prisma.quote.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    prisma.quote.count({ where: { createdAt: { gte: fourteenDaysAgo, lt: sevenDaysAgo } } }),
    prisma.feedback.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    prisma.feedback.count({ where: { createdAt: { gte: fourteenDaysAgo, lt: sevenDaysAgo } } }),
  ])

  const pct = (curr: number, prev: number) => {
    if (prev === 0) return curr > 0 ? 100 : 0
    return Math.round(((curr - prev) / prev) * 100)
  }
  const usersDelta = pct(users7d, usersPrev7d)
  const quotesDelta = pct(quotes7d, quotesPrev7d)
  const feedbackDelta = pct(feedback7d, feedbackPrev7d)

  return (
    <div className="space-y-6">
      {/* Welcome Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-[#F89813] to-[#FFB366] rounded-2xl flex items-center justify-center">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-[#404040]">Willkommen im Admin-Bereich</h2>
              <p className="text-[#676767]">Angemeldet als: {session?.user?.email}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#404040]">{usersCount}</p>
                <p className="text-sm text-[#676767]">Registrierte Nutzer</p>
                <p className="text-xs text-[#676767]">7 Tage: {users7d} ({usersDelta >= 0 ? '+' : ''}{usersDelta}%)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <FileText className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#404040]">{quotesCount}</p>
                <p className="text-sm text-[#676767]">Erstellte Angebote</p>
                <p className="text-xs text-[#676767]">7 Tage: {quotes7d} ({quotesDelta >= 0 ? '+' : ''}{quotesDelta}%)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#404040]">{feedbackCount}</p>
                <p className="text-sm text-[#676767]">Feedback-Einträge</p>
                <p className="text-xs text-[#676767]">7 Tage: {feedback7d} ({feedbackDelta >= 0 ? '+' : ''}{feedbackDelta}%)</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Admin Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-[#F89813] to-[#FFB366] rounded-xl flex items-center justify-center">
                <Users className="h-5 w-5 text-white" />
              </div>
              <CardTitle className="text-lg text-[#404040]">Nutzer</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-[#676767] mb-4">
              Alle registrierten Nutzer verwalten, Plan-Status einsehen und Benutzerdaten verwalten.
            </p>
            <Button asChild className="w-full bg-gradient-to-r from-[#F89813] to-[#FFB366] hover:from-[#E88A0F] hover:to-[#F89813] border-0">
              <Link href="/admin/nutzer">
                Nutzer verwalten
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-[#F89813] to-[#FFB366] rounded-xl flex items-center justify-center">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <CardTitle className="text-lg text-[#404040]">Angebote</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-[#676767] mb-4">
              Alle erstellten Angebote einsehen, Status überwachen und Details analysieren.
            </p>
            <Button asChild className="w-full bg-gradient-to-r from-[#F89813] to-[#FFB366] hover:from-[#E88A0F] hover:to-[#F89813] border-0">
              <Link href="/admin/angebote">
                Angebote einsehen
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-[#F89813] to-[#FFB366] rounded-xl flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-white" />
              </div>
              <CardTitle className="text-lg text-[#404040]">Feedback</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-[#676767] mb-4">
              Nutzerfeedback verwalten, Bewertungen einsehen und Optimierungen ableiten.
            </p>
            <Button asChild className="w-full bg-gradient-to-r from-[#F89813] to-[#FFB366] hover:from-[#E88A0F] hover:to-[#F89813] border-0">
              <Link href="/admin/feedback">
                Feedback verwalten
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Info Card */}
      <Card className="border-l-4 border-l-[#F89813]">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <BarChart3 className="h-5 w-5 text-[#F89813] mt-0.5" />
            <div>
              <h3 className="font-semibold text-[#404040] mb-2">Admin-Funktionen</h3>
              <p className="text-sm text-[#676767]">
                Nutze die Navigation oben oder die Karten, um zu den verschiedenen Admin-Bereichen zu gelangen. 
                Hier findest du alle wichtigen Übersichten und Verwaltungstools für deine App.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
