import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Check if database is available
    if (!process.env.DATABASE_URL) {
      // Demo mode - return mock data
      const mockQuotes = [
        {
          id: '0123',
          clientName: 'Max Müller',
          projectInfo: 'Badezimmer Sanierung',
          imagePath: '/api/placeholder/150/100',
          createdAt: new Date('2024-08-20')
        },
        {
          id: '0122',
          clientName: 'Anna Schmidt',
          projectInfo: 'Sanierungsarbeiten',
          imagePath: '/api/placeholder/150/100',
          createdAt: new Date('2024-08-17')
        },
        {
          id: '0121',
          clientName: 'Peter Weber',
          projectInfo: 'Badezimmer Sanierung',
          imagePath: '/api/placeholder/150/100',
          createdAt: new Date('2024-08-11')
        },
        {
          id: '0120',
          clientName: 'Maria Fischer',
          projectInfo: 'Wand ausbessern',
          imagePath: '/api/placeholder/150/100',
          createdAt: new Date('2024-07-25')
        },
        {
          id: '0119',
          clientName: 'Thomas Klein',
          projectInfo: 'Sanitärarbeiten',
          imagePath: '/api/placeholder/150/100',
          createdAt: new Date('2024-07-07')
        },
        {
          id: '0118',
          clientName: 'Lisa Wagner',
          projectInfo: 'Fließenlegerarbeit',
          imagePath: '/api/placeholder/150/100',
          createdAt: new Date('2024-06-15')
        }
      ]
      
      return NextResponse.json(mockQuotes)
    }

    // Database mode - fetch actual data
    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()

    const quotes = await prisma.quote.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50, // Limit to recent quotes
      select: {
        id: true,
        clientName: true,
        projectInfo: true,
        imagePath: true,
        createdAt: true
      }
    })

    await prisma.$disconnect()

    return NextResponse.json(quotes)

  } catch (error) {
    console.error('Error fetching quotes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch quotes' },
      { status: 500 }
    )
  }
}
