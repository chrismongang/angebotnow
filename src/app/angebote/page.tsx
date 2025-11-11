'use client'

import { useState, useEffect, Suspense } from 'react'
import { AuthGuard } from "@/components/auth-guard"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AuthenticatedLayout } from "@/components/authenticated-layout"
import { Image } from "@/components/ui/image"
import Link from 'next/link'
import { Plus, Filter, ChevronDown, ChevronUp, FileText, Euro } from 'lucide-react'
import { cn, calculateTotal, calculateTotalWithVAT, formatPrice } from '@/lib/utils'
import dynamicImport from 'next/dynamic'

// Force dynamic rendering to avoid prerendering issues
export const dynamic = 'force-dynamic'

interface Quote {
  id: string
  clientName: string
  projectInfo: string
  imagePath?: string
  createdAt: Date
  aiData?: {
    description: string
    positions: Array<{ title: string; description: string; qty: number; unit: string; price: number }>
    total: number
  }
  quoteNumber?: string // Added for structured quote number
  excludeVAT?: boolean // § 13b UStG
}

const AngebotePage = dynamicImport(() => Promise.resolve(AngebotePageContent), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-background p-4 sm:p-8 pb-20 md:pb-8">
      <div className="container mx-auto max-w-4xl">
        <div className="pt-8 sm:pt-12 mb-6 sm:mb-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
          </div>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  )
})

function AngebotePageContent() {
  return (
    <AuthGuard>
      <Suspense fallback={
        <div className="min-h-screen bg-background p-4 sm:p-8 pb-20 md:pb-8">
          <div className="container mx-auto max-w-4xl">
            <div className="pt-8 sm:pt-12 mb-6 sm:mb-8">
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
              </div>
            </div>
            <div className="animate-pulse space-y-4">
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      }>
        <AngeboteContent />
      </Suspense>
    </AuthGuard>
  )
}

export default AngebotePage

