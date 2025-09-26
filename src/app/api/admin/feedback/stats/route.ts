export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { prisma } from '@/lib/db'

// GET: Feedback-Statistiken für Admin-Dashboard
export async function GET() {
  try {
    const { isAdmin } = await requireAdmin()
    
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Gesamtanzahl Feedbacks (IGNORED ausschließen)
    const totalFeedbacks = await prisma.feedback.count({
      where: { status: { not: 'IGNORED' } }
    })

    // Feedbacks nach Rating (IGNORED ausschließen)
    const ratingStats = await prisma.feedback.groupBy({
      by: ['rating'],
      where: { status: { not: 'IGNORED' } },
      _count: { rating: true }
    })

    // Feedbacks nach Status
    const statusStats = await prisma.feedback.groupBy({
      by: ['status'],
      _count: {
        status: true
      }
    })

    // Feedbacks der letzten 7 Tage
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    
    const recentFeedbacks = await prisma.feedback.count({
      where: {
        createdAt: {
          gte: sevenDaysAgo
        }
      }
    })

    // Durchschnittliche Bewertung (UP = 1, NEUTRAL = 0, DOWN = -1),
    // aber IGNORE: Status = IGNORED ausschließen
    const nonIgnoredByRating = await prisma.feedback.groupBy({
      by: ['rating'],
      where: { status: { not: 'IGNORED' } },
      _count: { rating: true }
    })
    const upNI = nonIgnoredByRating.find(r => r.rating === 'UP')?._count.rating || 0
    const downNI = nonIgnoredByRating.find(r => r.rating === 'DOWN')?._count.rating || 0
    const neutralNI = nonIgnoredByRating.find(r => r.rating === 'NEUTRAL')?._count.rating || 0
    const totalNI = upNI + downNI + neutralNI
    const averageRatingScore = totalNI > 0 ? (upNI * 1 + neutralNI * 0 + downNI * -1) / totalNI : 0

    // Top-Tags
    const allFeedbacks = await prisma.feedback.findMany({
      select: {
        tags: true
      }
    })

    const tagCounts: Record<string, number> = {}
    allFeedbacks.forEach(feedback => {
      feedback.tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1
      })
    })

    const topTags = Object.entries(tagCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([tag, count]) => ({ tag, count }))

    // Berechne Zufriedenheitsrate (UP / (UP + DOWN)) — IGNORED ausgeschlossen
    const upCount = ratingStats.find(r => r.rating === 'UP')?._count.rating || 0
    const downCount = ratingStats.find(r => r.rating === 'DOWN')?._count.rating || 0
    const satisfactionRate = upCount + downCount > 0 
      ? Math.round((upCount / (upCount + downCount)) * 100) 
      : 0

    return NextResponse.json({
      total: totalFeedbacks,
      recent: recentFeedbacks,
      satisfactionRate,
      ratingBreakdown: {
        up: ratingStats.find(r => r.rating === 'UP')?._count.rating || 0,
        down: ratingStats.find(r => r.rating === 'DOWN')?._count.rating || 0,
        neutral: ratingStats.find(r => r.rating === 'NEUTRAL')?._count.rating || 0,
      },
      statusBreakdown: statusStats.reduce((acc, stat) => {
        acc[stat.status.toLowerCase()] = stat._count.status
        return acc
      }, {} as Record<string, number>),
      topTags,
      averageRating: averageRatingScore, // -1 bis +1 (IGNORED ausgeschlossen)
      nonIgnoredBreakdown: { up: upNI, down: downNI, neutral: neutralNI, total: totalNI }
    })
  } catch (error) {
    console.error('Error fetching feedback stats:', error)
    return NextResponse.json({ error: 'Failed to fetch feedback stats' }, { status: 500 })
  }
}
