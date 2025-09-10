import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/providers/session-provider";
import ErrorBoundary from "@/components/error-boundary";
import MetaPixel from "@/components/analytics/meta-pixel";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AngebotNow - KI-gestützte Angebotserstellung",
  description: "Foto + kurze Infos → KI erstellt Angebotsentwurf → PDF",
  keywords: ["Angebot", "KI", "PDF", "Handwerk", "Automatisierung"],
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
  other: {
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'apple-mobile-web-app-title': 'AngebotNow',
    'mobile-web-app-capable': 'yes',
    'theme-color': '#ffffff',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body
        className={`${manrope.variable} font-manrope antialiased`}
      >
        <ErrorBoundary>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ErrorBoundary>
        <MetaPixel />
      </body>
    </html>
  );
}
