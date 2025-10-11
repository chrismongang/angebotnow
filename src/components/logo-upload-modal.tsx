'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { X, Upload, AlertCircle, CheckCircle, Image as ImageIcon, Loader2 } from 'lucide-react'

interface LogoUploadModalProps {
  isOpen: boolean
  onClose: () => void
  onFileSelect: (file: File) => void
  isUploading: boolean
}

export function LogoUploadModal({ isOpen, onClose, onFileSelect, isUploading }: LogoUploadModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  if (!isOpen) return null

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validierung
    if (file.size > 5 * 1024 * 1024) {
      alert('Datei ist zu groß. Maximum: 5MB')
      return
    }

    if (!file.type.startsWith('image/')) {
      alert('Bitte wählen Sie eine Bilddatei aus')
      return
    }

    setSelectedFile(file)
    
    // Preview erstellen
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
  }

  const handleUpload = () => {
    if (selectedFile) {
      onFileSelect(selectedFile)
    }
  }

  const handleClose = () => {
    setSelectedFile(null)
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 p-4 pt-16">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[70vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-[#404040]">Firmenlogo hochladen</h2>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Logo Format Hinweise */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg text-[#404040] flex items-center gap-2">
                <AlertCircle size={20} className="text-blue-600" />
                Wichtige Hinweise zum Logo-Format
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
                <div className="flex items-start gap-2">
                  <AlertCircle size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-2">Empfehlung:</p>
                    <p className="mb-3">Verwenden Sie ein Logo mit transparentem Hintergrund für beste Ergebnisse in Ihren PDF-Angeboten.</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-green-50 border border-green-200 rounded-xl">
                  <div className="flex items-start gap-2">
                    <CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-green-800">
                      <p className="font-medium mb-2">Empfohlene Formate:</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>PNG mit transparentem Hintergrund</li>
                        <li>SVG (vektor-basiert)</li>
                        <li>Hohe Auflösung (300x300px oder höher)</li>
                        <li>Dateigröße unter 5MB</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                  <div className="flex items-start gap-2">
                    <X size={16} className="text-red-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-red-800">
                      <p className="font-medium mb-2">Vermeiden Sie:</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>JPG mit Hintergrund</li>
                        <li>Niedrige Auflösung</li>
                        <li>Sehr große Dateien</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* File Upload */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg text-[#404040]">Logo hochladen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="logo-file-input"
                  disabled={isUploading}
                />
                <label htmlFor="logo-file-input" className="cursor-pointer">
                  <div className={`
                    w-16 h-16 bg-gradient-to-r from-[#F89813] to-[#FFB366] rounded-[14px] 
                    flex items-center justify-center shadow-md hover:shadow-lg transition-shadow
                    ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
                  `}>
                    {isUploading ? (
                      <Loader2 className="text-white text-2xl animate-spin" />
                    ) : (
                      <Upload className="text-white text-2xl" />
                    )}
                  </div>
                </label>
              </div>

              {/* Preview */}
              {previewUrl && (
                <div className="space-y-2">
                  <h4 className="font-medium text-[#404040]">Vorschau:</h4>
                  <div className="flex items-center justify-center p-4 bg-gray-50 rounded-lg">
                    <img 
                      src={previewUrl} 
                      alt="Logo Vorschau" 
                      className="h-16 w-auto object-contain bg-white p-2 rounded border"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={handleClose}
              disabled={isUploading}
            >
              Abbrechen
            </Button>
            <Button 
              onClick={handleUpload}
              disabled={!selectedFile || isUploading}
              className="bg-[#F89813] hover:bg-[#E88A0F] text-white"
            >
              {isUploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Wird hochgeladen...
                </>
              ) : (
                <>
                  <Upload size={16} className="mr-2" />
                  Logo hochladen
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
