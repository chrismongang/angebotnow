import { NextRequest, NextResponse } from 'next/server'
import { generatePDF } from '@/lib/pdf/generate'
import { generateQuoteFileName } from '@/lib/user-data'

export async function GET(request: NextRequest) {
  try {
    console.log('=== PDF Test Route Started ===')
    
    // Test with hardcoded data to isolate the issue
    const testQuote = {
      clientName: 'Test Kunde',
      projectInfo: 'Test Projekt - PDF Generierung Test',
      positions: [
        { title: 'Test Position 1', qty: 2, unit: 'Stk', price: 150 },
        { title: 'Test Position 2', qty: 1, unit: 'Std', price: 80 }
      ],
      total: 380,
      quoteNumber: 'TEST001',
      clientStreet: 'Teststraße 123',
      clientCity: '12345 Teststadt'
    }

    // Test with different company data scenarios
    const testScenarios = [
      {
        name: 'Scenario 1: Default Data',
        companyInfo: {
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
      },
      {
        name: 'Scenario 2: Custom Data',
        companyInfo: {
          name: 'Meine Firma GmbH',
          address: 'Hauptstraße 456\n10115 Berlin',
          email: 'kontakt@meinefirma.de',
          phone: '+49 30 12345678',
          taxNumber: 'DE987654321',
          vatNumber: 'DE987654321',
          bankName: 'Sparkasse Berlin',
          bankAccount: 'DE12 1005 0000 0123 4567 89',
          bankBic: 'BELADEBEXXX'
        }
      },
      {
        name: 'Scenario 3: Empty Data (should use defaults)',
        companyInfo: {
          name: '',
          address: '',
          email: '',
          phone: '',
          taxNumber: '',
          vatNumber: '',
          bankName: '',
          bankAccount: '',
          bankBic: ''
        }
      }
    ]

    // Test each scenario
    const results = []
    
    for (const scenario of testScenarios) {
      console.log(`Testing ${scenario.name}:`, scenario.companyInfo)
      
      try {
        const fileName = generateQuoteFileName(testQuote.clientName, testQuote.quoteNumber)
        
        const pdfBytes = await generatePDF({
          clientName: testQuote.clientName,
          projectInfo: testQuote.projectInfo,
          positions: testQuote.positions,
          total: testQuote.total,
          quoteNumber: testQuote.quoteNumber,
          clientStreet: testQuote.clientStreet,
          clientCity: testQuote.clientCity,
          company: scenario.companyInfo
        })

        results.push({
          scenario: scenario.name,
          success: true,
          fileName: fileName,
          pdfSize: pdfBytes.length,
          companyInfo: scenario.companyInfo
        })
        
        console.log(`✅ ${scenario.name} - PDF generated successfully (${pdfBytes.length} bytes)`)
      } catch (error) {
        console.error(`❌ ${scenario.name} - PDF generation failed:`, error)
        results.push({
          scenario: scenario.name,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    console.log('=== PDF Test Route Completed ===')
    
    return NextResponse.json({
      success: true,
      message: 'PDF test completed',
      results: results,
      testQuote: testQuote
    })

  } catch (error) {
    console.error('Error in PDF test route:', error)
    return NextResponse.json(
      { 
        error: 'PDF test failed', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
