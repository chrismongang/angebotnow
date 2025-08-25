import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { generatePDF } from '@/lib/pdf/generate';
import { AIResult } from '@/lib/ai/provider';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const quote = await prisma.quote.findUnique({
      where: { id },
    });

    if (!quote) {
      return NextResponse.json({ error: 'Angebot nicht gefunden' }, { status: 404 });
    }

    // Convert AI data to positions format
    let positions: Array<{ title: string; qty: number; unit: string; price: number }> = [];
    let total = 0;

    if (quote.aiData) {
      const aiData = quote.aiData as AIResult;
      positions = aiData.positions || [];
      total = aiData.total || 0;
    }

    // Generate PDF
    const pdfBytes = await generatePDF({
      clientName: quote.clientName,
      projectInfo: quote.projectInfo,
      positions,
      total,
      quoteNumber: quote.id,
      company: {
        name: 'AngebotNow GmbH',
        address: 'Musterstraße 123, 12345 Musterstadt',
        email: 'info@angebotnow.de',
        phone: '+49 123 456789',
      },
    });

    // Return PDF as download
    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="angebot_${quote.id}.pdf"`,
        'Cache-Control': 'no-store',
      },
    });

  } catch (error) {
    console.error('PDF generation error:', error);
    return NextResponse.json(
      { error: 'PDF-Generierung fehlgeschlagen' },
      { status: 500 }
    );
  }
}
