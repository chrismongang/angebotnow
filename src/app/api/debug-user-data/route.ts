import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getUserDataFromDB } from '@/lib/user-data'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user data from database
    const userData = await getUserDataFromDB(session.user.id)
    
    // Also get the raw user record from database
    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()
    
    const rawUser = await prisma.user.findUnique({
      where: { id: session.user.id }
    })
    
    await prisma.$disconnect()
    
    return NextResponse.json({
      session: {
        userId: session.user.id,
        email: session.user.email,
        name: session.user.name
      },
      userData: userData,
      rawUser: rawUser,
      companyInfo: {
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
    })
  } catch (error) {
    console.error('Error in debug route:', error)
    return NextResponse.json(
      { error: 'Failed to fetch debug data', details: error },
      { status: 500 }
    )
  }
}
