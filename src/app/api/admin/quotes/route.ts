export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { isAdmin } = await requireAdmin()
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q')?.trim() || ''
    const status = searchParams.get('status') || undefined
    const take = Math.min(parseInt(searchParams.get('take') || '50', 10), 200)
    const page = Math.max(parseInt(searchParams.get('page') || '1', 10), 1)
    const from = searchParams.get('from')
    const to = searchParams.get('to')

    const where: any = {}
    if (status) where.status = status
    if (q) {
      where.OR = [
        { clientName: { contains: q, mode: 'insensitive' } },
        { projectInfo: { contains: q, mode: 'insensitive' } },
        { quoteNumber: { contains: q, mode: 'insensitive' } },
      ]
    }
    if (from || to) {
      where.createdAt = {
        ...(from ? { gte: new Date(from) } : {}),
        ...(to ? { lte: new Date(to) } : {}),
      }
    }

    const total = await prisma.quote.count({ where })

    const quotes = await prisma.quote.findMany({
      where,
      include: {
        user: { select: { id: true, email: true, name: true, firstName: true, lastName: true } }
      },
      orderBy: { createdAt: 'desc' },
      take,
      skip: (page - 1) * take,
    })

    const pageCount = Math.ceil(total / take)
    return NextResponse.json({ items: quotes, total, page, pageCount })
  } catch (error) {
    console.error('Error fetching quotes:', error)
    return NextResponse.json({ error: 'Failed to fetch quotes' }, { status: 500 })
  }
}


