import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getUserSubscriptionInfo } from '@/lib/subscription';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const subscriptionInfo = await getUserSubscriptionInfo(session.user.id);
    
    return NextResponse.json(subscriptionInfo);
  } catch (error) {
    console.error('Error fetching subscription info:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch subscription info',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
