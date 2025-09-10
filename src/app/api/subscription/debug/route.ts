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
        subscriptionEndDate: true,
        lastPaymentDate: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    let stripeData = null;
    if (user.stripeCustomerId) {
      try {
        // Get customer from Stripe
        const customer = await stripe.customers.retrieve(user.stripeCustomerId);
        
        // Get active subscriptions
        const subscriptions = await stripe.subscriptions.list({
          customer: user.stripeCustomerId,
          limit: 10
        });

        stripeData = {
          customer: {
            id: customer.id,
            email: customer.email,
            created: customer.created,
            metadata: customer.metadata,
          },
          subscriptions: subscriptions.data.map(sub => ({
            id: sub.id,
            status: sub.status,
            current_period_start: new Date(sub.current_period_start * 1000).toISOString(),
            current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
            created: new Date(sub.created * 1000).toISOString(),
            items: sub.items.data.map(item => ({
              price_id: item.price.id,
              quantity: item.quantity,
            }))
          }))
        };
      } catch (stripeError) {
        stripeData = { error: 'Failed to fetch Stripe data', details: stripeError };
      }
    }

    return NextResponse.json({
      user: {
        ...user,
        subscriptionEndDate: user.subscriptionEndDate?.toISOString() || null,
        lastPaymentDate: user.lastPaymentDate?.toISOString() || null,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      },
      stripe: stripeData
    });
  } catch (error) {
    console.error('Debug error:', error);
    return NextResponse.json({ 
      error: 'Debug failed', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
