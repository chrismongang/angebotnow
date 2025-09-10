"use client";

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

interface TrackerProps {
  variant?: string;
  utm?: Record<string, string>;
}

export default function Tracker({ variant, utm }: TrackerProps) {
  const searchParams = useSearchParams();

  useEffect(() => {
    // UTM-Parameter aus URL extrahieren
    const utmParams: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      if (key.startsWith('utm_')) {
        utmParams[key] = value;
      }
    });

    // UTM-Daten im localStorage speichern + an API senden (Cookie wird serverseitig gesetzt)
    if (Object.keys(utmParams).length > 0) {
      const utmData = {
        ...utmParams,
        timestamp: new Date().toISOString(),
        page: window.location.pathname,
      };
      localStorage.setItem('utm_data', JSON.stringify(utmData));

      try {
        fetch('/api/utm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(utmParams),
          keepalive: true,
        });
      } catch (e) {
        // Ignorieren – Tracking darf nie brechen
      }
    }

    // Google Analytics 4 Event
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'page_view', {
        page_title: document.title,
        page_location: window.location.href,
        page_path: window.location.pathname,
        utm_source: utmParams.utm_source,
        utm_medium: utmParams.utm_medium,
        utm_campaign: utmParams.utm_campaign,
        variant: variant,
      });
    }

    // Custom Analytics Event
    if (typeof window !== 'undefined' && (window as any).analytics) {
      (window as any).analytics.page({
        name: document.title,
        properties: {
          path: window.location.pathname,
          url: window.location.href,
          utm_source: utmParams.utm_source,
          utm_medium: utmParams.utm_medium,
          utm_campaign: utmParams.utm_campaign,
          variant: variant,
        },
      });
    }
  }, [searchParams, variant, utm]);

  return null;
}

// CTA Click Tracking Hook
export function useCTATracking() {
  const trackCTAClick = (ctaType: string, ctaText: string, href: string) => {
    // Google Analytics 4
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'cta_click', {
        cta_type: ctaType,
        cta_text: ctaText,
        cta_href: href,
        page_path: window.location.pathname,
      });
    }

    // Custom Analytics
    if (typeof window !== 'undefined' && (window as any).analytics) {
      (window as any).analytics.track('CTA Clicked', {
        ctaType,
        ctaText,
        ctaHref: href,
        pagePath: window.location.pathname,
      });
    }
  };

  return { trackCTAClick };
}

// Scroll Depth Tracking Hook
export function useScrollTracking() {
  useEffect(() => {
    const milestones = [25, 50, 75, 90, 100];
    const trackedMilestones = new Set<number>();

    const handleScroll = () => {
      const scrollTop = window.pageYOffset;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = Math.round((scrollTop / docHeight) * 100);

      milestones.forEach((milestone) => {
        if (scrollPercent >= milestone && !trackedMilestones.has(milestone)) {
          trackedMilestones.add(milestone);

          // Google Analytics 4
          if (typeof window !== 'undefined' && (window as any).gtag) {
            (window as any).gtag('event', 'scroll_depth', {
              scroll_depth: milestone,
              page_path: window.location.pathname,
            });
          }

          // Custom Analytics
          if (typeof window !== 'undefined' && (window as any).analytics) {
            (window as any).analytics.track('Scroll Depth', {
              scrollDepth: milestone,
              pagePath: window.location.pathname,
            });
          }
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
}

// Form Interaction Tracking Hook
export function useFormTracking() {
  const trackFormStart = (formName: string) => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'form_start', {
        form_name: formName,
        page_path: window.location.pathname,
      });
    }

    if (typeof window !== 'undefined' && (window as any).analytics) {
      (window as any).analytics.track('Form Started', {
        formName,
        pagePath: window.location.pathname,
      });
    }
  };

  const trackFormSubmit = (formName: string, success: boolean) => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'form_submit', {
        form_name: formName,
        form_success: success,
        page_path: window.location.pathname,
      });
    }

    if (typeof window !== 'undefined' && (window as any).analytics) {
      (window as any).analytics.track('Form Submitted', {
        formName,
        success,
        pagePath: window.location.pathname,
      });
    }
  };

  return { trackFormStart, trackFormSubmit };
}