function AngeboteContent() {
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [showFilter, setShowFilter] = useState(false)
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadQuotes()
  }, [])

  const loadQuotes = async () => {
    setIsLoading(true)
    
    try {
      // Always fetch from API - let the API handle demo mode if needed
      const response = await fetch('/api/quotes')
      if (response.ok) {
        const data = await response.json()
        setQuotes(data)
      } else {
        console.error('Failed to fetch quotes:', response.status)
        setQuotes([])
      }
    } catch (error) {
      console.error('Error loading quotes:', error)
      setQuotes([])
    } finally {
      setIsLoading(false)
    }
  }

  const sortedQuotes = [...quotes].sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime()
    const dateB = new Date(b.createdAt).getTime()
    return sortOrder === 'desc' ? dateB - dateA : dateA - dateB
  })

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('de-DE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(new Date(date)).replace('.', '')
  }

  const getProjectDescription = (quote: Quote) => {
    if (quote.aiData?.description) {
      return quote.aiData.description
    }
    // Fallback to original project info
    const words = quote.projectInfo.split(' ').slice(0, 3)
    return words.join(' ')
  }

  const getQuoteTotal = (quote: Quote): number => {
    if (quote.aiData?.positions && Array.isArray(quote.aiData.positions)) {
      // Calculate total from positions
      const subtotal = calculateTotal(quote.aiData.positions)
      // Return total with VAT (as shown in PDF) - berücksichtige excludeVAT
      return calculateTotalWithVAT(subtotal, 0.19, quote.excludeVAT || false)
    }
    // Fallback to stored total or 0
    return quote.aiData?.total || 0
  }

  if (isLoading) {
    return (
      <AuthenticatedLayout>
        <div className="min-h-screen bg-background p-4 sm:p-8 pb-20 md:pb-8">
          <div className="container mx-auto max-w-4xl">
            <div className="pt-8 sm:pt-12 mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-[#404040]">Angebotshistorie</h1>
            </div>
            <div className="text-center py-12">
              <p className="text-[#676767]">Lade Angebote...</p>
            </div>
          </div>
        </div>
      </AuthenticatedLayout>
    )
  }

  return (
    <AuthenticatedLayout>
      <div className="min-h-screen bg-background p-4 sm:p-8 pb-20 md:pb-8">
        <div className="container mx-auto max-w-4xl">
          {/* Header with top spacing */}
          <div className="pt-8 sm:pt-12 mb-6 sm:mb-8">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl sm:text-3xl font-bold text-[#404040]">Angebotshistorie</h1>
              <Button
                size="sm"
                className="w-10 h-10 p-0 bg-gradient-to-r from-[#F89813] to-[#FFB366] hover:from-[#E88A0F] hover:to-[#F89813] border-0 shadow-md rounded-[14px]"
                asChild
              >
                <Link href="/dashboard">
                  <Plus size={20} className="text-white" />
                </Link>
              </Button>
            </div>
            
            {/* Filter Section */}
            <div className="space-y-3">
              <div 
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => setShowFilter(!showFilter)}
              >
                <span className="text-[#676767] text-sm">Filter</span>
                <Filter size={16} className="text-[#676767]" />
                {showFilter ? (
                  <ChevronUp size={16} className="text-[#676767]" />
                ) : (
                  <ChevronDown size={16} className="text-[#676767]" />
                )}
              </div>
              
              {showFilter && (
                <Card className="p-4">
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-[#404040]">Sortierung</h3>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant={sortOrder === 'desc' ? 'default' : 'outline'}
                        onClick={() => setSortOrder('desc')}
                        className={cn(
                          sortOrder === 'desc' 
                            ? 'bg-[#F89813] hover:bg-[#E88A0F] border-[#F89813] rounded-[14px]' 
                            : 'border-[#EDEDED] text-[#676767] rounded-[14px]'
                        )}
                      >
                        Neueste zuerst
                      </Button>
                      <Button
                        size="sm"
                        variant={sortOrder === 'asc' ? 'default' : 'outline'}
                        onClick={() => setSortOrder('asc')}
                        className={cn(
                          sortOrder === 'asc' 
                            ? 'bg-[#F89813] hover:bg-[#E88A0F] border-[#F89813] rounded-[14px]' 
                            : 'border-[#EDEDED] text-[#676767] rounded-[14px]'
                        )}
                      >
                        Älteste zuerst
                      </Button>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          </div>

          {/* Quotes List */}
          <div className="space-y-8">
            {sortedQuotes.length === 0 ? (
              <Card className="p-8 text-center">
                <div className="space-y-4">
                  <div className="w-16 h-16 mx-auto bg-[#EDEDED] rounded-full flex items-center justify-center">
                    <FileText size={24} className="text-[#676767]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-[#404040] mb-2">Keine Angebote vorhanden</h3>
                    <p className="text-[#676767] mb-4">Erstellen Sie Ihr erstes Angebot</p>
                    <Button
                      className="bg-gradient-to-r from-[#F89813] to-[#FFB366] hover:from-[#E88A0F] hover:to-[#F89813] border-0 rounded-[14px]"
                      asChild
                    >
                      <Link href="/dashboard">
                        Angebot erstellen
                      </Link>
                    </Button>
                  </div>
                </div>
              </Card>
            ) : (
              sortedQuotes.map((quote) => {
                const total = getQuoteTotal(quote)
                return (
                  <Link key={quote.id} href={`/angebot/${quote.id}`}>
                    <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer mb-3">
                      <CardContent className="p-0">
                        <div className="flex items-center gap-4">
                          {/* Image Preview */}
                          <div className="w-16 h-16 rounded-lg overflow-hidden bg-[#EDEDED] flex-shrink-0">
                            {quote.imagePath ? (
                              <Image
                                src={quote.imagePath}
                                alt="Projekt Vorschau"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <FileText size={20} className="text-[#676767]" />
                              </div>
                            )}
                          </div>
                          
                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-[#404040] mb-1">
                                  {quote.clientName}
                                </h3>
                                <p className="text-xs text-[#676767]">
                                  {quote.quoteNumber ? `Angebot #${quote.quoteNumber}` : `Angebot #${quote.id}`}
                                </p>
                              </div>
                              <div className="text-right ml-4">
                                {total > 0 && (
                                  <div className="mb-1">
                                    <span className="text-sm font-semibold text-[#404040]">
                                      {formatPrice(total)}
                                    </span>
                                  </div>
                                )}
                                <p className="text-xs text-[#676767]">
                                  {formatDate(quote.createdAt)}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                )
              })
            )}
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  )
}
