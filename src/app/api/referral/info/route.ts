import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { ReferralSystem } from '@/lib/referral';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Hole Referral-Informationen des Users
    let user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        referralCode: true,
        referralCredits: true,
        referralCount: true,
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Stelle sicher, dass der User einen Referral-Code hat
    let referralCode = user.referralCode;
    if (!referralCode) {
      referralCode = await ReferralSystem.createReferralCode(session.user.id);
    }

    return NextResponse.json({
      referralCode: referralCode,
      referralCredits: user.referralCredits || 0,
      referralCount: user.referralCount || 0,
    });
  } catch (error) {
    console.error('Error fetching referral info:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch referral info',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
