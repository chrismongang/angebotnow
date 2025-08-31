export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { trackEvent, updateUserProperties } from '@/lib/loops'

// Helper function to calculate total from positions
function calculateTotal(positions: Array<{ qty: number; price: number }>): number {
  if (!positions || !Array.isArray(positions)) {
    return 0
  }
  
  return positions.reduce((sum, position) => {
    const qty = typeof position.qty === 'number' ? position.qty : 0
    const price = typeof position.price === 'number' ? position.price : 0
    return sum + (qty * price)
  }, 0)
}

// Helper function to get total with VAT
function calculateTotalWithVAT(total: number, vatRate: number = 0.19): number {
  return total * (1 + vatRate)
}

export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if database is available
    if (!process.env.DATABASE_URL) {
      // Demo mode - return mock data with AI data
      const mockQuotes = [
        {
          id: '0123',
          clientName: 'Max Müller',
          projectInfo: 'Badezimmer Sanierung',
          imagePath: '/api/placeholder/150/100',
          createdAt: new Date('2024-08-20'),
          quoteNumber: 'AN20250001',
          clientStreet: 'Musterstraße 123',
          clientCity: '90475 Nürnberg',
          aiData: {
            description: 'Komplette Badezimmer-Sanierung mit neuen Fliesen',
            positions: [
              { title: 'Fliesenarbeiten', qty: 12, unit: 'm²', price: 45 },
              { title: 'Sanitäranlagen', qty: 1, unit: 'Psch', price: 800 },
              { title: 'Entsorgung Altmaterial', qty: 1, unit: 'Psch', price: 150 }
            ],
            total: calculateTotalWithVAT(calculateTotal([
              { qty: 12, price: 45 },
              { qty: 1, price: 800 },
              { qty: 1, price: 150 }
            ]))
          }
        },
        {
          id: '0122',
          clientName: 'Anna Schmidt',
          projectInfo: 'Sanierungsarbeiten',
          imagePath: '/api/placeholder/150/100',
          createdAt: new Date('2024-08-17'),
          quoteNumber: 'AN20250002',
          aiData: {
            description: 'Umfassende Sanierungsarbeiten im Wohnbereich',
            positions: [
              { title: 'Wandverkleidung', qty: 25, unit: 'm²', price: 35 },
              { title: 'Deckenarbeiten', qty: 20, unit: 'm²', price: 28 },
              { title: 'Malerarbeiten', qty: 45, unit: 'm²', price: 12 }
            ],
            total: calculateTotalWithVAT(calculateTotal([
              { qty: 25, price: 35 },
              { qty: 20, price: 28 },
              { qty: 45, price: 12 }
            ]))
          }
        }
      ]
      
      return NextResponse.json(mockQuotes)
    }

    // Get user-specific quotes from database
    const quotes = await prisma.quote.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' }
    })
    
    return NextResponse.json(quotes)
  } catch (error) {
    console.error('Error fetching quotes:', error)
    return NextResponse.json({ error: 'Failed to fetch quotes' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const projectInfo = formData.get('projectInfo') as string
    const clientName = formData.get('clientName') as string
    const clientStreet = formData.get('clientStreet') as string
    const clientCity = formData.get('clientCity') as string
    const file = formData.get('file') as File

    if (!projectInfo || !clientName || !file) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Create quote in database
    const quote = await prisma.quote.create({
      data: {
        userId: session.user.id,
        clientName,
        projectInfo,
        clientStreet: clientStreet || null,
        clientCity: clientCity || null,
        status: 'PENDING'
      }
    })

    // User mit subscriptionTier und monthlyQuoteCount aus der Datenbank abrufen
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { 
        subscriptionTier: true,
        monthlyQuoteCount: true,
        quoteCountResetDate: true
      }
    })

    // Monatliches Reset prüfen und monthlyQuoteCount aktualisieren
    const now = new Date()
    const resetDate = user?.quoteCountResetDate || now
    const isNewMonth = now.getMonth() !== resetDate.getMonth() || now.getFullYear() !== resetDate.getFullYear()
    
    let currentMonthlyCount = user?.monthlyQuoteCount || 0
    if (isNewMonth) {
      currentMonthlyCount = 1 // Neuer Monat, erste Quote
      // Reset-Datum aktualisieren
      await prisma.user.update({
        where: { id: session.user.id },
        data: { 
          monthlyQuoteCount: 1,
          quoteCountResetDate: now
        }
      })
    } else {
      // Monatlichen Count erhöhen
      currentMonthlyCount += 1
      await prisma.user.update({
        where: { id: session.user.id },
        data: { monthlyQuoteCount: currentMonthlyCount }
      })
    }

    // Loops Event: quote_created
    await trackEvent(session.user.email!, 'quote_created', {
      userId: session.user.id,
      quoteId: quote.id,
      plan: user?.subscriptionTier?.toLowerCase() || 'free',
      quotesCount: currentMonthlyCount,
      totalQuotesCreated: currentMonthlyCount,
      createdAt: new Date().toISOString(),
      projectType: projectInfo,
      clientName,
      isNewMonth: isNewMonth,
      month: now.getMonth() + 1,
      year: now.getFullYear()
    })

    // User Properties in Loops aktualisieren
    await updateUserProperties(session.user.email!, {
      monthlyQuotesCount: currentMonthlyCount,
      lastQuoteDate: new Date().toISOString(),
      totalQuotesCreated: currentMonthlyCount,
      quoteCountResetDate: now.toISOString()
    })

    // Free-Limit Check (jetzt korrekt mit monatlichem Count)
    if (user?.subscriptionTier === 'FREE' && currentMonthlyCount >= 5) {
      await trackEvent(session.user.email!, 'hit_free_limit', {
        userId: session.user.id,
        plan: 'free',
        quotesCount: currentMonthlyCount,
        createdAt: new Date().toISOString(),
        limit: 5,
        month: now.getMonth() + 1,
        year: now.getFullYear()
      })
    }

    return NextResponse.json({ success: true, quoteId: quote.id })
  } catch (error) {
    console.error('Error creating quote:', error)
    return NextResponse.json({ error: 'Failed to create quote' }, { status: 500 })
  }
}
