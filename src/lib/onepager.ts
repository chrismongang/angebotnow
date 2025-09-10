import fs from 'fs';
import path from 'path';

export interface LandingConfig {
  meta: {
    title: string;
    description: string;
    keywords?: string[];
    ogImage?: string;
  };
  sections: Array<{
    type: string;
    props: Record<string, any>;
  }>;
  variant?: string;
}

export interface UTMParams {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
}

/**
 * Lädt die Haupt-Landingpage-Konfiguration
 */
export async function getLandingConfig(): Promise<LandingConfig> {
  try {
    const configPath = path.join(process.cwd(), 'src/content/landing/main.json');
    const configData = fs.readFileSync(configPath, 'utf8');
    return JSON.parse(configData);
  } catch (error) {
    console.error('Error loading landing config:', error);
    throw new Error('Failed to load landing configuration');
  }
}

/**
 * Lädt die Onepager-Konfiguration für einen spezifischen Slug
 */
export async function getOnepagerConfig(
  slug: string,
  searchParams?: UTMParams
): Promise<LandingConfig> {
  try {
    // Lade Base-Konfiguration
    const baseConfigPath = path.join(process.cwd(), 'src/content/onepagers/base.json');
    const baseConfigData = fs.readFileSync(baseConfigPath, 'utf8');
    const baseConfig: LandingConfig = JSON.parse(baseConfigData);

    // Versuche spezifische Konfiguration zu laden
    const specificConfigPath = path.join(process.cwd(), `src/content/onepagers/${slug}.json`);
    
    if (fs.existsSync(specificConfigPath)) {
      const specificConfigData = fs.readFileSync(specificConfigPath, 'utf8');
      const specificConfig: LandingConfig = JSON.parse(specificConfigData);
      
      // Merge base und specific config
      return mergeConfigs(baseConfig, specificConfig, searchParams);
    }

    // Fallback auf base config mit UTM-Anpassungen
    return applyUTMOverrides(baseConfig, searchParams);
  } catch (error) {
    console.error('Error loading onepager config:', error);
    throw new Error(`Failed to load onepager configuration for slug: ${slug}`);
  }
}

/**
 * Merged zwei Konfigurationen (base + specific)
 */
function mergeConfigs(
  base: LandingConfig,
  specific: LandingConfig,
  searchParams?: UTMParams
): LandingConfig {
  const merged: LandingConfig = {
    meta: {
      ...base.meta,
      ...specific.meta,
    },
    sections: specific.sections.length > 0 ? specific.sections : base.sections,
    variant: specific.variant || base.variant,
  };

  return applyUTMOverrides(merged, searchParams);
}

/**
 * Wendet UTM-Parameter-spezifische Overrides an
 */
function applyUTMOverrides(
  config: LandingConfig,
  searchParams?: UTMParams
): LandingConfig {
  if (!searchParams) return config;

  const { utm_source, utm_campaign, utm_content } = searchParams;

  // UTM-spezifische Anpassungen
  if (utm_source === 'google' && utm_campaign === 'handwerk') {
    // Spezielle Anpassungen für Google Handwerk Kampagne
    config.meta.title = config.meta.title.replace('AngebotNow', 'AngebotNow für Handwerker');
  }

  if (utm_content === 'solar') {
    // Solar-spezifische Anpassungen
    config.meta.title = config.meta.title.replace('AngebotNow', 'AngebotNow für Solar-Installateure');
  }

  return config;
}

/**
 * Validiert eine Landingpage-Konfiguration
 */
export function validateConfig(config: LandingConfig): boolean {
  if (!config.meta || !config.sections) {
    return false;
  }

  if (!config.meta.title || !config.meta.description) {
    return false;
  }

  if (!Array.isArray(config.sections) || config.sections.length === 0) {
    return false;
  }

  // Validiere Sektionen
  for (const section of config.sections) {
    if (!section.type || !section.props) {
      return false;
    }
  }

  return true;
}

/**
 * Gibt alle verfügbaren Onepager-Slugs zurück
 */
export function getAvailableOnepagerSlugs(): string[] {
  try {
    const onepagersDir = path.join(process.cwd(), 'src/content/onepagers');
    const files = fs.readdirSync(onepagersDir);
    
    return files
      .filter(file => file.endsWith('.json') && file !== 'base.json')
      .map(file => file.replace('.json', ''));
  } catch (error) {
    console.error('Error reading onepager directory:', error);
    return [];
  }
}

/**
 * Generiert eine Sitemap für alle Landingpages
 */
export function generateLandingSitemap(): Array<{
  url: string;
  lastmod: string;
  changefreq: string;
  priority: string;
}> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://angebotnow.de';
  const lastmod = new Date().toISOString().split('T')[0];
  
  const sitemap = [
    {
      url: `${baseUrl}/landing`,
      lastmod,
      changefreq: 'weekly',
      priority: '1.0',
    },
  ];

  // Füge alle Onepager hinzu
  const slugs = getAvailableOnepagerSlugs();
  slugs.forEach(slug => {
    sitemap.push({
      url: `${baseUrl}/lp/${slug}`,
      lastmod,
      changefreq: 'monthly',
      priority: '0.8',
    });
  });

  return sitemap;
}

/**
 * Wendet A/B-Test-Varianten auf eine Konfiguration an
 */
export async function applyABTests(config: LandingConfig): Promise<LandingConfig> {
  // Importiere A/B-Test-Funktionen
  const { getABTestVariant } = await import('./ab');
  
  const updatedConfig = { ...config };

  // Hero Headline Test
  const heroTest = await getABTestVariant('hero_headline');
  if (heroTest && config.sections) {
    const heroSection = config.sections.find((s) => s.type === 'Hero');
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
    const ctaSection = config.sections.find((s) => s.type === 'CTA');
    if (ctaSection) {
      ctaSection.props = {
        ...ctaSection.props,
        ...ctaTest.config,
      };
    }
  }

  return updatedConfig;
}
