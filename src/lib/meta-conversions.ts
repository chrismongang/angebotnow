// Enhanced Meta Conversions API utilities
import { fbqTrack } from '@/components/analytics/meta-pixel';

// Event types for better type safety
export type MetaEventType = 
  | 'CompleteRegistration' 
  | 'Purchase' 
  | 'Lead' 
  | 'InitiateCheckout'
  | 'ViewContent'
  | 'AddToCart'
  | 'Subscribe'
  | 'StartTrial'
  | 'Upgrade';

export interface UserData {
  email: string;
  firstName: string;
  lastName: string;
  userId: string;
  phone?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  fbc?: string; // Facebook click ID
  fbp?: string; // Facebook browser ID
  subscriptionId?: string;
}

export interface EventData {
  value?: number;
  currency?: string;
  content_name?: string;
  content_category?: string;
  content_type?: string;
  content_ids?: string[];
  num_items?: number;
  search_string?: string;
  status?: string;
  plan?: string;
  source?: string;
  [key: string]: any;
}

// Enhanced server-side tracking with better data quality
export async function trackMetaEvent(
  event: MetaEventType,
  userData: UserData,
  eventData: EventData = {},
  options: {
    eventId?: string;
    eventSourceUrl?: string;
    clientSide?: boolean;
  } = {}
): Promise<{success: boolean, eventId?: string}> {
  const { eventId, eventSourceUrl, clientSide = false } = options;

  // Server-side tracking via Conversions API
  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL}/api/analytics/meta-pixel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event,
        userData,
        eventData,
        eventId,
        eventSourceUrl,
      }),
    });

    const result = await response.json();
    
    if (result.success) {
      console.log(`✅ Meta ${event} event tracked successfully:`, result.eventId);
      
      // Also track client-side for deduplication
      if (clientSide && typeof window !== 'undefined') {
        trackClientSideEvent(event, eventData);
      }
      
      return { success: true, eventId: result.eventId };
    } else {
      console.error(`❌ Meta ${event} event failed:`, result.error);
      return { success: false };
    }
  } catch (error) {
    console.error(`❌ Meta ${event} event error:`, error);
    return { success: false };
  }
}

// Client-side tracking for deduplication
function trackClientSideEvent(event: MetaEventType, eventData: EventData) {
  try {
    if (event === 'CompleteRegistration') {
      fbqTrack('track', 'CompleteRegistration', {
        content_name: 'User Registration',
        content_category: 'Account',
        value: 0,
        currency: 'EUR',
        ...eventData,
      });
    } else if (event === 'Purchase') {
      fbqTrack('track', 'Purchase', {
        value: eventData.value || 0,
        currency: eventData.currency || 'EUR',
        content_name: eventData.content_name || 'Subscription',
        content_category: 'Subscription',
        ...eventData,
      });
    } else if (event === 'Lead') {
      fbqTrack('track', 'Lead', {
        content_name: eventData.content_name || 'Lead',
        content_category: eventData.content_category || 'Lead',
        value: eventData.value || 0,
        currency: 'EUR',
        ...eventData,
      });
    } else if (event === 'InitiateCheckout') {
      fbqTrack('track', 'InitiateCheckout', {
        value: eventData.value || 0,
        currency: eventData.currency || 'EUR',
        ...eventData,
      });
    } else if (event === 'Subscribe') {
      fbqTrack('track', 'Subscribe', {
        value: eventData.value || 0,
        currency: eventData.currency || 'EUR',
        ...eventData,
      });
    }
  } catch (error) {
    console.error('Client-side tracking error:', error);
  }
}

// Specific tracking functions for common events
export async function trackUserRegistration(userData: UserData, source: string = 'email_password') {
  return trackMetaEvent('CompleteRegistration', userData, {
    plan: 'free',
    source,
    content_name: 'User Registration',
    content_category: 'Account',
    content_type: 'user',
    status: 'completed',
  }, { clientSide: true });
}

export async function trackSubscriptionPurchase(
  userData: UserData, 
  purchaseData: {
    value: number;
    currency: string;
    plan: string;
    subscriptionId?: string;
    checkoutSessionId?: string;
  }
) {
  return trackMetaEvent('Purchase', userData, {
    value: purchaseData.value,
    currency: purchaseData.currency,
    plan: purchaseData.plan,
    content_name: `${purchaseData.plan} Subscription`,
    content_category: 'Subscription',
    content_type: 'subscription',
    content_ids: [purchaseData.subscriptionId || userData.userId],
    num_items: 1,
    status: 'completed',
    subscription_id: purchaseData.subscriptionId,
    checkout_session_id: purchaseData.checkoutSessionId,
  }, { clientSide: true });
}

export async function trackUpgrade(
  userData: UserData,
  upgradeData: {
    fromPlan: string;
    toPlan: string;
    value: number;
    currency: string;
    source: string;
  }
) {
  return trackMetaEvent('Upgrade', userData, {
    value: upgradeData.value,
    currency: upgradeData.currency,
    content_name: `Upgrade to ${upgradeData.toPlan}`,
    content_category: 'Subscription',
    content_type: 'upgrade',
    from_plan: upgradeData.fromPlan,
    to_plan: upgradeData.toPlan,
    source: upgradeData.source,
    status: 'completed',
  }, { clientSide: true });
}

export async function trackLead(
  userData: UserData,
  leadData: {
    contentName: string;
    contentCategory?: string;
    value?: number;
    source?: string;
  }
) {
  return trackMetaEvent('Lead', userData, {
    content_name: leadData.contentName,
    content_category: leadData.contentCategory || 'Lead',
    content_type: 'lead',
    value: leadData.value || 0,
    currency: 'EUR',
    source: leadData.source || 'website',
    status: 'completed',
  });
}

export async function trackInitiateCheckout(
  userData: UserData,
  checkoutData: {
    value: number;
    currency: string;
    plan: string;
    source: string;
  }
) {
  return trackMetaEvent('InitiateCheckout', userData, {
    value: checkoutData.value,
    currency: checkoutData.currency,
    content_name: `${checkoutData.plan} Checkout`,
    content_category: 'Subscription',
    content_type: 'checkout',
    plan: checkoutData.plan,
    source: checkoutData.source,
    status: 'initiated',
  }, { clientSide: true });
}

// Utility to get Facebook click ID from URL parameters
export function getFacebookClickId(): string | undefined {
  if (typeof window === 'undefined') return undefined;
  
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('fbclid') || undefined;
}

// Utility to get Facebook browser ID from cookies
export function getFacebookBrowserId(): string | undefined {
  if (typeof window === 'undefined') return undefined;
  
  const cookies = document.cookie.split(';');
  const fbpCookie = cookies.find(cookie => cookie.trim().startsWith('_fbp='));
  
  if (fbpCookie) {
    return fbpCookie.split('=')[1];
  }
  
  return undefined;
}
