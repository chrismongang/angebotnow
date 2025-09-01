import { prisma } from '@/lib/db';
import { STRIPE_PLANS, type SubscriptionTier } from './stripe';
import { ReferralSystem } from '@/lib/referral';

export async function checkQuoteLimit(userId: string): Promise<{
  canCreate: boolean;
  remainingQuotes: number;
  limit: number;
  tier: SubscriptionTier;
  hasReferralCredits: boolean; // NEU
}> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { 
      subscriptionTier: true, 
      monthlyQuoteCount: true, 
      quoteCountResetDate: true,
      referralCredits: true // NEU
    }
  });

  if (!user) return { 
    canCreate: false, 
    remainingQuotes: 0, 
    limit: 0, 
    tier: 'FREE',
    hasReferralCredits: false 
  };

  // Reset counter if month changed
  const now = new Date();
  const resetDate = new Date(user.quoteCountResetDate);
  if (now.getMonth() !== resetDate.getMonth() || now.getFullYear() !== resetDate.getFullYear()) {
    await prisma.user.update({
      where: { id: userId },
      data: { monthlyQuoteCount: 0, quoteCountResetDate: now }
    });
    
    const plan = STRIPE_PLANS[user.subscriptionTier];
    const hasReferralCredits = (user.referralCredits || 0) > 0;
    
    return { 
      canCreate: true, 
      remainingQuotes: plan.limits.monthlyQuotes === -1 ? -1 : plan.limits.monthlyQuotes, 
      limit: plan.limits.monthlyQuotes,
      tier: user.subscriptionTier,
      hasReferralCredits
    };
  }

  const plan = STRIPE_PLANS[user.subscriptionTier];
  const limit = plan.limits.monthlyQuotes;
  const remaining = limit === -1 ? -1 : Math.max(0, limit - user.monthlyQuoteCount);
  const hasReferralCredits = (user.referralCredits || 0) > 0;

  return {
    canCreate: limit === -1 || user.monthlyQuoteCount < limit || hasReferralCredits,
    remainingQuotes: remaining,
    limit,
    tier: user.subscriptionTier,
    hasReferralCredits
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
  referralCredits: number;
}> {
  const user = await prisma.user.findUnique({
    where: { 
      id: userId 
    },
    select: { 
      subscriptionTier: true,
      subscriptionStatus: true,
      monthlyQuoteCount: true,
      quoteCountResetDate: true,
      referralCredits: true
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
      canCustomizeLogo: false,
      referralCredits: 0
    };
  }

  const plan = STRIPE_PLANS[user.subscriptionTier];
  const limit = plan.limits.monthlyQuotes;
  
  // Berechne remainingQuotes inklusive Referral-Credits
  let remaining = limit === -1 ? -1 : Math.max(0, limit - user.monthlyQuoteCount);
  
  // Füge Referral-Credits zu den verbleibenden Angeboten hinzu
  if (limit !== -1 && (user.referralCredits || 0) > 0) {
    remaining += user.referralCredits;
  }

  return {
    tier: user.subscriptionTier,
    status: user.subscriptionStatus || 'FREE',
    monthlyQuoteCount: user.monthlyQuoteCount,
    remainingQuotes: remaining,
    limit,
    canEditPositions: plan.limits.canEditPositions,
    canCustomizeLogo: plan.limits.canCustomizeLogo,
    referralCredits: user.referralCredits || 0
  };
}

// NEU: Verwendet Referral-Credit wenn verfügbar
export async function consumeReferralCreditForQuote(userId: string): Promise<boolean> {
  const { hasReferralCredits } = await checkQuoteLimit(userId);
  
  if (!hasReferralCredits) return false;

  return await ReferralSystem.consumeReferralCredit(userId);
}

// NEU: Erweiterte Quote-Limit-Prüfung mit Referral-Credits
export async function checkQuoteLimitWithReferrals(userId: string): Promise<{
  canCreate: boolean;
  remainingQuotes: number;
  limit: number;
  tier: SubscriptionTier;
  hasReferralCredits: boolean;
  referralCreditsCount: number;
  message?: string;
}> {
  const quoteLimit = await checkQuoteLimit(userId);
  const referralInfo = await ReferralSystem.getUserReferralInfo(userId);
  
  let message: string | undefined;
  
  if (!quoteLimit.canCreate && quoteLimit.hasReferralCredits) {
    message = `Du hast dein monatliches Limit erreicht, aber ${referralInfo.referralCredits} Referral-Credits verfügbar!`;
  } else if (!quoteLimit.canCreate) {
    message = `Du hast dein monatliches Limit von ${quoteLimit.limit} Angeboten erreicht.`;
  }

  return {
    ...quoteLimit,
    referralCreditsCount: referralInfo.referralCredits,
    message
  };
}
