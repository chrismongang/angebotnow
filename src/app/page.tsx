import { Button } from "@/components/ui/button"
import Link from 'next/link'
import { Image } from "@/components/ui/image"

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header Section with Logo and Title */}
      <div className="flex flex-col items-center px-6 pt-20 pb-8">
        {/* App Icon */}
        <div className="w-20 h-20 mb-8 rounded-2xl shadow-lg overflow-hidden">
          <Image 
            src="/icon.svg" 
            alt="AngebotNow Icon" 
            className="w-full h-full"
          />
        </div>

        {/* App Name with Gradient */}
        <h1 className="text-4xl sm:text-5xl font-bold mb-8 bg-gradient-to-r from-[#F89813] to-[#FFB366] bg-clip-text text-transparent leading-tight">
          AngebotNow
        </h1>
      </div>

      {/* Center Section with Description */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        {/* Introduction Text */}
        <p className="text-lg sm:text-xl text-gray-700 text-center max-w-md leading-relaxed mb-12 px-4">
          Erstelle professionelle Angebote in nur 60 Sekunden mit unserer KI-gestützten App.
        </p>
      </div>

      {/* Bottom CTA Section */}
      <div className="px-6 pb-8 pt-4">
        <Button 
          size="lg" 
          className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-[#F89813] to-[#FFB366] hover:from-[#E88A0F] hover:to-[#F89813] border-0 shadow-lg" 
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
