import { getOnepagerConfig, getAvailableOnepagerSlugs } from '@/lib/onepager';
import { buildMetadata } from '@/lib/seo';
import { componentRegistry, ComponentType } from '@/components/landing';
import { extractUTMParams } from '@/lib/utm';
import Tracker from '@/components/analytics/tracker';
import { notFound } from 'next/navigation';

export const dynamic = 'force-static';

export async function generateStaticParams() {
  const slugs = getAvailableOnepagerSlugs();
  return slugs.map((slug) => ({
    slug: slug,
  }));
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  try {
    const urlSearchParams = new URLSearchParams();
    Object.entries(searchParams).forEach(([key, value]) => {
      if (typeof value === 'string') {
        urlSearchParams.set(key, value);
      }
    });
    
    const utmParams = extractUTMParams(urlSearchParams);
    const config = await getOnepagerConfig(params.slug, utmParams);
    
    return buildMetadata({
      title: config.meta.title,
      description: config.meta.description,
      keywords: config.meta.keywords,
      path: `/lp/${params.slug}`,
      ogImage: config.meta.ogImage,
    });
  } catch (error) {
    console.error('Error generating metadata for onepager:', error);
    return buildMetadata({
      title: 'AngebotNow - KI-gestützte Angebotserstellung',
      description: 'Erstelle professionelle Angebote in Minuten statt Stunden.',
      path: `/lp/${params.slug}`,
    });
  }
}

export default async function OnepagerPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  try {
    // UTM-Parameter verarbeiten
    const urlSearchParams = new URLSearchParams();
    Object.entries(searchParams).forEach(([key, value]) => {
      if (typeof value === 'string') {
        urlSearchParams.set(key, value);
      }
    });
    
    const utmParams = extractUTMParams(urlSearchParams);
    // Cookie wird clientseitig via /api/utm gesetzt

    // Konfiguration laden
    const config = await getOnepagerConfig(params.slug, utmParams);

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
  } catch (error) {
    console.error('Error loading onepager:', error);
    notFound();
  }
}
