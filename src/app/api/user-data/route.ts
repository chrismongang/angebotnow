import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getUserDataFromDB, saveUserDataToDB, type UserData } from '@/lib/user-data'

export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userData = await getUserDataFromDB(session.user.id)
    
    return NextResponse.json(userData)
  } catch (error) {
    console.error('Error fetching user data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user data' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userData: UserData = await request.json()
    
    await saveUserDataToDB(session.user.id, userData)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error saving user data:', error)
    return NextResponse.json(
      { error: 'Failed to save user data' },
      { status: 500 }
    )
  }
}
