export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextRequest, NextResponse } from 'next/server'
import { generatePDF } from '@/lib/pdf/generate'
import { generateQuoteFileName } from '@/lib/user-data'
import { auth } from '@/lib/auth'
import { getUserDataFromDB } from '@/lib/user-data'
import { trackEvent, updateUserProperties } from '@/lib/loops'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    console.log('PDF Generation started for quote ID:', id)

    // Check if database is available
    if (!process.env.DATABASE_URL) {
      console.log('Running in demo mode (no database)')
      // Demo mode - generate PDF with mock data
      const mockQuote = {
        id,
        clientName: 'Demo Kunde',
        projectInfo: 'Demo Projekt - Bitte konfigurieren Sie Ihre Daten in den Einstellungen',
        positions: [
          { title: 'Demo Position', description: 'Demo Beschreibung', qty: 1, unit: 'Psch', price: 100 }
        ],
        total: 100,
        quoteNumber: 'AN20250001',
        clientStreet: 'Musterstraße 123',
        clientCity: '90475 Nürnberg'
      }

      // Use default company info for demo mode
      const companyInfo = {
        name: 'Inatros GmbH',
        address: 'Musterstraße 123\n90475 Nürnberg',
        email: 'info@inatros.de',
        phone: '+49 911 123456',
        taxNumber: 'DE123456789',
        vatNumber: 'DE123456789',
        bankName: 'Musterbank AG',
        bankAccount: 'DE89 3704 0044 0532 0130 00',
        bankBic: 'COBADEFFXXX'
      }
      
      console.log('Using demo company info:', companyInfo)
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

    console.log('Running in database mode')
    // Database mode - fetch actual quote data
    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()

    const quote = await prisma.quote.findUnique({
      where: { id },
      include: { user: true }
    })

    if (!quote) {
      console.log('Quote not found:', id)
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 })
    }

    console.log('Found quote:', { id: quote.id, clientName: quote.clientName, userId: quote.userId })

    // Get company info from user data in database
    let companyInfo: {
      name: string;
      address: string;
      email: string;
      phone: string;
      taxNumber: string;
      vatNumber: string;
      taxOffice: string;
      bankName: string;
      bankAccount: string;
      bankBic: string;
      logo?: string;
    } = {
      name: 'Inatros GmbH',
      address: 'Musterstraße 123\n90475 Nürnberg',
      email: 'info@inatros.de',
      phone: '+49 911 123456',
      taxNumber: 'DE123456789',
      vatNumber: 'DE123456789',
      taxOffice: 'Finanzamt Nürnberg',
      bankName: 'Musterbank AG',
      bankAccount: 'DE89 3704 0044 0532 0130 00',
      bankBic: 'COBADEFFXXX',
      logo: undefined
    }

    let offerValidityDays = 30; // Default value

    try {
      console.log('Fetching user data for userId:', quote.userId)
      // Try to get user data from database
      const userData = await getUserDataFromDB(quote.userId)
      console.log('User data fetched:', {
        companyName: userData.companyName,
        street: userData.street,
        city: userData.city,
        email: userData.email,
        phone: userData.phone,
        offerValidityDays: userData.offerValidityDays
      })
      
      companyInfo = {
        name: userData.companyName,
        address: `${userData.street}\n${userData.city}`,
        email: userData.email,
        phone: userData.phone,
        taxNumber: userData.taxNumber,
        vatNumber: userData.vatNumber,
        taxOffice: userData.taxOffice,
        bankName: userData.bankName,
        bankAccount: userData.bankAccount,
        bankBic: userData.bankBic,
        logo: userData.companyLogo
      }

      offerValidityDays = userData.offerValidityDays || 30
      
      console.log('Company info for PDF:', companyInfo)
    } catch (error) {
      console.error('Error fetching user data for PDF:', error)
      // Use default company info if user data fetch fails
    }

    // Parse AI data if available
    let positions: Array<{ title: string; description: string; qty: number; unit: string; price: number }> = [];
    let total = 0;
    let description = quote.projectInfo;

    const aiData = quote.aiData as any;
    if (aiData && typeof aiData === 'object') {
      if (aiData.positions && Array.isArray(aiData.positions)) {
        // Handle both old and new format for backward compatibility
        positions = aiData.positions.map((pos: any) => ({
          title: pos.title || 'Arbeitsleistung',
          description: pos.description || pos.title || 'Allgemeine Arbeitsleistung nach Vereinbarung',
          qty: pos.qty || 1,
          unit: pos.unit || 'Psch',
          price: pos.price || 0
        }));
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

    console.log('Generating PDF with data:', {
      clientName: quote.clientName,
      quoteNumber,
      companyName: companyInfo.name,
      companyAddress: companyInfo.address
    })

    // Generate PDF with actual data
    const pdfBytes = await generatePDF({
      clientName: quote.clientName,
      projectInfo: description,
      positions: positions,
      total: total,
      quoteNumber: quoteNumber,
      clientStreet: quote.clientStreet || undefined,
      clientCity: quote.clientCity || undefined,
      bauvorhaben: (quote as any).bauvorhaben || undefined,
      offerValidityDays: offerValidityDays,
      company: companyInfo,
      userSubscriptionTier: quote.user.subscriptionTier
    })

    // Prüfen ob es die erste PDF für diesen User ist
    const userQuotesWithPDF = await prisma.quote.count({
      where: { 
        userId: quote.user.id,
        status: 'COMPLETED' // Annahme: PDF wird nur bei abgeschlossenen Quotes generiert
      }
    })

    if (userQuotesWithPDF === 1) {
      // Loops Event: activated_first_pdf
      await trackEvent(quote.user.email, 'activated_first_pdf', {
        userId: quote.user.id,
        quoteId: quote.id,
        plan: quote.user.subscriptionTier.toLowerCase(),
        quotesCount: userQuotesWithPDF,
        createdAt: new Date().toISOString(),
        projectType: description,
        clientName: quote.clientName
      })

      // User Properties aktualisieren
      await updateUserProperties(quote.user.email, {
        firstPdfCreated: true,
        firstPdfDate: new Date().toISOString(),
        quotesCount: userQuotesWithPDF
      })
    }

    await prisma.$disconnect()
    console.log('PDF generated successfully')

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
