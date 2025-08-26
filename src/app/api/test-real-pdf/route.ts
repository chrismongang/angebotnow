import { NextRequest, NextResponse } from 'next/server'
import { generatePDF } from '@/lib/pdf/generate'
import { generateQuoteFileName } from '@/lib/user-data'
import { auth } from '@/lib/auth'
import { getUserDataFromDB } from '@/lib/user-data'

export async function GET(request: NextRequest) {
  try {
    console.log('=== Real PDF Test Route Started ===')
    
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ 
        error: 'Unauthorized',
        message: 'Bitte melden Sie sich an, um die PDF-Generierung zu testen'
      }, { status: 401 })
    }

    console.log('User authenticated:', session.user.id)

    // Get user data from database
    const userData = await getUserDataFromDB(session.user.id)
    console.log('User data loaded:', {
      companyName: userData.companyName,
      street: userData.street,
      city: userData.city,
      email: userData.email,
      phone: userData.phone
    })

    // Create company info for PDF
    const companyInfo = {
      name: userData.companyName,
      address: `${userData.street}\n${userData.city}`,
      email: userData.email,
      phone: userData.phone,
      taxNumber: userData.taxNumber,
      vatNumber: userData.vatNumber,
      bankName: userData.bankName,
      bankAccount: userData.bankAccount,
      bankBic: userData.bankBic
    }

    console.log('Company info for PDF:', companyInfo)

    // Test quote data
    const testQuote = {
      clientName: 'Test Kunde - Echte Daten',
      projectInfo: 'Test Projekt mit echten Firmendaten aus der Datenbank',
      positions: [
        { title: 'Beratung und Planung', qty: 2, unit: 'Std', price: 120 },
        { title: 'Material und Ausführung', qty: 1, unit: 'Psch', price: 500 }
      ],
      total: 740,
      quoteNumber: 'REAL001',
      clientStreet: 'Kundenstraße 789',
      clientCity: '54321 Kundenstadt'
    }

    const fileName = generateQuoteFileName(testQuote.clientName, testQuote.quoteNumber)
    
    console.log('Generating PDF with real user data...')
    
    const pdfBytes = await generatePDF({
      clientName: testQuote.clientName,
      projectInfo: testQuote.projectInfo,
      positions: testQuote.positions,
      total: testQuote.total,
      quoteNumber: testQuote.quoteNumber,
      clientStreet: testQuote.clientStreet,
      clientCity: testQuote.clientCity,
      company: companyInfo
    })

    console.log('PDF generated successfully:', pdfBytes.length, 'bytes')

    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Cache-Control': 'no-store'
      }
    })

  } catch (error) {
    console.error('Error in real PDF test route:', error)
    return NextResponse.json(
      { 
        error: 'Real PDF test failed', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
