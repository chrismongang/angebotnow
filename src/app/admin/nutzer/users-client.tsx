'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Users, Search, Filter, Download } from 'lucide-react'
import Link from 'next/link'

interface AdminUser {
  id: string
  email: string
  name: string | null
  firstName: string | null
  lastName: string | null
  createdAt: string
  subscriptionStatus: string
  subscriptionTier: string
  lastPaymentDate: string | null
  referralCount: number
}

export function UsersClient() {
  const [q, setQ] = useState('')
  const [tier, setTier] = useState('')
  const [items, setItems] = useState<AdminUser[]>([])
  const [page, setPage] = useState(1)
  const [pageCount, setPageCount] = useState(1)
  const [loading, setLoading] = useState(false)

  const load = async (newPage = 1) => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (q) params.set('q', q)
      if (tier) params.set('tier', tier)
      params.set('take', '50')
      params.set('page', String(newPage))
      const res = await fetch(`/api/admin/users?${params.toString()}`, { cache: 'no-store' })
      const data = await res.json()
      setItems(data.items)
      setPage(newPage)
      setPageCount(data.pageCount || 1)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const canPrev = page > 1
  const canNext = page < pageCount

  return (
    <>
      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#676767]" />
                <Input
                  placeholder="Nach E-Mail oder Name suchen..."
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  className="pl-10 bg-[#EDEDED] border-[#EDEDED] focus:border-[#F89813] focus:ring-[#F89813] rounded-xl"
                />
              </div>
            </div>
            <select
              value={tier}
              onChange={(e) => setTier(e.target.value)}
              className="px-3 py-2 border border-[#EDEDED] rounded-xl bg-[#EDEDED] focus:border-[#F89813] focus:ring-[#F89813]"
            >
              <option value="">Alle Tiers</option>
              <option value="FREE">FREE</option>
              <option value="PRO">PRO</option>
            </select>
            <Button variant="outline" onClick={() => load(1)} className="border-[#F89813] text-[#F89813] hover:bg-[#F89813] hover:text-white">
              <Filter className="h-4 w-4 mr-2" />
              Filter anwenden
            </Button>
            <Button variant="outline" className="border-[#F89813] text-[#F89813] hover:bg-[#F89813] hover:text-white">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-[#404040]">Nutzer-Übersicht ({items.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-[#EDEDED] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-[#676767]" />
              </div>
              <h3 className="text-lg font-semibold text-[#404040] mb-2">Keine Nutzer gefunden</h3>
              <p className="text-[#676767]">Passen Sie die Filter an oder laden Sie erneut.</p>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {items.map((u) => (
                  <div key={u.id} className="p-4 border rounded-xl hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="text-[#404040] font-medium">{u.email}</div>
                        <div className="text-sm text-[#676767]">{u.firstName || ''} {u.lastName || ''}</div>
                        <div className="text-xs text-[#676767] mt-1">Tier: {u.subscriptionTier} • Status: {u.subscriptionStatus}</div>
                        <div className="text-xs text-[#676767]">Registriert: {new Date(u.createdAt).toLocaleDateString('de-DE')}</div>
                      </div>
                      <Button asChild variant="outline" className="border-[#F89813] text-[#F89813] hover:bg-[#F89813] hover:text-white">
                        <Link href={`/angebote`}>Angebote ansehen</Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              {/* Pagination */}
              <div className="flex items-center justify-center gap-2 mt-4">
                <Button variant="outline" disabled={!canPrev || loading} onClick={() => load(page - 1)} className="border-[#F89813] text-[#F89813] hover:bg-[#F89813] hover:text-white">Zurück</Button>
                <span className="text-sm text-[#676767]">Seite {page} von {pageCount}</span>
                <Button variant="outline" disabled={!canNext || loading} onClick={() => load(page + 1)} className="border-[#F89813] text-[#F89813] hover:bg-[#F89813] hover:text-white">Weiter</Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </>
  )
}


