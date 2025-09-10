export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://angebotnow.de';
  
  const robots = `User-agent: *
Allow: /
Allow: /landing
Allow: /lp/

# Marketing pages
Allow: /lp/handwerk
Allow: /lp/solar

# App routes (protected)
Disallow: /dashboard
Disallow: /einstellungen
Disallow: /angebote
Disallow: /angebot/

# API routes
Disallow: /api/

# Admin routes
Disallow: /admin/

Sitemap: ${baseUrl}/sitemap.xml`;

  return new Response(robots, {
    headers: {
      'Content-Type': 'text/plain',
    },
  });
}
