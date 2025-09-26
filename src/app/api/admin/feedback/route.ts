export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { prisma } from '@/lib/db'
import { z } from 'zod'

// Schema für Admin-Feedback-Updates
const adminUpdateSchema = z.object({
  status: z.enum(['NEW', 'TRIAGED', 'IN_PROGRESS', 'RESOLVED', 'IGNORED']).optional(),
  tags: z.array(z.string()).optional(),
  adminNotes: z.string().max(1000).optional(),
})

// GET: Alle Feedbacks für Admin-Übersicht
export async function GET(request: NextRequest) {
  try {
    const { isAdmin } = await requireAdmin()
    
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || undefined
    const quoteId = searchParams.get('quoteId') || undefined
    const rating = searchParams.get('rating') as 'UP' | 'DOWN' | 'NEUTRAL' | undefined
    const status = searchParams.get('status') as 'NEW' | 'TRIAGED' | 'IN_PROGRESS' | 'RESOLVED' | 'IGNORED' | undefined
    const take = Math.min(parseInt(searchParams.get('take') || '50', 10), 200)
    const page = Math.max(parseInt(searchParams.get('page') || '1', 10), 1)

    const total = await prisma.feedback.count({
      where: {
        ...(userId ? { userId } : {}),
        ...(quoteId ? { quoteId } : {}),
        ...(rating ? { rating } : {}),
        ...(status ? { status } : {}),
      }
    })

    const feedbacks = await prisma.feedback.findMany({
      where: {
        ...(userId ? { userId } : {}),
        ...(quoteId ? { quoteId } : {}),
        ...(rating ? { rating } : {}),
        ...(status ? { status } : {}),
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            firstName: true,
            lastName: true
          }
        },
        quote: {
          select: {
            id: true,
            clientName: true,
            projectInfo: true,
            quoteNumber: true,
            createdAt: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take,
      skip: (page - 1) * take,
    })

    const pageCount = Math.ceil(total / take)
    return NextResponse.json({ items: feedbacks, total, page, pageCount })
  } catch (error) {
    console.error('Error fetching admin feedback:', error)
    return NextResponse.json({ error: 'Failed to fetch feedback' }, { status: 500 })
  }
}

// PATCH: Feedback-Status, Tags oder Admin-Notizen aktualisieren
export async function PATCH(request: NextRequest) {
  try {
    const { isAdmin } = await requireAdmin()
    
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { feedbackId, ...updateData } = body

    if (!feedbackId) {
      return NextResponse.json({ error: 'Feedback ID required' }, { status: 400 })
    }

    // Validierung
    const validatedData = adminUpdateSchema.parse(updateData)

    // Feedback aktualisieren
    const feedback = await prisma.feedback.update({
      where: { id: feedbackId },
      data: {
        ...validatedData,
        updatedAt: new Date()
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            firstName: true,
            lastName: true
          }
        },
        quote: {
          select: {
            id: true,
            clientName: true,
            projectInfo: true,
            quoteNumber: true,
            createdAt: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      feedback
    })
  } catch (error) {
    console.error('Error updating feedback:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Invalid input', 
        details: error.errors 
      }, { status: 400 })
    }
    
    return NextResponse.json({ error: 'Failed to update feedback' }, { status: 500 })
  }
}
