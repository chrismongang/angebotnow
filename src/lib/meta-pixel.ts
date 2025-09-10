// Client-side Meta Pixel tracking utilities
import { fbqTrack } from '@/components/analytics/meta-pixel';

// Track user registration (client-side)
export const trackRegistration = (userData: {
  email: string;
  firstName: string;
  lastName: string;
  userId: string;
}) => {
  fbqTrack('track', 'CompleteRegistration', {
    content_name: 'User Registration',
    content_category: 'Account',
    value: 0,
    currency: 'EUR',
    user_id: userData.userId,
  });
};

// Track subscription purchase (client-side)
export const trackSubscriptionPurchase = (purchaseData: {
  value: number;
  currency: string;
  plan: string;
  userId: string;
}) => {
  fbqTrack('track', 'Purchase', {
    value: purchaseData.value,
    currency: purchaseData.currency,
    content_name: `${purchaseData.plan} Subscription`,
    content_category: 'Subscription',
    user_id: purchaseData.userId,
  });
};

// Track lead generation (client-side)
export const trackLead = (leadData: {
  contentName: string;
  contentCategory?: string;
  value?: number;
  userId?: string;
}) => {
  fbqTrack('track', 'Lead', {
    content_name: leadData.contentName,
    content_category: leadData.contentCategory || 'Lead',
    value: leadData.value || 0,
    currency: 'EUR',
    user_id: leadData.userId,
  });
};

// Track quote creation (custom event)
export const trackQuoteCreation = (quoteData: {
  quoteId: string;
  userId: string;
  value?: number;
}) => {
  fbqTrack('trackCustom', 'QuoteCreated', {
    quote_id: quoteData.quoteId,
    user_id: quoteData.userId,
    value: quoteData.value || 0,
    currency: 'EUR',
  });
};

// Track upgrade button clicks
export const trackUpgradeClick = (upgradeData: {
  location: string;
  userId: string;
  currentPlan: string;
}) => {
  fbqTrack('trackCustom', 'UpgradeClicked', {
    location: upgradeData.location,
    user_id: upgradeData.userId,
    current_plan: upgradeData.currentPlan,
  });
};
