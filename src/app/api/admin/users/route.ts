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
    const tier = searchParams.get('tier') || undefined
    const take = Math.min(parseInt(searchParams.get('take') || '50', 10), 200)
    const page = Math.max(parseInt(searchParams.get('page') || '1', 10), 1)

    const where: any = {}
    if (tier) where.subscriptionTier = tier as any
    if (q) {
      where.OR = [
        { email: { contains: q, mode: 'insensitive' } },
        { name: { contains: q, mode: 'insensitive' } },
        { firstName: { contains: q, mode: 'insensitive' } },
        { lastName: { contains: q, mode: 'insensitive' } },
      ]
    }

    const total = await prisma.user.count({ where })

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true, email: true, name: true, firstName: true, lastName: true,
        createdAt: true, subscriptionStatus: true, subscriptionTier: true,
        lastPaymentDate: true, referralCount: true, quotes: { select: { id: true }, take: 1 }
      },
      orderBy: { createdAt: 'desc' },
      take,
      skip: (page - 1) * take,
    })

    const pageCount = Math.ceil(total / take)
    return NextResponse.json({ items: users, total, page, pageCount })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}


