import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/admin'
import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'
import { QuotesClient } from './quotes-client'

export const dynamic = 'force-dynamic'

export default async function AdminAngebotePage() {
  const { isAdmin } = await requireAdmin()
  if (!isAdmin) {
    redirect('/auth/signin')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#404040]">Angebote-Verwaltung</h2>
          <p className="text-[#676767]">Alle erstellten Angebote einsehen und verwalten</p>
        </div>
        <Button className="bg-gradient-to-r from-[#F89813] to-[#FFB366] hover:from-[#E88A0F] hover:to-[#F89813] border-0">
          <RefreshCw className="h-4 w-4 mr-2" />
          Aktualisieren
        </Button>
      </div>

      <QuotesClient />
    </div>
  )
}


