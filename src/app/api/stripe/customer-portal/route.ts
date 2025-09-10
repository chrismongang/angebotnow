import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's Stripe customer ID
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { stripeCustomerId: true }
    });

    if (!user?.stripeCustomerId) {
      return NextResponse.json({ 
        error: 'No Stripe customer found',
        details: 'Bitte führe zuerst ein Upgrade durch, um dein Abo zu verwalten'
      }, { status: 400 });
    }

    // Create Stripe Customer Portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${process.env.NEXTAUTH_URL}/einstellungen/app`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (error) {
    console.error('Stripe customer portal error:', error);
    
    // Handle specific Stripe errors
    if (error instanceof Error && error.message.includes('No configuration provided')) {
      return NextResponse.json({ 
        error: 'Customer portal not configured',
        details: 'Das Customer Portal ist noch nicht konfiguriert. Bitte kontaktiere den Support.'
      }, { status: 500 });
    }
    
    return NextResponse.json({ 
      error: 'Failed to create customer portal session', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
