import { NextRequest, NextResponse } from 'next/server'
import { generatePDF } from '@/lib/pdf/generate'
import { getCompanyInfoForPDF } from '@/lib/user-data'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Check if database is available
    if (!process.env.DATABASE_URL) {
      // Demo mode - generate PDF with mock data
      const mockQuote = {
        id,
        clientName: 'Demo Kunde',
        projectInfo: 'Demo Projekt - Bitte konfigurieren Sie Ihre Daten in den Einstellungen',
        positions: [
          { title: 'Demo Position', qty: 1, unit: 'Psch', price: 100 }
        ],
        total: 100
      }

      const companyInfo = getCompanyInfoForPDF()
      
      const pdfBytes = await generatePDF({
        clientName: mockQuote.clientName,
        projectInfo: mockQuote.projectInfo,
        positions: mockQuote.positions,
        total: mockQuote.total,
        quoteNumber: id,
        company: companyInfo
      })

      return new NextResponse(Buffer.from(pdfBytes), {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="angebot_${id}.pdf"`,
          'Cache-Control': 'no-store'
        }
      })
    }

    // Database mode - fetch actual quote data
    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()

    const quote = await prisma.quote.findUnique({
      where: { id }
    })

    if (!quote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 })
    }

    // Get company info from user data
    const companyInfo = getCompanyInfoForPDF()

    // Generate PDF with actual data
    const pdfBytes = await generatePDF({
      clientName: quote.clientName,
      projectInfo: quote.projectInfo,
      positions: [], // No positions in current schema
      total: 0, // No total in current schema
      quoteNumber: quote.id,
      company: companyInfo
    })

    await prisma.$disconnect()

    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="angebot_${id}.pdf"`,
        'Cache-Control': 'no-store'
      }
    })

  } catch (error) {
    console.error('Error generating PDF:', error)
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    )
  }
}
