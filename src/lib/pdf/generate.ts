import PDFDocument from 'pdfkit'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { AIResponse } from '@/lib/ai/mock'

interface GeneratePDFInput {
  quoteId: string
  clientName: string
  projectInfo: string
  aiData: AIResponse
}

export async function generatePDF(input: GeneratePDFInput): Promise<{
  success: boolean
  pdfPath?: string
  error?: string
}> {
  try {
    // Create PDFs directory if it doesn't exist
    const pdfsDir = join(process.cwd(), 'pdfs')
    await mkdir(pdfsDir, { recursive: true })

    const pdfPath = `${input.quoteId}-angebot.pdf`
    const fullPath = join(pdfsDir, pdfPath)

    // Create PDF document
    const doc = new PDFDocument({
      size: 'A4',
      margin: 50,
    })

    // Pipe to file
    const stream = doc.pipe(require('fs').createWriteStream(fullPath))

    // Add header
    doc
      .fontSize(24)
      .font('Helvetica-Bold')
      .text('AngebotNow', { align: 'center' })
      .moveDown(0.5)

    doc
      .fontSize(12)
      .font('Helvetica')
      .text('KI-gestützte Angebotserstellung', { align: 'center' })
      .moveDown(2)

    // Add client information
    doc
      .fontSize(16)
      .font('Helvetica-Bold')
      .text('Auftraggeber')
      .moveDown(0.5)

    doc
      .fontSize(12)
      .font('Helvetica')
      .text(`Name: ${input.clientName}`)
      .moveDown(0.5)
      .text(`Datum: ${new Date().toLocaleDateString('de-DE')}`)
      .moveDown(2)

    // Add project information
    doc
      .fontSize(16)
      .font('Helvetica-Bold')
      .text('Projektbeschreibung')
      .moveDown(0.5)

    doc
      .fontSize(12)
      .font('Helvetica')
      .text(input.projectInfo, { width: 500 })
      .moveDown(2)

    // Add positions table
    doc
      .fontSize(16)
      .font('Helvetica-Bold')
      .text('Positionen')
      .moveDown(1)

    // Table header
    const tableTop = doc.y
    const tableLeft = 50
    const colWidths = [250, 60, 60, 80, 80]

    // Draw table header
    doc
      .fontSize(10)
      .font('Helvetica-Bold')
      .text('Beschreibung', tableLeft, tableTop)
      .text('Menge', tableLeft + colWidths[0], tableTop)
      .text('Einheit', tableLeft + colWidths[0] + colWidths[1], tableTop)
      .text('E-Preis', tableLeft + colWidths[0] + colWidths[1] + colWidths[2], tableTop)
      .text('Gesamt', tableLeft + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3], tableTop)

    // Draw table rows
    let currentY = tableTop + 20
    doc.fontSize(10).font('Helvetica')

    input.aiData.positions.forEach((position) => {
      doc
        .text(position.description, tableLeft, currentY, { width: colWidths[0] })
        .text(position.quantity.toString(), tableLeft + colWidths[0], currentY)
        .text(position.unit, tableLeft + colWidths[0] + colWidths[1], currentY)
        .text(position.unitPrice.toFixed(2) + ' €', tableLeft + colWidths[0] + colWidths[1] + colWidths[2], currentY)
        .text(position.totalPrice.toFixed(2) + ' €', tableLeft + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3], currentY)

      currentY += 20
    })

    // Draw table borders
    doc
      .moveTo(tableLeft, tableTop)
      .lineTo(tableLeft + colWidths.reduce((a, b) => a + b, 0), tableTop)
      .stroke()

    doc
      .moveTo(tableLeft, tableTop + 20)
      .lineTo(tableLeft + colWidths.reduce((a, b) => a + b, 0), tableTop + 20)
      .stroke()

    // Add summary
    doc.moveDown(2)
    const summaryY = doc.y

    doc
      .fontSize(12)
      .font('Helvetica-Bold')
      .text('Zusammenfassung', 350, summaryY)
      .moveDown(0.5)

    doc
      .fontSize(10)
      .font('Helvetica')
      .text(`Zwischensumme: ${input.aiData.summary.subtotal.toFixed(2)} €`, 350)
      .text(`MwSt. (19%): ${input.aiData.summary.tax.toFixed(2)} €`)
      .moveDown(0.5)

    doc
      .fontSize(12)
      .font('Helvetica-Bold')
      .text(`Gesamtbetrag: ${input.aiData.summary.total.toFixed(2)} €`)
      .moveDown(2)

    // Add notes
    doc
      .fontSize(10)
      .font('Helvetica')
      .text('Anmerkungen:', 50)
      .moveDown(0.5)
      .text(input.aiData.notes, { width: 500 })

    // Add footer
    doc
      .fontSize(8)
      .font('Helvetica')
      .text('Erstellt mit AngebotNow - KI-gestützte Angebotserstellung', 50, 750, { align: 'center' })

    // Finalize PDF
    doc.end()

    return new Promise((resolve) => {
      stream.on('finish', () => {
        resolve({
          success: true,
          pdfPath,
        })
      })

      stream.on('error', (error) => {
        console.error('PDF generation error:', error)
        resolve({
          success: false,
          error: 'PDF-Generierung fehlgeschlagen',
        })
      })
    })

  } catch (error) {
    console.error('PDF generation error:', error)
    return {
      success: false,
      error: 'PDF-Generierung fehlgeschlagen',
    }
  }
}
