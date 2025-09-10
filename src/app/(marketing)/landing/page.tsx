import { getLandingConfig, applyABTests } from '@/lib/onepager';
import { buildMetadata } from '@/lib/seo';
import { componentRegistry, ComponentType } from '@/components/landing';
import { extractUTMParams } from '@/lib/utm';
import Tracker from '@/components/analytics/tracker';

export const dynamic = 'force-static';

export async function generateMetadata() {
  const config = await getLandingConfig();
  
  return buildMetadata({
    title: config.meta.title,
    description: config.meta.description,
    keywords: config.meta.keywords,
    path: '/landing',
    ogImage: config.meta.ogImage,
  });
}

export default async function LandingPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // UTM-Parameter verarbeiten
  const resolvedSearchParams = await searchParams;
  const urlSearchParams = new URLSearchParams();
  Object.entries(resolvedSearchParams).forEach(([key, value]) => {
    if (typeof value === 'string') {
      urlSearchParams.set(key, value);
    }
  });
  
  const utmParams = extractUTMParams(urlSearchParams);
  // Cookie wird clientseitig via /api/utm gesetzt

  // Konfiguration laden und A/B-Tests anwenden
  let config = await getLandingConfig();
  config = await applyABTests(config);

  return (
    <div className="min-h-screen">
      <Tracker />
      {config.sections.map((section, index) => {
        const Component = componentRegistry[section.type as ComponentType];
        
        if (!Component) {
          console.warn(`Unknown component type: ${section.type}`);
          return null;
        }

        return (
          <Component
            key={`${section.type}-${index}`}
            {...(section.props as any)}
          />
        );
      })}
    </div>
  );
}
