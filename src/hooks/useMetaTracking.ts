'use client';

import { useSession } from 'next-auth/react';
import { useCallback } from 'react';

export function useMetaTracking() {
  const { data: session } = useSession();

  const trackEvent = useCallback(async (
    event: string,
    eventData: Record<string, any> = {},
    options: { clientSide?: boolean } = {}
  ) => {
    if (!session?.user) {
      console.warn('No user session for Meta tracking');
      return { success: false };
    }

    try {
      const response = await fetch('/api/analytics/meta-events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event,
          eventData,
          options,
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        console.log(`✅ Meta event '${event}' tracked:`, result.eventId);
      } else {
        console.error(`❌ Meta event '${event}' failed:`, result.error);
      }
      
      return result;
    } catch (error) {
      console.error('Meta tracking error:', error);
      return { success: false, error };
    }
  }, [session]);

  const trackUpgrade = useCallback(async (upgradeData: {
    fromPlan: string;
    toPlan: string;
    value: number;
    currency: string;
    source: string;
  }) => {
    if (!session?.user) return { success: false };

    try {
      const response = await fetch('/api/analytics/meta-events', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'upgrade',
          data: upgradeData,
        }),
      });

      return await response.json();
    } catch (error) {
      console.error('Upgrade tracking error:', error);
      return { success: false, error };
    }
  }, [session]);

  const trackLead = useCallback(async (leadData: {
    contentName: string;
    contentCategory?: string;
    value?: number;
    source?: string;
  }) => {
    if (!session?.user) return { success: false };

    try {
      const response = await fetch('/api/analytics/meta-events', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'lead',
          data: leadData,
        }),
      });

      return await response.json();
    } catch (error) {
      console.error('Lead tracking error:', error);
      return { success: false, error };
    }
  }, [session]);

  const trackInitiateCheckout = useCallback(async (checkoutData: {
    value: number;
    currency: string;
    plan: string;
    source: string;
  }) => {
    if (!session?.user) return { success: false };

    try {
      const response = await fetch('/api/analytics/meta-events', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'initiate_checkout',
          data: checkoutData,
        }),
      });

      return await response.json();
    } catch (error) {
      console.error('Checkout tracking error:', error);
      return { success: false, error };
    }
  }, [session]);

  return {
    trackEvent,
    trackUpgrade,
    trackLead,
    trackInitiateCheckout,
  };
}
