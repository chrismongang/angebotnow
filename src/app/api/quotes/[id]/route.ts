export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    // Check if database is available
    if (!process.env.DATABASE_URL) {
      // Demo mode - return mock data
      const mockQuote = {
        id: id,
        clientName: 'Demo Kunde',
        projectInfo: 'Demo Projekt',
        imagePath: 'https://via.placeholder.com/400x300',
        status: 'COMPLETED',
        createdAt: new Date().toISOString(),
        quoteNumber: 'AN20250001',
        clientStreet: 'Musterstraße 123',
        clientCity: '90475 Nürnberg',
        aiData: {
          description: 'Demo Projektbeschreibung',
          positions: [
            { title: 'Demo Position 1', qty: 1, unit: 'Stk', price: 100 },
            { title: 'Demo Position 2', qty: 2, unit: 'm', price: 50 }
          ],
          total: 200
        }
      }
      return NextResponse.json(mockQuote)
    }

    const quote = await prisma.quote.findUnique({
      where: { id: id },
      select: {
        id: true,
        clientName: true,
        projectInfo: true,
        imagePath: true,
        status: true,
        createdAt: true,
        quoteNumber: true,
        clientStreet: true,
        clientCity: true,
        aiData: true
      }
    })

    if (!quote) {
      return NextResponse.json({ error: 'Angebot nicht gefunden' }, { status: 404 })
    }

    return NextResponse.json(quote)
  } catch (error) {
    console.error('Error fetching quote:', error)
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 })
  }
}
