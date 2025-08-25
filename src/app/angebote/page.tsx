import { prisma } from '@/lib/db'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Image } from "@/components/ui/image"
import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import type { Quote } from '@prisma/client'

async function getQuotes() {
  // Check if database is available
  if (!process.env.DATABASE_URL) {
    console.warn('DATABASE_URL not available, returning empty quotes list')
    return []
  }
  
  try {
    const quotes = await prisma.quote.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50, // Limit to recent quotes
    })
    return quotes
  } catch (error) {
    console.error('Error fetching quotes:', error)
    return []
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

export default async function AngebotePage() {
  const quotes = await getQuotes()

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Angebote</h1>
          <p className="text-muted-foreground">
            Übersicht aller erstellten Angebote
          </p>
        </div>

        {quotes.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground mb-4">
                Noch keine Angebote erstellt
              </p>
              <Button asChild>
                <Link href="/dashboard">Erstes Angebot erstellen</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quotes.map((quote: Quote) => (
              <Card key={quote.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <CardTitle className="text-lg">{quote.clientName}</CardTitle>
                    <Badge variant={getStatusBadgeVariant(quote.status)}>
                      {getStatusText(quote.status)}
                    </Badge>
                  </div>
                  <CardDescription>
                    {formatDate(quote.createdAt)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Image thumbnail */}
                  {quote.imagePath && (
                    <div className="aspect-video bg-muted rounded-xl overflow-hidden">
                      <Image
                        src={quote.imagePath}
                        alt="Projektfoto"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {/* Project info preview */}
                  <div>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {quote.projectInfo}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button asChild size="sm" className="flex-1">
                      <Link href={`/angebot/${quote.id}`}>
                        Details anzeigen
                      </Link>
                    </Button>
                    
                    {quote.status === 'COMPLETED' && (
                      <Button asChild size="sm" variant="outline">
                        <a href={`/api/quotes/${quote.id}/pdf`} target="_blank" rel="noopener noreferrer">
                          PDF
                        </a>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-12">
          <div className="flex gap-4">
            <Button asChild>
              <Link href="/dashboard">Neues Angebot erstellen</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/">Zurück zur Startseite</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
