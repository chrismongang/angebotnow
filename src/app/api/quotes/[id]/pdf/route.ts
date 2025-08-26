export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextRequest, NextResponse } from 'next/server'
import { generatePDF } from '@/lib/pdf/generate'
import { getCompanyInfoForPDF, generateQuoteFileName } from '@/lib/user-data'

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
        total: 100,
        quoteNumber: 'AN20250001',
        clientStreet: 'Musterstraße 123',
        clientCity: '90475 Nürnberg'
      }

      const companyInfo = getCompanyInfoForPDF()
      const fileName = generateQuoteFileName(mockQuote.clientName, mockQuote.quoteNumber)
      
      const pdfBytes = await generatePDF({
        clientName: mockQuote.clientName,
        projectInfo: mockQuote.projectInfo,
        positions: mockQuote.positions,
        total: mockQuote.total,
        quoteNumber: mockQuote.quoteNumber,
        clientStreet: mockQuote.clientStreet,
        clientCity: mockQuote.clientCity,
        company: companyInfo
      })

      return new NextResponse(Buffer.from(pdfBytes), {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${fileName}"`,
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

    // Parse AI data if available
    let positions: Array<{ title: string; qty: number; unit: string; price: number }> = [];
    let total = 0;
    let description = quote.projectInfo;

    if (quote.aiData && typeof quote.aiData === 'object') {
      const aiData = quote.aiData as any;
      
      if (aiData.positions && Array.isArray(aiData.positions)) {
        positions = aiData.positions;
      }
      
      if (typeof aiData.total === 'number') {
        total = aiData.total;
      }
      
      if (aiData.description && typeof aiData.description === 'string') {
        description = aiData.description;
      }
    }

    // Use structured quote number if available, otherwise fallback to ID
    const quoteNumber = quote.quoteNumber || quote.id
    const fileName = generateQuoteFileName(quote.clientName, quoteNumber)

    // Generate PDF with actual data
    const pdfBytes = await generatePDF({
      clientName: quote.clientName,
      projectInfo: description,
      positions: positions,
      total: total,
      quoteNumber: quoteNumber,
      clientStreet: quote.clientStreet || undefined,
      clientCity: quote.clientCity || undefined,
      company: companyInfo
    })

    await prisma.$disconnect()

    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}"`,
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
