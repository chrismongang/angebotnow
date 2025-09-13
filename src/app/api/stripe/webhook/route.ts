import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { headers } from 'next/headers';
import { prisma } from '@/lib/db';
import { trackEvent, updateUserProperties } from '@/lib/loops';

// Type assertion to fix TypeScript caching issues
const prismaClient = prisma as any;

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature')!;

  // Validate required environment variables
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error('STRIPE_WEBHOOK_SECRET environment variable is not set');
    return NextResponse.json({ 
      error: 'Webhook configuration error', 
      details: 'Service temporarily unavailable' 
    }, { status: 500 });
  }

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    console.log('Stripe webhook event:', event.type);

    switch (event.type) {
      case 'checkout.session.completed':
        const completedSession = event.data.object
        try {
          await handleCheckoutCompleted(completedSession)
        } catch (error) {
          console.error('Error handling checkout completed:', error);
          // Continue processing - don't fail webhook
        }
        break
      
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        const subscription = event.data.object;
        try {
          await updateUserSubscription(subscription);
        } catch (error) {
          console.error('Error updating user subscription:', error);
          // Continue processing - don't fail webhook
        }
        break;
      
      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object;
        try {
          await cancelUserSubscription(deletedSubscription);
        } catch (error) {
          console.error('Error cancelling user subscription:', error);
          // Continue processing - don't fail webhook
        }
        break;

      case 'invoice.payment_failed':
        const failedInvoice = event.data.object;
        try {
          await handlePaymentFailure(failedInvoice);
        } catch (error) {
          console.error('Error handling payment failure:', error);
          // Continue processing - don't fail webhook
        }
        break;

      case 'invoice.payment_succeeded':
        const successfulInvoice = event.data.object;
        try {
          await handlePaymentSuccess(successfulInvoice);
        } catch (error) {
          console.error('Error handling payment success:', error);
          // Continue processing - don't fail webhook
        }
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ 
      error: 'Webhook failed', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 400 });
  }
}

async function updateUserSubscription(subscription: any) {
  const customerId = subscription.customer;
  
  try {
    const user = await prismaClient.user.findFirst({
      where: { stripeCustomerId: customerId }
    });

    if (user) {
      // Map Stripe subscription status to our internal status
      let subscriptionStatus: string;
      let subscriptionTier: string;
      
      switch (subscription.status) {
        case 'active':
          subscriptionStatus = 'ACTIVE';
          subscriptionTier = 'PRO';
          break;
        case 'past_due':
          subscriptionStatus = 'PAST_DUE';
          subscriptionTier = 'PRO';
          break;
        case 'canceled':
        case 'cancelled':
          subscriptionStatus = 'CANCELED';
          subscriptionTier = 'FREE';
          break;
        case 'unpaid':
          subscriptionStatus = 'UNPAID';
          subscriptionTier = 'FREE';
          break;
        default:
          subscriptionStatus = 'FREE';
          subscriptionTier = 'FREE';
      }
      
      await prismaClient.user.update({
        where: { id: user.id },
        data: {
          subscriptionStatus,
          subscriptionTier,
          subscriptionId: subscription.id,
          subscriptionEndDate: subscription.current_period_end ? new Date(subscription.current_period_end * 1000) : null,
          lastPaymentDate: subscription.status === 'active' ? new Date() : user.lastPaymentDate, // Keep existing lastPaymentDate if not active
        }
      });

      console.log(`User ${user.email} subscription updated to ${subscriptionStatus} (${subscriptionTier})`);
    } else {
      console.warn(`No user found for Stripe customer ID: ${customerId}`);
    }
  } catch (error) {
    console.error('Error updating user subscription:', error);
  }
}

