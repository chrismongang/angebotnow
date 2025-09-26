'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FileText, Search, Filter, Download } from 'lucide-react'
import Link from 'next/link'

interface AdminQuote {
  id: string
  user: { id: string; email: string | null }
  clientName: string
  projectInfo: string
  quoteNumber: string | null
  status: string
  createdAt: string
}

export function QuotesClient() {
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('')
  const [items, setItems] = useState<AdminQuote[]>([])
  const [page, setPage] = useState(1)
  const [pageCount, setPageCount] = useState(1)
  const [loading, setLoading] = useState(false)
  const [range, setRange] = useState('7d')

  const computeRange = () => {
    const now = new Date()
    const to = now.toISOString()
    let from: string | undefined
    switch (range) {
      case '7d': { const d = new Date(now); d.setDate(d.getDate() - 7); from = d.toISOString(); break }
      case '30d': { const d = new Date(now); d.setDate(d.getDate() - 30); from = d.toISOString(); break }
      case '90d': { const d = new Date(now); d.setDate(d.getDate() - 90); from = d.toISOString(); break }
      case 'ytd': { const d = new Date(now.getFullYear(), 0, 1); from = d.toISOString(); break }
      case 'all': default: from = undefined
    }
    return { from, to }
  }

  const load = async (newPage = 1) => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (q) params.set('q', q)
      if (status) params.set('status', status)
      const { from, to } = computeRange()
      if (from) params.set('from', from)
      if (range !== 'all') params.set('to', to)
      params.set('take', '50')
      params.set('page', String(newPage))
      const res = await fetch(`/api/admin/quotes?${params.toString()}`, { cache: 'no-store' })
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
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#676767]" />
                <Input
                  placeholder="Nach Kunde, Projekt oder Angebotsnummer suchen..."
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  className="pl-10 bg-[#EDEDED] border-[#EDEDED] focus:border-[#F89813] focus:ring-[#F89813] rounded-xl"
                />
              </div>
            </div>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="px-3 py-2 border border-[#EDEDED] rounded-xl bg-[#EDEDED] focus:border-[#F89813] focus:ring-[#F89813]"
            >
              <option value="">Alle Status</option>
              <option value="PENDING">PENDING</option>
              <option value="AI_DONE">AI_DONE</option>
              <option value="COMPLETED">COMPLETED</option>
              <option value="FAILED">FAILED</option>
            </select>
            <select
              value={range}
              onChange={(e) => setRange(e.target.value)}
              className="px-3 py-2 border border-[#EDEDED] rounded-xl bg-[#EDEDED] focus:border-[#F89813] focus:ring-[#F89813]"
            >
              <option value="7d">Letzte 7 Tage</option>
              <option value="30d">Letzte 30 Tage</option>
              <option value="90d">Letzte 90 Tage</option>
              <option value="ytd">YTD</option>
              <option value="all">Alle</option>
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

      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-[#404040]">Angebote-Übersicht ({items.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-[#EDEDED] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-[#676767]" />
              </div>
              <h3 className="text-lg font-semibold text-[#404040] mb-2">Keine Angebote gefunden</h3>
              <p className="text-[#676767]">Passen Sie die Filter an oder laden Sie erneut.</p>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {items.map((qte) => (
                  <div key={qte.id} className="p-4 border rounded-xl hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="text-sm text-[#676767]">{new Date(qte.createdAt).toLocaleDateString('de-DE')}</span>
                          {qte.quoteNumber && (
                            <span className="text-xs bg-gray-100 px-2 py-1 rounded">{qte.quoteNumber}</span>
                          )}
                          <span className="text-xs bg-gray-100 px-2 py-1 rounded">{qte.status}</span>
                        </div>
                        <div className="text-[#404040] font-medium">{qte.clientName}</div>
                        <div className="text-sm text-[#676767] line-clamp-2">{qte.projectInfo}</div>
                        <div className="text-xs text-[#676767] mt-1">User: {qte.user?.email || qte.user?.id}</div>
                      </div>
                      <Button asChild variant="outline" className="border-[#F89813] text-[#F89813] hover:bg-[#F89813] hover:text-white">
                        <Link href={`/angebot/${qte.id}`}>Angebot öffnen</Link>
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


