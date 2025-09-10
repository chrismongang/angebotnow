"use client";

import Script from "next/script";
import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

const PIXEL_ID = "1824927524761347";

export default function MetaPixel() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Track PageView on route changes (SPA behavior)
  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).fbq) {
      (window as any).fbq("track", "PageView");
    }
  }, [pathname, searchParams]);

  return (
    <>
      <Script id="meta-pixel" strategy="afterInteractive">
        {`
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${PIXEL_ID}');
fbq('track', 'PageView');
        `}
      </Script>
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          src={`https://www.facebook.com/tr?id=${PIXEL_ID}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  );
}

// Utility functions for tracking custom events
export function fbqTrack(...args: any[]) {
  if (typeof window !== "undefined" && (window as any).fbq) {
    (window as any).fbq(...args);
  }
}

// Predefined tracking functions for common events
export const trackLead = () => fbqTrack("track", "Lead");
export const trackCompleteRegistration = () =>
  fbqTrack("track", "CompleteRegistration");
export const trackPurchase = (value: number, currency = "EUR") =>
  fbqTrack("track", "Purchase", { value, currency });
export const trackViewContent = (contentType: string, contentId?: string) =>
  fbqTrack("track", "ViewContent", { content_type: contentType, content_ids: contentId ? [contentId] : undefined });
export const trackAddToCart = (value: number, currency = "EUR", contentId?: string) =>
  fbqTrack("track", "AddToCart", { value, currency, content_ids: contentId ? [contentId] : undefined });
export const trackInitiateCheckout = (value: number, currency = "EUR") =>
  fbqTrack("track", "InitiateCheckout", { value, currency });

// Enhanced tracking functions with more data
export const trackRegistrationWithData = (userData: {
  email: string;
  firstName: string;
  lastName: string;
  userId: string;
}) => {
  fbqTrack("track", "CompleteRegistration", {
    content_name: "User Registration",
    content_category: "Account",
    value: 0,
    currency: "EUR",
    user_id: userData.userId,
  });
};

export const trackPurchaseWithData = (purchaseData: {
  value: number;
  currency: string;
  plan: string;
  userId: string;
  subscriptionId?: string;
}) => {
  fbqTrack("track", "Purchase", {
    value: purchaseData.value,
    currency: purchaseData.currency,
    content_name: `${purchaseData.plan} Subscription`,
    content_category: "Subscription",
    user_id: purchaseData.userId,
    subscription_id: purchaseData.subscriptionId,
  });
};

export const trackQuoteCreation = (quoteData: {
  quoteId: string;
  userId: string;
  value?: number;
}) => {
  fbqTrack("trackCustom", "QuoteCreated", {
    quote_id: quoteData.quoteId,
    user_id: quoteData.userId,
    value: quoteData.value || 0,
    currency: "EUR",
  });
};

export const trackUpgradeClick = (upgradeData: {
  location: string;
  userId: string;
  currentPlan: string;
}) => {
  fbqTrack("trackCustom", "UpgradeClicked", {
    location: upgradeData.location,
    user_id: upgradeData.userId,
    current_plan: upgradeData.currentPlan,
  });
};