async function handleCheckoutCompleted(session: any) {
  try {
    const user = await prismaClient.user.findFirst({
      where: { stripeCustomerId: session.customer }
    })

    if (user) {
      // Quotes-Anzahl für Loops Event ermitteln
      const quotesCount = await prismaClient.quote.count({
        where: { userId: user.id }
      });

      // Loops Event: checkout_completed
      await trackEvent(user.email, 'checkout_completed', {
        userId: user.id,
        plan: 'pro',
        quotesCount: quotesCount,
        createdAt: new Date().toISOString(),
        checkoutSessionId: session.id,
        amount: session.amount_total,
        currency: session.currency,
        subscriptionId: session.subscription
      })

      // Enhanced Meta Conversions API Event: Purchase
      try {
        const { trackSubscriptionPurchase } = await import('@/lib/meta-conversions');
        
        await trackSubscriptionPurchase({
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          userId: user.id,
        }, {
          value: session.amount_total / 100,
          currency: session.currency?.toUpperCase() || 'EUR',
          plan: 'pro',
          subscriptionId: session.subscription,
          checkoutSessionId: session.id,
        });
        
        console.log('✅ Enhanced Meta Purchase event tracked');
      } catch (error) {
        console.error('❌ Enhanced Meta Purchase tracking failed:', error);
        // Fallback to old method
        try {
          await fetch(`${process.env.NEXTAUTH_URL}/api/analytics/meta-pixel`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              event: 'Purchase',
              userData: {
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                userId: user.id,
              },
              eventData: {
                value: session.amount_total / 100, // Convert from cents
                currency: session.currency?.toUpperCase() || 'EUR',
                plan: 'pro',
                checkoutSessionId: session.id,
                subscriptionId: session.subscription,
                quotesCount: quotesCount,
              }
            }),
          });
        } catch (fallbackError) {
          console.error('❌ Fallback Meta tracking also failed:', fallbackError);
        }
      }

      // User Properties aktualisieren
      await updateUserProperties(user.email, {
        plan: 'pro',
        subscriptionStatus: 'ACTIVE',
        subscriptionTier: 'PRO',
        upgradeDate: new Date().toISOString(),
        lastPaymentDate: new Date().toISOString()
      })

      // Update subscription status and lastPaymentDate in database
      let subscriptionEndDate = null;
      
      // If we have a subscription ID, try to get the actual end date from Stripe
      if (session.subscription) {
        try {
          const subscription = await stripe.subscriptions.retrieve(session.subscription) as any;
          subscriptionEndDate = new Date(subscription.current_period_end * 1000);
        } catch (stripeError) {
          console.warn('Failed to fetch subscription details, using fallback date:', stripeError);
          subscriptionEndDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now as fallback
        }
      }
      
      await prismaClient.user.update({
        where: { id: user.id },
        data: {
          subscriptionStatus: 'ACTIVE',
          subscriptionTier: 'PRO',
          subscriptionId: session.subscription,
          subscriptionEndDate: subscriptionEndDate,
          lastPaymentDate: new Date(),
        }
      });
    }
  } catch (error) {
    console.error('Checkout completed handling failed:', error)
  }
}

async function cancelUserSubscription(subscription: any) {
  try {
    const customerId = subscription.customer;
    
    const user = await prismaClient.user.findFirst({
      where: { stripeCustomerId: customerId }
    });

    if (user) {
      await prismaClient.user.update({
        where: { id: user.id },
        data: {
          subscriptionStatus: 'CANCELED',
          subscriptionTier: 'FREE',
          subscriptionId: null,
          subscriptionEndDate: null,
          lastPaymentDate: null, // Reset last payment date when subscription is cancelled
        }
      });

      // Loops Event: subscription_cancelled
      await trackEvent(user.email, 'subscription_cancelled', {
        userId: user.id,
        plan: 'free',
        cancelledAt: new Date().toISOString(),
        subscriptionId: subscription.id,
      });

      console.log(`User ${user.email} subscription cancelled`);
    }
  } catch (error) {
    console.error('Error cancelling user subscription:', error);
  }
}

async function handlePaymentFailure(invoice: any) {
  try {
    const customerId = invoice.customer;
    
    const user = await prismaClient.user.findFirst({
      where: { stripeCustomerId: customerId }
    });

    if (user) {
      // Loops Event: payment_failed
      await trackEvent(user.email, 'payment_failed', {
        userId: user.id,
        invoiceId: invoice.id,
        amount: invoice.amount_due,
        currency: invoice.currency,
        failedAt: new Date().toISOString(),
      });

      console.log(`Payment failed for user ${user.email}, invoice ${invoice.id}`);
    }
  } catch (error) {
    console.error('Error handling payment failure:', error);
  }
}

async function handlePaymentSuccess(invoice: any) {
  try {
    const customerId = invoice.customer;
    
    const user = await prismaClient.user.findFirst({
      where: { stripeCustomerId: customerId }
    });

    if (user) {
      // Loops Event: payment_succeeded
      await trackEvent(user.email, 'payment_succeeded', {
        userId: user.id,
        invoiceId: invoice.id,
        amount: invoice.amount_paid,
        currency: invoice.currency,
        paidAt: new Date().toISOString(),
      });

      // Update subscription status and lastPaymentDate in database
      // This ensures the user gets PRO status even if checkout.session.completed didn't work
      await prismaClient.user.update({
        where: { id: user.id },
        data: {
          subscriptionStatus: 'ACTIVE',
          subscriptionTier: 'PRO',
          lastPaymentDate: new Date(),
        }
      });

      console.log(`Payment succeeded for user ${user.email}, invoice ${invoice.id} - subscription updated to PRO`);
    }
  } catch (error) {
    console.error('Error handling payment success:', error);
  }
}