"use client";

import Script from "next/script";
import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

const GA_TRACKING_ID = "G-DQ0X60P2PS";

export default function GoogleAnalytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Track PageView on route changes (SPA behavior)
  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("config", GA_TRACKING_ID, {
        page_path: pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : ""),
      });
    }
  }, [pathname, searchParams]);

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_TRACKING_ID}');
        `}
      </Script>
    </>
  );
}

// Utility functions for tracking custom events
export function gtag(...args: any[]) {
  if (typeof window !== "undefined" && (window as any).gtag) {
    (window as any).gtag(...args);
  }
}

// Predefined tracking functions for common events
export const trackEvent = (eventName: string, parameters?: Record<string, any>) => {
  gtag("event", eventName, parameters);
};

export const trackPageView = (pagePath: string) => {
  gtag("config", GA_TRACKING_ID, {
    page_path: pagePath,
  });
};

export const trackConversion = (conversionId: string, value?: number, currency = "EUR") => {
  gtag("event", "conversion", {
    send_to: conversionId,
    value: value,
    currency: currency,
  });
};

// Enhanced tracking functions with more data
export const trackRegistration = (userData: {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
}) => {
  gtag("event", "sign_up", {
    method: "email",
    user_id: userData.userId,
    custom_parameters: {
      email: userData.email,
      first_name: userData.firstName,
      last_name: userData.lastName,
    },
  });
};

export const trackPurchase = (purchaseData: {
  transactionId: string;
  value: number;
  currency: string;
  plan: string;
  userId: string;
}) => {
  gtag("event", "purchase", {
    transaction_id: purchaseData.transactionId,
    value: purchaseData.value,
    currency: purchaseData.currency,
    items: [
      {
        item_id: purchaseData.plan,
        item_name: `${purchaseData.plan} Subscription`,
        category: "Subscription",
        quantity: 1,
        price: purchaseData.value,
      },
    ],
    user_id: purchaseData.userId,
  });
};

export const trackQuoteCreation = (quoteData: {
  quoteId: string;
  userId: string;
  value?: number;
}) => {
  gtag("event", "generate_lead", {
    currency: "EUR",
    value: quoteData.value || 0,
    user_id: quoteData.userId,
    custom_parameters: {
      quote_id: quoteData.quoteId,
    },
  });
};

export const trackUpgradeClick = (upgradeData: {
  location: string;
  userId: string;
  currentPlan: string;
  targetPlan: string;
}) => {
  gtag("event", "upgrade_clicked", {
    user_id: upgradeData.userId,
    custom_parameters: {
      location: upgradeData.location,
      current_plan: upgradeData.currentPlan,
      target_plan: upgradeData.targetPlan,
    },
  });
};

export const trackLogin = (method: string, userId: string) => {
  gtag("event", "login", {
    method: method,
    user_id: userId,
  });
};

export const trackSearch = (searchTerm: string, userId?: string) => {
  gtag("event", "search", {
    search_term: searchTerm,
    user_id: userId,
  });
};
