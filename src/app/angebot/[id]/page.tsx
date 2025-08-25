import { prisma } from '@/lib/db'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Image } from "@/components/ui/image"
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import { AIResult } from '@/lib/ai/provider'

interface PageProps {
  params: {
    id: string
  }
}

async function getQuote(id: string) {
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
  const quote = await getQuote(params.id)

  if (!quote) {
    notFound()
  }

  const aiData = quote.aiData as AIResult | null

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold mb-2">Angebot Details</h1>
              <p className="text-muted-foreground">
                Angebot für {quote.clientName}
              </p>
            </div>
            <Badge variant={getStatusBadgeVariant(quote.status)} className="text-sm">
              {getStatusText(quote.status)}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - PDF and Actions */}
          <div className="space-y-6">
            {/* PDF Display */}
            {quote.status === 'COMPLETED' ? (
              <Card>
                <CardHeader>
                  <CardTitle>PDF Angebot</CardTitle>
                  <CardDescription>
                    Das generierte Angebot als PDF
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="aspect-[3/4] bg-muted rounded-xl border-2 border-dashed border-border flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-muted-foreground mb-2">PDF Vorschau</p>
                      <p className="text-sm text-muted-foreground">
                        Klicken Sie auf &quot;PDF herunterladen&quot; um das Angebot zu öffnen
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button asChild className="flex-1">
                      <a href={`/api/quotes/${quote.id}/pdf`} target="_blank" rel="noopener noreferrer">
                        PDF herunterladen
                      </a>
                    </Button>
                    <Button variant="outline" disabled>
                      Senden (Dummy)
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground mb-4">
                    {quote.status === 'FAILED' 
                      ? 'Angebotserstellung fehlgeschlagen' 
                      : 'Angebot wird noch erstellt...'
                    }
                  </p>
                  {quote.status === 'FAILED' && (
                    <Button variant="outline">
                      Erneut versuchen
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Project Image */}
            {quote.imagePath && (
              <Card>
                <CardHeader>
                  <CardTitle>Projektfoto</CardTitle>
                </CardHeader>
                <CardContent>
                  <Image
                    src={quote.imagePath}
                    alt="Projektfoto"
                    className="w-full rounded-xl"
                  />
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Details */}
          <div className="space-y-6">
            {/* Client Information */}
            <Card>
              <CardHeader>
                <CardTitle>Auftraggeber</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <span className="font-medium">Name:</span> {quote.clientName}
                </div>
                <div>
                  <span className="font-medium">Erstellt am:</span> {formatDate(quote.createdAt)}
                </div>
                <div>
                  <span className="font-medium">Status:</span> {getStatusText(quote.status)}
                </div>
              </CardContent>
            </Card>

            {/* Project Information */}
            <Card>
              <CardHeader>
                <CardTitle>Projektbeschreibung</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed">
                  {quote.projectInfo}
                </p>
              </CardContent>
            </Card>

            {/* AI Generated Data */}
            {aiData && (
              <Card>
                <CardHeader>
                  <CardTitle>KI-generierte Positionen</CardTitle>
                  <CardDescription>
                    Automatisch erstellte Angebotspositionen
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {aiData.positions.map((position, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                        <div>
                          <p className="font-medium">{position.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {position.qty} {position.unit} × {position.price.toFixed(2)} €
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{(position.qty * position.price).toFixed(2)} €</p>
                        </div>
                      </div>
                    ))}
                    
                    {aiData.total && (
                      <div className="border-t pt-3 mt-4">
                        <div className="flex justify-between items-center font-bold text-lg">
                          <span>Gesamtbetrag:</span>
                          <span>{aiData.total.toFixed(2)} €</span>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Description */}
            {aiData?.description && (
              <Card>
                <CardHeader>
                  <CardTitle>KI-Analyse</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed">
                    {aiData.description}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-12 flex gap-4">
          <Button asChild>
            <Link href="/angebote">Zurück zur Übersicht</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard">Neues Angebot erstellen</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
