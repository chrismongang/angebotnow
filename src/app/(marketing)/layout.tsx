import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "../globals.css";
import MetaPixel from "@/components/analytics/meta-pixel";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AngebotNow - KI-gestützte Angebotserstellung für Handwerker",
  description: "Erstelle professionelle Angebote in Minuten statt Stunden. KI-gestützte Angebotserstellung für Handwerker, Maler, Elektriker und mehr.",
  keywords: [
    "Angebot erstellen",
    "KI Angebotserstellung", 
    "Handwerk Angebote",
    "PDF Angebote",
    "Digitale Angebote",
    "Automatisierung",
    "Malermeister",
    "Elektriker",
    "Sanitär"
  ],
  openGraph: {
    title: "AngebotNow - KI-gestützte Angebotserstellung",
    description: "Erstelle professionelle Angebote in Minuten statt Stunden.",
    type: "website",
    locale: "de_DE",
  },
  twitter: {
    card: "summary_large_image",
    title: "AngebotNow - KI-gestützte Angebotserstellung",
    description: "Erstelle professionelle Angebote in Minuten statt Stunden.",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
};

export default function MarketingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body
        className={`${manrope.variable} font-manrope antialiased bg-background text-foreground`}
      >
        {/* Marketing-spezifisches Layout ohne AuthProvider */}
        <div className="min-h-screen">
          {children}
        </div>
        
        {/* Marketing-spezifische Scripts */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // UTM Parameter Tracking
              (function() {
                const urlParams = new URLSearchParams(window.location.search);
                const utmSource = urlParams.get('utm_source');
                const utmMedium = urlParams.get('utm_medium');
                const utmCampaign = urlParams.get('utm_campaign');
                
                if (utmSource || utmMedium || utmCampaign) {
                  const utmData = {
                    utm_source: utmSource,
                    utm_medium: utmMedium,
                    utm_campaign: utmCampaign,
                    timestamp: new Date().toISOString()
                  };
                  
                  // Speichere UTM Daten im localStorage für spätere Verwendung
                  localStorage.setItem('utm_data', JSON.stringify(utmData));
                  
                  // Optional: Sende an Analytics
                  if (typeof gtag !== 'undefined') {
                    gtag('event', 'utm_capture', utmData);
                  }
                }
              })();
            `,
          }}
        />
        <MetaPixel />
      </body>
    </html>
  );
}
