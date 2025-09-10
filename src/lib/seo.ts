import type { Metadata } from "next";

export interface SEOConfig {
  title: string;
  description: string;
  keywords?: string[];
  path: string;
  ogImage?: string;
  noIndex?: boolean;
  canonical?: string;
}

/**
 * Erstellt Metadata für Landingpages
 */
export function buildMetadata(config: SEOConfig): Metadata {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://angebotnow.de';
  const fullUrl = `${baseUrl}${config.path}`;
  const canonicalUrl = config.canonical || fullUrl;

  const metadata: Metadata = {
    title: config.title,
    description: config.description,
    keywords: config.keywords,
    robots: {
      index: !config.noIndex,
      follow: !config.noIndex,
    },
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: config.title,
      description: config.description,
      url: fullUrl,
      siteName: 'AngebotNow',
      locale: 'de_DE',
      type: 'website',
      images: config.ogImage ? [
        {
          url: config.ogImage.startsWith('http') 
            ? config.ogImage 
            : `${baseUrl}${config.ogImage}`,
          width: 1200,
          height: 630,
          alt: config.title,
        }
      ] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: config.title,
      description: config.description,
      images: config.ogImage ? [
        config.ogImage.startsWith('http') 
          ? config.ogImage 
          : `${baseUrl}${config.ogImage}`
      ] : undefined,
    },
  };

  return metadata;
}

/**
 * Erstellt strukturierte Daten für FAQ
 */
export function buildFAQStructuredData(faqItems: Array<{
  question: string;
  answer: string;
}>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqItems.map(item => ({
      "@type": "Question",
      "name": item.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.answer
      }
    }))
  };
}

/**
 * Erstellt strukturierte Daten für Organisation
 */
export function buildOrganizationStructuredData() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "AngebotNow",
    "url": "https://angebotnow.de",
    "logo": "https://angebotnow.de/images/logo.png",
    "description": "KI-gestützte Angebotserstellung für Handwerker und Dienstleister",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "DE"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "email": "support@angebotnow.de"
    },
    "sameAs": [
      "https://linkedin.com/company/angebotnow",
      "https://twitter.com/angebotnow"
    ]
  };
}

/**
 * Erstellt strukturierte Daten für Software
 */
export function buildSoftwareStructuredData() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "AngebotNow",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web",
    "description": "KI-gestützte Angebotserstellung für Handwerker und Dienstleister",
    "url": "https://angebotnow.de",
    "author": {
      "@type": "Organization",
      "name": "AngebotNow"
    },
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "EUR",
      "description": "Kostenlose Testversion verfügbar"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "500"
    }
  };
}

/**
 * Erstellt Breadcrumb-Strukturierte Daten
 */
export function buildBreadcrumbStructuredData(items: Array<{
  name: string;
  url: string;
}>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  };
}

/**
 * Generiert eine Robots.txt-konforme Sitemap-URL
 */
export function getSitemapUrl(): string {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://angebotnow.de';
  return `${baseUrl}/sitemap.xml`;
}

/**
 * Validiert SEO-Konfiguration
 */
export function validateSEOConfig(config: SEOConfig): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!config.title || config.title.length < 30 || config.title.length > 60) {
    errors.push('Title sollte zwischen 30 und 60 Zeichen lang sein');
  }

  if (!config.description || config.description.length < 120 || config.description.length > 160) {
    errors.push('Description sollte zwischen 120 und 160 Zeichen lang sein');
  }

  if (!config.path || !config.path.startsWith('/')) {
    errors.push('Path muss mit / beginnen');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
