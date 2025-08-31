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

    // Get or create Stripe customer
    let customerId = (session.user as ExtendedUser).stripeCustomerId;
    if (!customerId) {
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
    }

    // Create checkout session for Pro subscription
    const checkoutSession = await stripe.checkout.sessions.create({
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

    // Quotes-Anzahl für Loops Event ermitteln
    const quotesCount = await prisma.quote.count({
      where: { userId: session.user.id }
    });

    // Loops Event: checkout_started
    await trackEvent(session.user.email!, 'checkout_started', {
      userId: session.user.id,
      plan: 'free',
      quotesCount: quotesCount,
      createdAt: new Date().toISOString(),
      checkoutSessionId: checkoutSession.id,
      amount: checkoutSession.amount_total,
      currency: checkoutSession.currency
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json({ 
      error: 'Checkout failed', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
