import { Button } from "@/components/ui/button"
import Link from 'next/link'
import { Image } from "@/components/ui/image"

export default function Home() {
  return (
    <div className="mobile-homepage bg-background flex flex-col">
      {/* Header Section with Logo and Title */}
      <div className="mobile-homepage-header">
        {/* App Icon */}
        <div className="w-12 h-12 mb-4 rounded-xl shadow-lg overflow-hidden sm:w-20 sm:h-20 sm:mb-8 sm:rounded-2xl">
          <Image 
            src="/icon.svg" 
            alt="AngebotNow Icon" 
            className="w-full h-full"
          />
        </div>

        {/* App Name with Gradient */}
        <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-8 bg-gradient-to-r from-[#F89813] to-[#FFB366] bg-clip-text text-transparent leading-tight">
          AngebotNow
        </h1>
      </div>

      {/* Center Section with Description */}
      <div className="mobile-homepage-content">
        {/* Introduction Text */}
        <p className="text-base sm:text-lg lg:text-xl text-gray-700 text-center max-w-md leading-relaxed mb-6 sm:mb-12 px-2 sm:px-4">
          Erstelle professionelle Angebote in nur 60 Sekunden mit unserer KI-gestützten App.
        </p>
        <Link 
          href="https://angebotnow.framer.website/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-[#F89813] font-medium hover:underline mb-6 sm:mb-12 text-sm sm:text-base"
        >
          -&gt; Mehr erfahren
        </Link>
      </div>

      {/* Bottom CTA Section */}
      <div className="mobile-homepage-footer">
        <Button 
          size="lg" 
          className="w-full h-10 sm:h-14 text-base sm:text-lg font-semibold bg-gradient-to-r from-[#F89813] to-[#FFB366] hover:from-[#E88A0F] hover:to-[#F89813] border-0 shadow-lg" 
          asChild
        >
          <Link href="/auth/signin">
            Jetzt anmelden
          </Link>
        </Button>
      </div>
    </div>
  )
}
