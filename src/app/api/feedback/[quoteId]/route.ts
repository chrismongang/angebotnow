export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { emailService } from '@/lib/email'
import { z } from 'zod'

// Schema für Feedback-Validierung
const feedbackSchema = z.object({
  rating: z.enum(['UP', 'DOWN', 'NEUTRAL']),
  text: z.string().max(1000).optional(),
})

// GET: Feedback für ein spezifisches Angebot abrufen
export async function GET(
  request: NextRequest,
  { params }: { params: { quoteId: string } }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { quoteId } = params

    // Prüfen ob das Angebot existiert und dem User gehört
    const quote = await prisma.quote.findFirst({
      where: {
        id: quoteId,
        userId: session.user.id
      }
    })

    if (!quote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 })
    }

    // Feedback für dieses Angebot abrufen
    const feedback = await prisma.feedback.findUnique({
      where: {
        userId_quoteId: {
          userId: session.user.id,
          quoteId: quoteId
        }
      },
      include: {
        quote: {
          select: {
            id: true,
            clientName: true,
            projectInfo: true,
            quoteNumber: true
          }
        }
      }
    })

    return NextResponse.json(feedback)
  } catch (error) {
    console.error('Error fetching feedback:', error)
    return NextResponse.json({ error: 'Failed to fetch feedback' }, { status: 500 })
  }
}

// POST/PUT: Feedback erstellen oder aktualisieren
export async function POST(
  request: NextRequest,
  { params }: { params: { quoteId: string } }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { quoteId } = params
    const body = await request.json()

    // Validierung
    const validatedData = feedbackSchema.parse(body)

    // Prüfen ob das Angebot existiert und dem User gehört
    const quote = await prisma.quote.findFirst({
      where: {
        id: quoteId,
        userId: session.user.id
      }
    })

    if (!quote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 })
    }

    // Vorhandenes Feedback prüfen, um Lock-Regel zu erzwingen
    const existing = await prisma.feedback.findUnique({
      where: {
        userId_quoteId: {
          userId: session.user.id,
          quoteId: quoteId
        }
      }
    })

    // Wenn bereits ein Text gespeichert wurde, sind weitere Änderungen gesperrt
    if (existing?.text) {
      return NextResponse.json({ error: 'Feedback is locked and cannot be changed' }, { status: 403 })
    }

    // Erlaubt: Erstbewertung (nur rating) oder Aktualisierung dieser Bewertung mit Text (einmalig)
    const feedback = await prisma.feedback.upsert({
      where: {
        userId_quoteId: {
          userId: session.user.id,
          quoteId: quoteId
        }
      },
      update: {
        // Update ist nur erlaubt solange kein Text existiert
        rating: validatedData.rating,
        text: validatedData.text || null,
        updatedAt: new Date()
      },
      create: {
        userId: session.user.id,
        quoteId: quoteId,
        rating: validatedData.rating,
        text: validatedData.text || null,
        status: 'NEW'
      },
      include: {
        quote: {
          select: {
            id: true,
            clientName: true,
            projectInfo: true,
            quoteNumber: true
          }
        }
      }
    })

    // Feedback-Email an Admin/Owner nur versenden, wenn Text vorhanden ist
    try {
      const hasText = typeof feedback.text === 'string' && feedback.text.trim().length > 0
      if (hasText) {
        const adminEmail = process.env.ADMIN_EMAIL || process.env.FEEDBACK_EMAIL || 'info@angebotnow.de'
        if (adminEmail) {
          await emailService.sendFeedbackSummaryEmail({
            recipientEmail: adminEmail,
            userEmail: session.user.email || 'unknown@user',
            userName: session.user.name || null,
            quoteId: feedback.quote.id,
            quoteNumber: feedback.quote.quoteNumber || null,
            clientName: feedback.quote.clientName || null,
            projectInfo: feedback.quote.projectInfo || null,
            rating: feedback.rating as 'UP' | 'DOWN' | 'NEUTRAL',
            text: feedback.text || null,
          })
        }
      }
    } catch (mailError) {
      console.error('Failed to send feedback summary email:', mailError)
      // Nicht blockierend
    }

    return NextResponse.json({
      success: true,
      feedback
    })
  } catch (error) {
    console.error('Error creating/updating feedback:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Invalid input', 
        details: error.errors 
      }, { status: 400 })
    }
    
    return NextResponse.json({ error: 'Failed to save feedback' }, { status: 500 })
  }
}

// DELETE: Feedback löschen
export async function DELETE(
  request: NextRequest,
  { params }: { params: { quoteId: string } }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { quoteId } = params

    // Prüfen ob das Angebot dem User gehört
    const quote = await prisma.quote.findFirst({
      where: {
        id: quoteId,
        userId: session.user.id
      }
    })

    if (!quote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 })
    }

    // Lock-Regel: Wenn bereits Text vorhanden ist, kein Löschen mehr erlauben
    const existing = await prisma.feedback.findUnique({
      where: {
        userId_quoteId: {
          userId: session.user.id,
          quoteId: quoteId
        }
      }
    })

    if (existing?.text) {
      return NextResponse.json({ error: 'Feedback is locked and cannot be deleted' }, { status: 403 })
    }

    // Feedback löschen (nur möglich, solange kein Text gespeichert ist)
    await prisma.feedback.deleteMany({
      where: {
        userId: session.user.id,
        quoteId: quoteId
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting feedback:', error)
    return NextResponse.json({ error: 'Failed to delete feedback' }, { status: 500 })
  }
}
