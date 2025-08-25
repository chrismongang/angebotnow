'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MobileNavigation } from "@/components/mobile-navigation"
import { createQuote } from "@/lib/actions"
import { getFirstName } from "@/lib/user-data"
import { Image } from "@/components/ui/image"

export default function DashboardPage() {
  const [projectInfo, setProjectInfo] = useState('')
  const [clientName, setClientName] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [firstName, setFirstName] = useState('Max')

  // Load user data on component mount
  useEffect(() => {
    setFirstName(getFirstName())
  }, [])

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    setUploadError(null)
    
    if (!file) {
      setSelectedFile(null)
      setPreviewUrl(null)
      return
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) {
      setUploadError('Nur JPG, PNG und WebP Dateien sind erlaubt.')
      return
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('Datei ist zu groß. Maximale Größe: 10MB')
      return
    }

    setSelectedFile(file)
    
    // Create preview URL
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    
    if (!selectedFile || !projectInfo.trim() || !clientName.trim()) {
      return
    }

    setIsSubmitting(true)
    
    try {
      const formData = new FormData()
      formData.append('projectInfo', projectInfo.trim())
      formData.append('clientName', clientName.trim())
      formData.append('file', selectedFile)
      
      await createQuote(formData)
      
      // Reset form
      setProjectInfo('')
      setClientName('')
      setSelectedFile(null)
      setPreviewUrl(null)
      setUploadError(null)
      
      // Optional: Redirect to offers page or show success message
    } catch (error) {
      console.error('Error creating quote:', error)
      // Optional: Show error message
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <div className="min-h-screen bg-background p-4 sm:p-8 pb-20 md:pb-8">
        <div className="container mx-auto max-w-4xl">
          {/* Header with top spacing */}
          <div className="pt-8 sm:pt-12 mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-[#404040]">Willkommen!</h1>
            <p className="text-lg sm:text-xl text-[#676767]">{firstName}</p>
          </div>

          {/* Main Form Card */}
          <Card className="mb-6">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg sm:text-xl text-[#404040]">Angebot erstellen</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Image Upload Section */}
                <div className="space-y-3">
                  <Label className="text-base font-medium text-[#404040]">1. Baustellen-Foto hochladen</Label>
                  <div className="flex items-center justify-center gap-4">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <div className="w-16 h-16 bg-gradient-to-r from-[#F89813] to-[#FFB366] rounded-[14px] flex items-center justify-center shadow-md hover:shadow-lg transition-shadow">
                        <span className="text-white text-2xl font-bold">+</span>
                      </div>
                    </label>
                    
                    {previewUrl && (
                      <div className="flex items-center gap-3">
                        <Image
                          src={previewUrl}
                          alt="Preview"
                          className="w-20 h-20 rounded-lg border shadow-sm object-cover"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedFile(null)
                            setPreviewUrl(null)
                            setUploadError(null)
                          }}
                          className="text-red-600 border-red-600 hover:bg-red-600 hover:text-white"
                        >
                          Entfernen
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  {uploadError && (
                    <p className="text-red-600 text-sm">{uploadError}</p>
                  )}
                </div>

                {/* Project Information Section */}
                <div className="space-y-3">
                  <Label className="text-base font-medium text-[#404040]">2. Projektinformationen</Label>
                  <Textarea
                    value={projectInfo}
                    onChange={(e) => setProjectInfo(e.target.value)}
                    placeholder="Beschreiben Sie das Projekt..."
                    className="bg-[#EDEDED] border-[#EDEDED] focus:border-[#F89813] focus:ring-[#F89813] text-base min-h-24 resize-none rounded-[10px]"
                    required
                  />
                </div>

                {/* Client Name Section */}
                <div className="space-y-3">
                  <Label className="text-base font-medium text-[#404040]">3. Name des Auftraggebers</Label>
                  <Input
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Name des Kunden..."
                    className="bg-[#EDEDED] border-[#EDEDED] focus:border-[#F89813] focus:ring-[#F89813] h-12 text-base rounded-[10px]"
                    required
                  />
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={!selectedFile || !projectInfo.trim() || !clientName.trim() || isSubmitting}
                  className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-[#F89813] to-[#FFB366] hover:from-[#E88A0F] hover:to-[#F89813] border-0 shadow-lg rounded-[14px]"
                >
                  {isSubmitting ? 'Wird erstellt...' : 'Angebot erstellen'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
      <MobileNavigation />
    </>
  )
}
