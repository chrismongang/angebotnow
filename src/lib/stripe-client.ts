// Client-side Stripe configuration (no Stripe client)
export const STRIPE_PLANS = {
  FREE: {
    id: 'free',
    name: 'Free',
    price: 0,
    features: ['5 Angebote pro Monat', 'E-Mail-Support (24h)'],
    limits: { monthlyQuotes: 5, canEditPositions: false, canCustomizeLogo: false }
  },
  PRO: {
    id: 'price_pro_monthly', // Stripe Price ID
    name: 'Pro',
    price: 1999, // 19,99€ in Cent
    features: [
      'Unbegrenzte Angebote', 
      'Positionen bearbeiten', 
      'Prioritäts-Support (4h)',
      'Eigenes Logo in PDF',
      'Kein AngebotNow Branding'
    ],
    limits: { monthlyQuotes: -1, canEditPositions: true, canCustomizeLogo: true }
  }
} as const;

export type SubscriptionTier = keyof typeof STRIPE_PLANS;
export type PlanLimits = typeof STRIPE_PLANS[keyof typeof STRIPE_PLANS]['limits'];

// Helper function to get plan by tier
export function getPlanByTier(tier: SubscriptionTier) {
  return STRIPE_PLANS[tier];
}

// Helper function to check if user can perform action  
export function canPerformAction(tier: SubscriptionTier, action: keyof PlanLimits): boolean {
  const plan = STRIPE_PLANS[tier];
  const value = plan.limits[action];
  
  // Handle boolean values directly
  if (typeof value === 'boolean') {
    return value;
  }
  
  // For monthlyQuotes: -1 means unlimited (true), any positive number means limited but available (true)
  return true;
}
