import { cookies } from 'next/headers';

export interface UTMParams {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
}

export interface UTMSession {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  timestamp: string;
  session_id: string;
}

/**
 * Extrahiert UTM-Parameter aus URL-Suchparametern
 */
export function extractUTMParams(searchParams: URLSearchParams): UTMParams {
  return {
    utm_source: searchParams.get('utm_source') || undefined,
    utm_medium: searchParams.get('utm_medium') || undefined,
    utm_campaign: searchParams.get('utm_campaign') || undefined,
    utm_term: searchParams.get('utm_term') || undefined,
    utm_content: searchParams.get('utm_content') || undefined,
  };
}

/**
 * Speichert UTM-Parameter in Cookies für spätere Verwendung
 */
export async function saveUTMParams(utmParams: UTMParams): Promise<void> {
  const cookieStore = await cookies();
  
  // Nur speichern wenn UTM-Parameter vorhanden sind
  if (hasUTMParams(utmParams)) {
    const utmSession: UTMSession = {
      ...utmParams,
      timestamp: new Date().toISOString(),
      session_id: generateSessionId(),
    };

    // Speichere für 30 Tage
    cookieStore.set('utm_data', JSON.stringify(utmSession), {
      maxAge: 30 * 24 * 60 * 60, // 30 Tage
      httpOnly: false, // Client-seitig zugänglich
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
  }
}

/**
 * Lädt gespeicherte UTM-Parameter aus Cookies
 */
export async function loadUTMParams(): Promise<UTMSession | null> {
  try {
    const cookieStore = await cookies();
    const utmData = cookieStore.get('utm_data');
    
    if (utmData?.value) {
      return JSON.parse(utmData.value);
    }
  } catch (error) {
    console.error('Error loading UTM params:', error);
  }
  
  return null;
}

/**
 * Prüft ob UTM-Parameter vorhanden sind
 */
export function hasUTMParams(utmParams: UTMParams): boolean {
  return !!(
    utmParams.utm_source ||
    utmParams.utm_medium ||
    utmParams.utm_campaign ||
    utmParams.utm_term ||
    utmParams.utm_content
  );
}

/**
 * Generiert eine eindeutige Session-ID
 */
function generateSessionId(): string {
  return `utm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Erstellt UTM-Tracking-Links
 */
export function createUTMLink(
  baseUrl: string,
  utmParams: UTMParams
): string {
  const url = new URL(baseUrl);
  
  Object.entries(utmParams).forEach(([key, value]) => {
    if (value) {
      url.searchParams.set(key, value);
    }
  });
  
  return url.toString();
}

/**
 * Analysiert UTM-Parameter für Analytics
 */
export function analyzeUTMParams(utmParams: UTMParams): {
  source: string;
  medium: string;
  campaign: string;
  isOrganic: boolean;
  isPaid: boolean;
  isSocial: boolean;
  isEmail: boolean;
} {
  const source = utmParams.utm_source || 'direct';
  const medium = utmParams.utm_medium || 'none';
  const campaign = utmParams.utm_campaign || 'none';

  return {
    source,
    medium,
    campaign,
    isOrganic: medium === 'organic',
    isPaid: medium === 'cpc' || medium === 'paid',
    isSocial: medium === 'social',
    isEmail: medium === 'email',
  };
}

/**
 * Erstellt Conversion-Tracking-Parameter
 */
export function createConversionParams(
  utmParams: UTMParams,
  conversionType: string
): Record<string, string> {
  return {
    ...utmParams,
    conversion_type: conversionType,
    conversion_timestamp: new Date().toISOString(),
  };
}

/**
 * Validiert UTM-Parameter
 */
export function validateUTMParams(utmParams: UTMParams): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Validiere utm_source
  if (utmParams.utm_source && utmParams.utm_source.length > 100) {
    errors.push('utm_source ist zu lang (max. 100 Zeichen)');
  }

  // Validiere utm_medium
  if (utmParams.utm_medium && utmParams.utm_medium.length > 100) {
    errors.push('utm_medium ist zu lang (max. 100 Zeichen)');
  }

  // Validiere utm_campaign
  if (utmParams.utm_campaign && utmParams.utm_campaign.length > 100) {
    errors.push('utm_campaign ist zu lang (max. 100 Zeichen)');
  }

  // Validiere utm_term
  if (utmParams.utm_term && utmParams.utm_term.length > 100) {
    errors.push('utm_term ist zu lang (max. 100 Zeichen)');
  }

  // Validiere utm_content
  if (utmParams.utm_content && utmParams.utm_content.length > 100) {
    errors.push('utm_content ist zu lang (max. 100 Zeichen)');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
