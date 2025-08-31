import { prisma } from '@/lib/db';
import { STRIPE_PLANS, type SubscriptionTier } from './stripe';

export async function checkQuoteLimit(userId: string): Promise<{
  canCreate: boolean;
  remainingQuotes: number;
  limit: number;
  tier: SubscriptionTier;
}> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { 
      subscriptionTier: true, 
      monthlyQuoteCount: true, 
      quoteCountResetDate: true 
    }
  });

  if (!user) return { canCreate: false, remainingQuotes: 0, limit: 0, tier: 'FREE' };

  // Reset counter if month changed
  const now = new Date();
  const resetDate = new Date(user.quoteCountResetDate);
  if (now.getMonth() !== resetDate.getMonth() || now.getFullYear() !== resetDate.getFullYear()) {
    await prisma.user.update({
      where: { id: userId },
      data: { monthlyQuoteCount: 0, quoteCountResetDate: now }
    });
    
    const plan = STRIPE_PLANS[user.subscriptionTier];
    return { 
      canCreate: true, 
      remainingQuotes: plan.limits.monthlyQuotes === -1 ? -1 : plan.limits.monthlyQuotes, 
      limit: plan.limits.monthlyQuotes,
      tier: user.subscriptionTier
    };
  }

  const plan = STRIPE_PLANS[user.subscriptionTier];
  const limit = plan.limits.monthlyQuotes;
  const remaining = limit === -1 ? -1 : Math.max(0, limit - user.monthlyQuoteCount);

  return {
    canCreate: limit === -1 || user.monthlyQuoteCount < limit,
    remainingQuotes: remaining,
    limit,
    tier: user.subscriptionTier
  };
}

export async function incrementQuoteCount(userId: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: { monthlyQuoteCount: { increment: 1 } }
  });
}

export async function canEditPositions(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { subscriptionTier: true }
  });

  if (!user) return false;
  return STRIPE_PLANS[user.subscriptionTier].limits.canEditPositions;
}

export async function canCustomizeLogo(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { subscriptionTier: true }
  });

  if (!user) return false;
  return STRIPE_PLANS[user.subscriptionTier].limits.canCustomizeLogo;
}

export async function getUserSubscriptionInfo(userId: string): Promise<{
  tier: SubscriptionTier;
  status: string;
  monthlyQuoteCount: number;
  remainingQuotes: number;
  limit: number;
  canEditPositions: boolean;
  canCustomizeLogo: boolean;
}> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { 
      subscriptionTier: true,
      subscriptionStatus: true,
      monthlyQuoteCount: true,
      quoteCountResetDate: true
    }
  });

  if (!user) {
    return {
      tier: 'FREE',
      status: 'FREE',
      monthlyQuoteCount: 0,
      remainingQuotes: 5,
      limit: 5,
      canEditPositions: false,
      canCustomizeLogo: false
    };
  }

  const plan = STRIPE_PLANS[user.subscriptionTier];
  const limit = plan.limits.monthlyQuotes;
  const remaining = limit === -1 ? -1 : Math.max(0, limit - user.monthlyQuoteCount);

  return {
    tier: user.subscriptionTier,
    status: user.subscriptionStatus || 'FREE',
    monthlyQuoteCount: user.monthlyQuoteCount,
    remainingQuotes: remaining,
    limit,
    canEditPositions: plan.limits.canEditPositions,
    canCustomizeLogo: plan.limits.canCustomizeLogo
  };
}
