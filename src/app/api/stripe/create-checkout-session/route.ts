import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { trackEvent } from '@/lib/loops';

// Extended user type with subscription fields
type ExtendedUser = {
  id: string;
  email: string;
  stripeCustomerId?: string;
};

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Validate required environment variables
    if (!process.env.STRIPE_PRO_PRICE_ID) {
      console.error('STRIPE_PRO_PRICE_ID environment variable is not set');
      return NextResponse.json({ 
        error: 'Payment configuration error', 
        details: 'Service temporarily unavailable' 
      }, { status: 500 });
    }

    if (!process.env.NEXTAUTH_URL) {
      console.error('NEXTAUTH_URL environment variable is not set');
      return NextResponse.json({ 
        error: 'Configuration error', 
        details: 'Service temporarily unavailable' 
      }, { status: 500 });
    }

    // Get or create Stripe customer
    let customerId = (session.user as ExtendedUser).stripeCustomerId;
    if (!customerId) {
      try {
        const customer = await stripe.customers.create({
          email: session.user.email!,
          metadata: { userId: session.user.id }
        });
        customerId = customer.id;
        
        // Update user with Stripe customer ID
        await prisma.user.update({
          where: { id: session.user.id },
          data: { stripeCustomerId: customerId }
        });
      } catch (stripeError) {
        console.error('Failed to create Stripe customer:', stripeError);
        return NextResponse.json({ 
          error: 'Payment service error', 
          details: 'Failed to initialize payment account' 
        }, { status: 500 });
      }
    }

    // Create checkout session for Pro subscription
    let checkoutSession;
    try {
      checkoutSession = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card'],
        line_items: [{
          price: process.env.STRIPE_PRO_PRICE_ID!, // Price ID from Stripe Dashboard
          quantity: 1,
        }],
        mode: 'subscription',
        success_url: `${process.env.NEXTAUTH_URL}/dashboard?success=true`,
        cancel_url: `${process.env.NEXTAUTH_URL}/dashboard?canceled=true`,
        metadata: { userId: session.user.id },
        allow_promotion_codes: true,
        billing_address_collection: 'required',
        customer_update: {
          address: 'auto',
          name: 'auto',
        }
      });
    } catch (stripeError) {
      console.error('Failed to create Stripe checkout session:', stripeError);
      return NextResponse.json({ 
        error: 'Payment service error', 
        details: 'Failed to create checkout session' 
      }, { status: 500 });
    }

    // Quotes-Anzahl für Loops Event ermitteln
    let quotesCount = 0;
    try {
      quotesCount = await prisma.quote.count({
        where: { userId: session.user.id }
      });
    } catch (dbError) {
      console.error('Failed to count quotes:', dbError);
      // Continue without quotes count - not critical for checkout
    }

    // Loops Event: checkout_started (non-critical)
    try {
      await trackEvent(session.user.email!, 'checkout_started', {
        userId: session.user.id,
        plan: 'free',
        quotesCount: quotesCount,
        createdAt: new Date().toISOString(),
        checkoutSessionId: checkoutSession.id,
        amount: checkoutSession.amount_total,
        currency: checkoutSession.currency
      });
    } catch (trackingError) {
      console.error('Failed to track checkout_started event:', trackingError);
      // Continue without tracking - not critical for checkout
    }

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json({ 
      error: 'Checkout failed', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
