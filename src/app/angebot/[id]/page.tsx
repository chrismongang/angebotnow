import { prisma } from '@/lib/db'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Image } from "@/components/ui/image"
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import { AIResult } from '@/lib/ai/provider'
import { MobileNavigation } from "@/components/mobile-navigation"

interface PageProps {
  params: Promise<{
    id: string
  }>
}

async function getQuote(id: string) {
  // Check if database is available
  if (!process.env.DATABASE_URL) {
    console.warn('DATABASE_URL not available, cannot fetch quote')
    return null
  }
  
  try {
    const quote = await prisma.quote.findUnique({
      where: { id },
    })
    return quote
  } catch (error) {
    console.error('Error fetching quote:', error)
    return null
  }
}

function getStatusBadgeVariant(status: string) {
  switch (status) {
    case 'PENDING':
      return 'secondary'
    case 'AI_DONE':
      return 'outline'
    case 'COMPLETED':
      return 'default'
    case 'FAILED':
      return 'destructive'
    default:
      return 'secondary'
  }
}

function getStatusText(status: string) {
  switch (status) {
    case 'PENDING':
      return 'In Bearbeitung'
    case 'AI_DONE':
      return 'KI-Verarbeitung'
    case 'COMPLETED':
      return 'Abgeschlossen'
    case 'FAILED':
      return 'Fehlgeschlagen'
    default:
      return status
  }
}

export default async function QuoteDetailPage({ params }: PageProps) {
  const { id } = await params
  const quote = await getQuote(id)

  if (!quote) {
    notFound()
  }

  const aiData = quote.aiData as AIResult | null

  return (
    <>
      <div className="min-h-screen bg-background p-4 sm:p-8 pb-20 md:pb-8">
        <div className="container mx-auto max-w-6xl">
          {/* Mobile-optimierter Header with top spacing */}
          <div className="pt-8 sm:pt-12 mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold mb-2">Angebot Details</h1>
                <p className="text-muted-foreground">
                  Angebot für {quote.clientName}
                </p>
              </div>
              <Badge variant={getStatusBadgeVariant(quote.status)} className="text-sm self-start">
                {getStatusText(quote.status)}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            {/* Left Column - PDF and Actions */}
            <div className="space-y-4 sm:space-y-6">
              {/* Mobile-optimierte PDF Display */}
              {quote.status === 'COMPLETED' ? (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg sm:text-xl">📄 PDF Angebot</CardTitle>
                    <CardDescription>
                      Das generierte Angebot als PDF
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="aspect-[3/4] bg-muted rounded-xl border-2 border-dashed border-border flex items-center justify-center">
                      <div className="text-center p-4">
                        <div className="text-4xl mb-3">📄</div>
                        <p className="text-muted-foreground mb-2">PDF Vorschau</p>
                        <p className="text-sm text-muted-foreground">
                          Klicken Sie auf &quot;PDF herunterladen&quot; um das Angebot zu öffnen
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button asChild size="lg" className="h-12 flex-1">
                        <a href={`/api/quotes/${quote.id}/pdf`} target="_blank" rel="noopener noreferrer">
                          PDF herunterladen
                        </a>
                      </Button>
                      <Button variant="outline" size="lg" className="h-12" disabled>
                        Senden (Dummy)
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="p-6 sm:p-8 text-center">
                    <div className="space-y-4">
                      <div className="text-4xl">
                        {quote.status === 'FAILED' ? '❌' : '⏳'}
                      </div>
                      <p className="text-muted-foreground">
                        {quote.status === 'FAILED' 
                          ? 'Angebotserstellung fehlgeschlagen' 
                          : 'Angebot wird noch erstellt...'
                        }
                      </p>
                      {quote.status === 'FAILED' && (
                        <Button variant="outline" size="lg" className="h-12">
                          Erneut versuchen
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Mobile-optimierte Project Image */}
              {quote.imagePath && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg sm:text-xl">📸 Projektfoto</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Image
                      src={quote.imagePath}
                      alt="Projektfoto"
                      className="w-full rounded-xl shadow-sm"
                    />
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Column - Details */}
            <div className="space-y-4 sm:space-y-6">
              {/* Mobile-optimierte Client Information */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg sm:text-xl">👤 Auftraggeber</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Name</p>
                    <p className="text-base">{quote.clientName}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Erstellt am</p>
                    <p className="text-base">{formatDate(quote.createdAt)}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Mobile-optimierte Project Information */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg sm:text-xl">📋 Projektinformationen</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-base leading-relaxed">{quote.projectInfo}</p>
                </CardContent>
              </Card>

              {/* Mobile-optimierte AI Results */}
              {aiData && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg sm:text-xl">🤖 KI-Analyse</CardTitle>
                    <CardDescription>
                      Automatisch generierte Angebotspositionen
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-2">Beschreibung</p>
                      <p className="text-base leading-relaxed">{aiData.description}</p>
                    </div>

                    {aiData.positions && aiData.positions.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-3">Positionen</p>
                        <div className="space-y-3">
                          {aiData.positions.map((position, index) => (
                            <div key={index} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                              <div className="flex-1">
                                <p className="font-medium">{position.title}</p>
                                <p className="text-sm text-muted-foreground">
                                  {position.qty} {position.unit}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-medium">{(position.qty * position.price).toFixed(2)} €</p>
                                <p className="text-sm text-muted-foreground">
                                  {position.price.toFixed(2)} €/{position.unit}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {aiData.total && (
                      <div className="pt-4 border-t">
                        <div className="flex justify-between items-center">
                          <p className="text-lg font-semibold">Gesamtsumme</p>
                          <p className="text-2xl font-bold text-primary">{aiData.total.toFixed(2)} €</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Mobile-optimierte Quick Actions */}
          <div className="mt-8 sm:mt-12">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Button asChild size="lg" className="h-12">
                <Link href="/angebote">Zurück zur Übersicht</Link>
              </Button>
              <Button variant="outline" asChild size="lg" className="h-12">
                <Link href="/dashboard">Neues Angebot</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
      <MobileNavigation />
    </>
  )
}
