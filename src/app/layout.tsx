import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/providers/session-provider";
import ErrorBoundary from "@/components/error-boundary";

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
      </body>
    </html>
  );
}
