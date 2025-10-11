'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Upload, X, AlertCircle, CheckCircle, Crown, Loader2 } from 'lucide-react'
import { LogoUploadModal } from './logo-upload-modal'

interface LogoUploadProps {
  currentLogo?: string
  onLogoChange: (logoUrl: string) => void
  isProUser: boolean
}

export function LogoUpload({ currentLogo, onLogoChange, isProUser }: LogoUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [showModal, setShowModal] = useState(false)

  const handleFileSelect = async (file: File) => {
    setIsUploading(true)
    setUploadError(null)
    setUploadSuccess(false)

    try {
      const formData = new FormData()
      formData.append('logo', file)

      const response = await fetch('/api/user-data/logo', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Upload fehlgeschlagen')
      }

      const { logoUrl } = await response.json()
      onLogoChange(logoUrl)
      setUploadSuccess(true)
      setShowModal(false)
      
      // Success message nach 3 Sekunden ausblenden
      setTimeout(() => setUploadSuccess(false), 3000)
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Upload fehlgeschlagen. Bitte versuchen Sie es erneut.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleDeleteLogo = async () => {
    if (!confirm('Möchten Sie das Logo wirklich entfernen?')) return

    setIsUploading(true)
    setUploadError(null)

    try {
      const response = await fetch('/api/user-data/logo', {
        method: 'DELETE'
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Löschen fehlgeschlagen')
      }

      onLogoChange('')
      setUploadSuccess(true)
      
      // Success message nach 3 Sekunden ausblenden
      setTimeout(() => setUploadSuccess(false), 3000)
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Löschen fehlgeschlagen. Bitte versuchen Sie es erneut.')
    } finally {
      setIsUploading(false)
    }
  }

  if (!isProUser) {
    return (
      <Card className="mb-6">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg sm:text-xl text-[#404040]">
            Firmenlogo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-6 bg-gradient-to-r from-[#F89813]/10 to-[#E88A0F]/10 border border-[#F89813]/20 rounded-lg text-center">
            <div className="space-y-4">
              <div className="mx-auto w-16 h-16 bg-[#F89813]/20 rounded-full flex items-center justify-center">
                <Crown size={32} className="text-[#F89813]" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[#404040] mb-2">
                  Logo-Upload ist nur für PRO-User verfügbar
                </h3>
                <p className="text-[#676767] mb-4">
                  Laden Sie Ihr Firmenlogo hoch und lassen Sie es automatisch in alle Ihre PDF-Angebote einfügen.
                </p>
                <Button 
                  className="bg-[#F89813] hover:bg-[#E88A0F] text-white"
                  onClick={() => window.location.href = '/einstellungen/app'}
                >
                  <Crown size={16} className="mr-2" />
                  Auf PRO upgraden
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className="mb-6">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg sm:text-xl text-[#404040]">Firmenlogo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Aktuelles Logo */}
          {currentLogo && (
            <div className="space-y-2">
              <Label className="text-sm font-medium text-[#404040]">Aktuelles Logo</Label>
              <div className="space-y-3">
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <img 
                    src={currentLogo} 
                    alt="Firmenlogo" 
                    className="h-16 w-auto object-contain bg-white p-2 rounded border"
                  />
                  <div className="flex-1">
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleDeleteLogo}
                    disabled={isUploading}
                    className="text-red-600 border-red-600 hover:bg-red-600 hover:text-white"
                  >
                    <X size={16} />
                    Entfernen
                  </Button>
                </div>
                <p className="text-sm text-gray-600 text-center">
                  Ihr Logo wird automatisch in alle PDF-Angebote eingefügt.
                </p>
              </div>
            </div>
          )}

          {/* Upload Button - nur anzeigen wenn kein Logo vorhanden */}
          {!currentLogo && (
            <div className="space-y-2">
              <Label className="text-sm font-medium text-[#404040]">
                Logo hochladen
              </Label>
              <div className="flex items-center justify-center">
                <button
                  onClick={() => setShowModal(true)}
                  disabled={isUploading}
                  className={`
                    w-16 h-16 bg-gradient-to-r from-[#F89813] to-[#FFB366] rounded-[14px] 
                    flex items-center justify-center shadow-md hover:shadow-lg transition-shadow
                    ${isUploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  `}
                >
                  {isUploading ? (
                    <Loader2 className="text-white text-2xl animate-spin" />
                  ) : (
                    <Upload className="text-white text-2xl" />
                  )}
                </button>
              </div>
            </div>
          )}


          {/* Fehler */}
          {uploadError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
              <AlertCircle size={16} className="text-red-600" />
              <p className="text-sm text-red-800">{uploadError}</p>
            </div>
          )}

          {/* Erfolg */}
          {uploadSuccess && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
              <CheckCircle size={16} className="text-green-600" />
              <p className="text-sm text-green-800">
                {currentLogo ? 'Logo erfolgreich aktualisiert!' : 'Logo erfolgreich hochgeladen!'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upload Modal */}
      <LogoUploadModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false)
        }}
        onFileSelect={handleFileSelect}
        isUploading={isUploading}
      />
    </>
  )
}
