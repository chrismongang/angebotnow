import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ 
        error: 'Unauthorized',
        message: 'Bitte melden Sie sich an, um die Datenbank zu testen'
      }, { status: 401 })
    }

    // Test database connection
    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()

    // Get user data
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    // Get user's quotes
    const quotes = await prisma.quote.findMany({
      where: { userId: session.user.id },
      take: 5 // Limit to 5 quotes
    })

    await prisma.$disconnect()

    return NextResponse.json({
      success: true,
      session: {
        userId: session.user.id,
        email: session.user.email,
        name: session.user.name
      },
      userData: user ? {
        id: user.id,
        name: user.name,
        email: user.email,
        companyName: user.companyName,
        street: user.street,
        city: user.city,
        phone: user.phone,
        taxNumber: user.taxNumber,
        vatNumber: user.vatNumber,
        bankName: user.bankName,
        bankAccount: user.bankAccount,
        bankBic: user.bankBic,
        lastQuoteNumber: user.lastQuoteNumber,
        currentYear: user.currentYear
      } : null,
      quotes: quotes.map(quote => ({
        id: quote.id,
        clientName: quote.clientName,
        projectInfo: quote.projectInfo,
        quoteNumber: quote.quoteNumber,
        createdAt: quote.createdAt
      })),
      databaseStatus: 'Connected and working'
    })
  } catch (error) {
    console.error('Error in test-db route:', error)
    return NextResponse.json(
      { 
        error: 'Database test failed', 
        details: error instanceof Error ? error.message : 'Unknown error',
        databaseStatus: 'Error'
      },
      { status: 500 }
    )
  }
}
