'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Building2, Settings, CheckCircle } from 'lucide-react'

interface CompanyInfoModalProps {
  isOpen: boolean
  onClose: () => void
}

export function CompanyInfoModal({ isOpen, onClose }: CompanyInfoModalProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [hasSeenModal, setHasSeenModal] = useState(false)

  useEffect(() => {
    // Prüfen ob User den Modal bereits gesehen hat
    if (typeof window !== 'undefined') {
      const seen = localStorage.getItem('company-info-modal-seen')
      if (seen) {
        setHasSeenModal(true)
      }
    }
  }, [])

  const handleCompleteSetup = () => {
    // Markieren dass der Modal gesehen wurde
    if (typeof window !== 'undefined') {
      localStorage.setItem('company-info-modal-seen', 'true')
    }
    setHasSeenModal(true)
    onClose()
    // Zur Konto-Seite weiterleiten
    router.push('/einstellungen/konto')
  }

  const handleSkip = () => {
    // Markieren dass der Modal gesehen wurde
    if (typeof window !== 'undefined') {
      localStorage.setItem('company-info-modal-seen', 'true')
    }
    setHasSeenModal(true)
    onClose()
  }

  if (!isOpen || hasSeenModal) {
    return null
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-full flex items-center justify-center">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-xl font-bold text-gray-800">
            Willkommen bei AngebotNow! 🎉
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <p className="text-gray-600 text-sm text-center">
            Um professionelle Angebote zu erstellen, benötigen wir deine Firmeninformationen.
          </p>
          
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
            <h4 className="font-medium text-orange-800 text-sm mb-2 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Was wird benötigt:
            </h4>
            <ul className="text-xs text-orange-700 space-y-1">
              <li>• Firmenname und Adresse</li>
              <li>• Kontaktdaten (Email, Telefon)</li>
              <li>• Steuer- und Bankinformationen</li>
              <li>• Angebotseinstellungen</li>
            </ul>
          </div>

          <div className="space-y-3 pt-2">
            <Button 
              onClick={handleCompleteSetup}
              className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-medium"
            >
              <Settings className="w-4 h-4 mr-2" />
              Jetzt einrichten
            </Button>
            
            <Button 
              onClick={handleSkip}
              variant="outline" 
              className="w-full text-gray-600"
            >
              Später
            </Button>
          </div>
          
          <p className="text-xs text-gray-500 text-center">
            Du kannst deine Firmeninformationen jederzeit in den Einstellungen bearbeiten.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
