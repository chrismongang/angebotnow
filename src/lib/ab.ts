import { cookies } from 'next/headers';

export interface ABTestConfig {
  name: string;
  variants: Array<{
    name: string;
    weight: number;
    config: Record<string, any>;
  }>;
  enabled: boolean;
}

export interface ABTestResult {
  testName: string;
  variant: string;
  config: Record<string, any>;
  isControl: boolean;
}

/**
 * Verfügbare A/B-Tests
 */
const AB_TESTS: Record<string, ABTestConfig> = {
  hero_headline: {
    name: 'Hero Headline Test',
    enabled: true,
    variants: [
      {
        name: 'control',
        weight: 50,
        config: {
          title: 'Schneller zu Aufträgen mit KI-gestützten Angeboten',
          subtitle: 'Erstelle professionelle Angebote in Minuten statt Stunden',
        }
      },
      {
        name: 'variant_a',
        weight: 25,
        config: {
          title: 'KI erstellt deine Angebote automatisch',
          subtitle: 'Mehr Zeit für deine eigentliche Arbeit',
        }
      },
      {
        name: 'variant_b',
        weight: 25,
        config: {
          title: 'Angebotserstellung in 5 Minuten',
          subtitle: 'Mit künstlicher Intelligenz zum Erfolg',
        }
      }
    ]
  },
  cta_button: {
    name: 'CTA Button Test',
    enabled: true,
    variants: [
      {
        name: 'control',
        weight: 50,
        config: {
          primaryCta: {
            label: 'Kostenlos starten',
            href: '/auth/signin'
          }
        }
      },
      {
        name: 'variant_a',
        weight: 25,
        config: {
          primaryCta: {
            label: 'Jetzt testen',
            href: '/auth/signin'
          }
        }
      },
      {
        name: 'variant_b',
        weight: 25,
        config: {
          primaryCta: {
            label: 'Angebot erstellen',
            href: '/auth/signin'
          }
        }
      }
    ]
  }
};

/**
 * Bestimmt die Variante für einen A/B-Test
 */
export async function getABTestVariant(testName: string): Promise<ABTestResult | null> {
  const test = AB_TESTS[testName];
  
  if (!test || !test.enabled) {
    return null;
  }

  // Prüfe ob bereits eine Variante für diesen Test gespeichert ist
  const cookieStore = await cookies();
  const existingVariant = cookieStore.get(`ab_${testName}`);
  
  if (existingVariant?.value) {
    try {
      const result = JSON.parse(existingVariant.value);
      return result;
    } catch (error) {
      console.error('Error parsing AB test variant:', error);
    }
  }

  // Neue Variante basierend auf Gewichtung auswählen
  const variant = selectVariantByWeight(test.variants);
  const result: ABTestResult = {
    testName,
    variant: variant.name,
    config: variant.config,
    isControl: variant.name === 'control',
  };

  // Persistenz erfolgt clientseitig via /api/ab bei Bedarf

  return result;
}

/**
 * Wendet A/B-Test-Varianten auf eine Konfiguration an
 */
export async function applyABTests(config: any): Promise<any> {
  const updatedConfig = { ...config };

  // Hero Headline Test
  const heroTest = await getABTestVariant('hero_headline');
  if (heroTest && config.sections) {
    const heroSection = config.sections.find((s: any) => s.type === 'Hero');
    if (heroSection) {
      heroSection.props = {
        ...heroSection.props,
        ...heroTest.config,
      };
    }
  }

  // CTA Button Test
  const ctaTest = await getABTestVariant('cta_button');
  if (ctaTest && config.sections) {
    const ctaSection = config.sections.find((s: any) => s.type === 'CTA');
    if (ctaSection) {
      ctaSection.props = {
        ...ctaSection.props,
        ...ctaTest.config,
      };
    }
  }

  return updatedConfig;
}

/**
 * Wählt eine Variante basierend auf Gewichtung aus
 */
function selectVariantByWeight(variants: ABTestConfig['variants']): ABTestConfig['variants'][0] {
  const totalWeight = variants.reduce((sum, variant) => sum + variant.weight, 0);
  const random = Math.random() * totalWeight;
  
  let currentWeight = 0;
  for (const variant of variants) {
    currentWeight += variant.weight;
    if (random <= currentWeight) {
      return variant;
    }
  }
  
  // Fallback auf erste Variante
  return variants[0];
}

/**
 * Verfolgt A/B-Test-Events
 */
export function trackABTestEvent(
  testName: string,
  variant: string,
  event: string,
  properties?: Record<string, any>
): void {
  // Client-seitiges Tracking
  if (typeof window !== 'undefined') {
    // Google Analytics 4
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'ab_test_event', {
        test_name: testName,
        variant: variant,
        event_type: event,
        ...properties,
      });
    }

    // Custom Analytics
    if (typeof window !== 'undefined' && (window as any).analytics) {
      (window as any).analytics.track('AB Test Event', {
        testName,
        variant,
        event,
        ...properties,
      });
    }
  }
}

/**
 * Gibt alle aktiven A/B-Tests zurück
 */
export function getActiveABTests(): string[] {
  return Object.entries(AB_TESTS)
    .filter(([_, test]) => test.enabled)
    .map(([name, _]) => name);
}

/**
 * Validiert A/B-Test-Konfiguration
 */
export function validateABTestConfig(test: ABTestConfig): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!test.name) {
    errors.push('Test name is required');
  }

  if (!test.variants || test.variants.length < 2) {
    errors.push('At least 2 variants are required');
  }

  const totalWeight = test.variants.reduce((sum, variant) => sum + variant.weight, 0);
  if (Math.abs(totalWeight - 100) > 0.01) {
    errors.push('Total weight should be 100%');
  }

  const hasControl = test.variants.some(variant => variant.name === 'control');
  if (!hasControl) {
    errors.push('Control variant is required');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
