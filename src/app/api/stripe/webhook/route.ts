import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { headers } from 'next/headers';
import { prisma } from '@/lib/db';

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature')!;

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    console.log('Stripe webhook event:', event.type);

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        const subscription = event.data.object;
        await updateUserSubscription(subscription);
        break;
      
      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object;
        await cancelUserSubscription(deletedSubscription);
        break;

      case 'invoice.payment_failed':
        const failedInvoice = event.data.object;
        await handlePaymentFailure(failedInvoice);
        break;

      case 'invoice.payment_succeeded':
        const successfulInvoice = event.data.object;
        await handlePaymentSuccess(successfulInvoice);
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
  const status = subscription.status;
  
  // Map Stripe status to our enum
  let subscriptionStatus: 'ACTIVE' | 'PAST_DUE' | 'CANCELED' | 'UNPAID' = 'ACTIVE';
  if (status === 'past_due') subscriptionStatus = 'PAST_DUE';
  else if (status === 'canceled') subscriptionStatus = 'CANCELED';
  else if (status === 'unpaid') subscriptionStatus = 'UNPAID';

  await prisma.user.updateMany({
    where: { stripeCustomerId: customerId },
    data: {
      subscriptionId: subscription.id,
      subscriptionStatus,
      subscriptionTier: 'PRO',
      subscriptionEndDate: new Date(subscription.current_period_end * 1000)
    }
  });

  console.log(`Updated subscription for customer ${customerId}: ${subscriptionStatus}`);
}

async function cancelUserSubscription(subscription: any) {
  const customerId = subscription.customer;
  
  await prisma.user.updateMany({
    where: { stripeCustomerId: customerId },
    data: {
      subscriptionStatus: 'CANCELED',
      subscriptionTier: 'FREE',
      subscriptionEndDate: new Date(subscription.canceled_at * 1000)
    }
  });

  console.log(`Canceled subscription for customer ${customerId}`);
}

async function handlePaymentFailure(invoice: any) {
  const customerId = invoice.customer;
  
  await prisma.user.updateMany({
    where: { stripeCustomerId: customerId },
    data: {
      subscriptionStatus: 'PAST_DUE'
    }
  });

  console.log(`Payment failed for customer ${customerId}`);
}

async function handlePaymentSuccess(invoice: any) {
  const customerId = invoice.customer;
  
  // Only update if it's a subscription invoice
  if (invoice.subscription) {
    await prisma.user.updateMany({
      where: { stripeCustomerId: customerId },
      data: {
        subscriptionStatus: 'ACTIVE'
      }
    });

    console.log(`Payment succeeded for customer ${customerId}`);
  }
}
