import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        stripeCustomerId: true,
        subscriptionStatus: true,
        subscriptionTier: true,
        subscriptionId: true,
      }
    });

    if (!user || !user.stripeCustomerId) {
      return NextResponse.json({ 
        error: 'No Stripe customer found',
        details: 'User has no associated Stripe customer'
      }, { status: 404 });
    }

    // Get active subscriptions from Stripe
    const subscriptions = await stripe.subscriptions.list({
      customer: user.stripeCustomerId,
      status: 'active',
      limit: 1
    });

    let updatedUser = user;
    
    if (subscriptions.data.length > 0) {
      const activeSubscription = subscriptions.data[0];
      
      // Update user subscription status
      const endDate = (activeSubscription as any).current_period_end 
        ? new Date((activeSubscription as any).current_period_end * 1000)
        : null;
        
      updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          subscriptionStatus: 'ACTIVE',
          subscriptionTier: 'PRO',
          subscriptionId: activeSubscription.id,
          subscriptionEndDate: endDate,
          lastPaymentDate: new Date(),
        }
      });

      return NextResponse.json({
        success: true,
        message: 'Subscription status synchronized with Stripe',
        subscription: {
          status: 'ACTIVE',
          tier: 'PRO',
          id: activeSubscription.id,
          endDate: endDate ? endDate.toISOString() : null,
        }
      });
    } else {
      // No active subscription found, set to FREE
      updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          subscriptionStatus: 'FREE',
          subscriptionTier: 'FREE',
          subscriptionId: null,
          subscriptionEndDate: null,
        }
      });

      return NextResponse.json({
        success: true,
        message: 'No active subscription found, status set to FREE',
        subscription: {
          status: 'FREE',
          tier: 'FREE',
          id: null,
          endDate: null,
        }
      });
    }
  } catch (error) {
    console.error('Subscription sync error:', error);
    return NextResponse.json({ 
      error: 'Sync failed', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  return GET(request);
}
