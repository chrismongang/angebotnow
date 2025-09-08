'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import { AuthGuard } from "@/components/auth-guard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MobileNavigation } from "@/components/mobile-navigation"
import { PlanStatusMini } from "@/components/plan-status-mini"
import { PlanStatusBadge } from "@/components/plan-status-badge"
import { UpgradeSuccessModal } from "@/components/upgrade-success-modal"
import { createQuote } from "@/lib/actions"
import { Image } from "@/components/ui/image"
import { Upload, CheckCircle, AlertCircle, Loader2, Download, Share2, FileText, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { generateQuoteFileName } from '@/lib/user-data'
import { CompanyInfoModal } from '@/components/company-info-modal'
import { HardPaywallModal } from '@/components/hard-paywall-modal'

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  )
}

function DashboardContent() {
  const { data: session, status } = useSession()
  const searchParams = useSearchParams()
  const [projectInfo, setProjectInfo] = useState('')
  const [clientName, setClientName] = useState('')
  const [clientStreet, setClientStreet] = useState('')
  const [clientCity, setClientCity] = useState('')
  const [includeAddress, setIncludeAddress] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [progress, setProgress] = useState<'idle' | 'uploading' | 'processing' | 'success' | 'error' | 'upgrade-required'>('idle')
  const [progressMessage, setProgressMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [createdQuoteId, setCreatedQuoteId] = useState<string | null>(null)
  const [createdQuoteNumber, setCreatedQuoteNumber] = useState<string | null>(null)
  const [showUpgradeSuccess, setShowUpgradeSuccess] = useState(false)
  const [showHardPaywall, setShowHardPaywall] = useState(false)
  const router = useRouter()
  const [showCompanyModal, setShowCompanyModal] = useState(false)

  // Check for upgrade success URL parameter
  useEffect(() => {
    const success = searchParams.get('success')
    if (success === 'true') {
      setShowUpgradeSuccess(true)
      // Clean up URL parameter
      router.replace('/dashboard', { scroll: false })
      
      // Force refresh of subscription data to show updated plan status
      if (session?.user?.id) {
        // Trigger a page refresh to show updated subscription status
        setTimeout(() => {
          window.location.reload()
        }, 1000) // Small delay to show the modal first
      }
    }
  }, [searchParams, router, session?.user?.id])

  // Company Info Modal für neue User
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.id) {
      // Prüfen ob User den Modal bereits gesehen hat
      const hasSeenModal = localStorage.getItem('company-info-modal-seen')
      if (!hasSeenModal) {
        // Verzögerung für bessere UX
        const timer = setTimeout(() => {
          setShowCompanyModal(true)
        }, 1000)
        return () => clearTimeout(timer)
      }
    }
  }, [status, session])

  // Get user's first name from session
  const getUserFirstName = () => {
    // Try to get firstName from session user data first (with type assertion)
    const userWithFirstName = session?.user as any;
    if (userWithFirstName?.firstName) {
      return userWithFirstName.firstName;
    }
    
    // Fallback to parsing name field
    if (session?.user?.name) {
      const nameParts = session.user.name.split(' ')
      return nameParts[0] || null
    }
    return null
  }

  const downloadPDF = async (quoteId: string) => {
    try {
      const response = await fetch(`/api/quotes/${quoteId}/pdf`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        
        // Get filename from Content-Disposition header
        const contentDisposition = response.headers.get('Content-Disposition')
        let filename = `angebot_${quoteId}.pdf` // fallback
        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename="(.+)"/)
          if (filenameMatch) {
            filename = filenameMatch[1]
          }
        }
        
        a.download = filename
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        console.error('Failed to download PDF')
      }
    } catch (error) {
      console.error('Error downloading PDF:', error)
    }
  }

  const sharePDF = async (quoteId: string) => {
    try {
      // First fetch quote data to get client name and project description
      const quoteResponse = await fetch(`/api/quotes/${quoteId}`)
      if (!quoteResponse.ok) {
        throw new Error('Failed to fetch quote data')
      }
      const quoteData = await quoteResponse.json()
      
      // Create personalized message
      const clientName = quoteData.clientName || 'Kunde'
      const projectDescription = quoteData.aiData?.description || 'Projekt'
      const personalizedMessage = `Hallo ${clientName}, hier ist Ihr Angebot zu folgendem Projekt: ${projectDescription}`
      
      // Fetch PDF for sharing
      const response = await fetch(`/api/quotes/${quoteId}/pdf`)
      if (response.ok) {
        const blob = await response.blob()
        const fileName = quoteData.quoteNumber ? `Angebot_${quoteData.quoteNumber}.pdf` : `Angebot_${quoteId}.pdf`
        const file = new File([blob], fileName, { type: 'application/pdf' })
        
        if (navigator.share) {
          try {
            await navigator.share({
              title: `Angebot ${quoteData.quoteNumber || quoteId}`,
              text: personalizedMessage,
              files: [file]
            })
          } catch (shareError) {
            // Handle AbortError (user cancelled) and other share errors gracefully
            if (shareError instanceof Error && shareError.name === 'AbortError') {
              // User cancelled sharing - this is normal, no need to show error
              return
            }
            console.log('Share API failed, falling back to clipboard:', shareError)
            // Fallback to clipboard
            await fallbackToClipboard(quoteId, personalizedMessage)
          }
        } else {
          // Fallback: copy link to clipboard
          await fallbackToClipboard(quoteId, personalizedMessage)
        }
      } else {
        console.error('Failed to fetch PDF for sharing')
        alert('Fehler beim Laden der PDF für das Teilen.')
      }
    } catch (error) {
      console.error('Error sharing PDF:', error)
      alert('Fehler beim Teilen der PDF.')
    }
  }

  const fallbackToClipboard = async (quoteId: string, personalizedMessage: string) => {
    try {
      const url = `${window.location.origin}/api/quotes/${quoteId}/pdf`
      const fullMessage = `${personalizedMessage}\n\nLink zum Angebot: ${url}`
      await navigator.clipboard.writeText(fullMessage)
      alert('Personalisierten Text mit Link zum Angebot wurde in die Zwischenablage kopiert!')
    } catch (clipboardError) {
      console.error('Clipboard fallback failed:', clipboardError)
      alert('Fehler beim Kopieren des Links. Bitte laden Sie die PDF manuell herunter.')
    }
  }

  const saveToAccounting = async (quoteId: string) => {
    // TODO: Implement integration with accounting tools like LexWare, sevDesk, etc.
    // Verwende eine benutzerfreundliche Benachrichtigung statt alert
    setUploadError('Diese Funktion wird in Zukunft implementiert. Die PDF wird dann automatisch in Ihr verknüpftes Buchhaltungstool gespeichert.')
    setTimeout(() => setUploadError(null), 5000)
  }

  const saveAsDraft = async (quoteId: string) => {
    try {
      // TODO: Update quote status to 'DRAFT' in database
      // Verwende eine benutzerfreundliche Benachrichtigung statt alert
      setUploadError('Angebot wurde als Entwurf gespeichert. Sie können es später in der Angebotsübersicht bearbeiten.')
      setTimeout(() => setUploadError(null), 3000)
      router.push('/angebote')
    } catch (error) {
      console.error('Error saving as draft:', error)
    }
  }

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
    setProgress('uploading')
    setProgressMessage('Bild wird hochgeladen...')
    
    try {
      const formData = new FormData()
      formData.append('projectInfo', projectInfo)
      formData.append('clientName', clientName)
      formData.append('clientStreet', clientStreet)
      formData.append('clientCity', clientCity)
      formData.append('includeAddress', includeAddress.toString())
      if (selectedFile) {
        formData.append('file', selectedFile)
      }
      
      setProgress('processing')
      setProgressMessage('KI analysiert das Projekt...')
      
      const result = await createQuote(formData)
      
      if (result.success) {
        setProgress('success')
        setProgressMessage('Angebot erfolgreich erstellt!')
        setCreatedQuoteId(result.quoteId || null)
        setCreatedQuoteNumber(result.quoteNumber || null) // Store quote number
        
        // Reset form
        setProjectInfo('')
        setClientName('')
        setSelectedFile(null)
        setPreviewUrl(null)
        setUploadError(null)
        
        // Don't auto-redirect, let user choose what to do next
      } else {
        setProgress('error')
        setProgressMessage(result.error || 'Ein Fehler ist aufgetreten')
        
        // Check if upgrade is required
        if (result.requiresUpgrade) {
          setProgress('upgrade-required')
          setShowHardPaywall(true)
        }
      }
    } catch (error) {
      console.error('Error creating quote:', error)
      setProgress('error')
      setProgressMessage('Ein unerwarteter Fehler ist aufgetreten')
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setProjectInfo('')
    setClientName('')
    setClientStreet('')
    setClientCity('')
    setIncludeAddress(false)
    setSelectedFile(null)
    setPreviewUrl(null)
    setUploadError(null)
    setProgress('idle')
    setProgressMessage('')
    setCreatedQuoteId(null)
    setCreatedQuoteNumber(null) // Reset quote number
  }

  // Success Block Component
  const SuccessBlock = () => {
    // Generate structured filename for display
    const getDisplayFileName = () => {
      if (!createdQuoteNumber) return 'Angebot.pdf'
      
      // Use the same format as in the detail page
      return `Angebot_${createdQuoteNumber}.pdf`
    }

    return (
      <Card className="mb-6">
        <CardContent className="p-6">
          {/* Header with green checkmark */}
          <div className="flex items-center gap-3 mb-6">
            <CheckCircle className="h-6 w-6 text-green-600" />
            <h2 className="text-xl font-bold text-[#404040]">Dein Angebot ist fertig</h2>
          </div>

          {/* PDF Preview */}
          <div className="flex justify-center mb-6">
            <div className="bg-gray-100 rounded-[14px] p-4 inline-block">
              <div className="text-center">
                <div className="w-16 h-16 bg-[#F89813] rounded-[14px] flex items-center justify-center mx-auto mb-2">
                  <FileText className="h-8 w-8 text-white" />
                </div>
                <p className="text-sm text-gray-600">
                  {getDisplayFileName()}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={() => createdQuoteId && downloadPDF(createdQuoteId)}
              variant="outline"
              className="w-full h-12 border-orange-300 text-[#404040] hover:bg-orange-50 rounded-[14px]"
            >
              <Download className="h-5 w-5 mr-2 text-[#F89813]" />
              PDF herunterladen
            </Button>
            
            <Button
              onClick={() => createdQuoteId && sharePDF(createdQuoteId)}
              variant="outline"
              className="w-full h-12 border-orange-300 text-[#404040] hover:bg-orange-50 rounded-[14px]"
            >
              <Share2 className="h-5 w-5 mr-2 text-[#F89813]" />
              An Kunden senden
            </Button>
            
            <Button
              onClick={() => createdQuoteId && saveToAccounting(createdQuoteId)}
              variant="outline"
              className="w-full h-12 border-orange-300 text-[#404040] hover:bg-orange-50 rounded-[14px]"
            >
              <FileText className="h-5 w-5 mr-2 text-[#F89813]" />
              In LexWare speichern
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="min-h-screen bg-background p-4 sm:p-8 pb-20 md:pb-8">
        <div className="container mx-auto max-w-4xl">
          {/* Header with top spacing */}
          <div className="pt-8 sm:pt-12 mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-[#404040]">Willkommen!</h1>
            {getUserFirstName() && (
              <div className="flex items-center gap-3">
                <p className="text-lg sm:text-xl text-[#676767]">{getUserFirstName()}</p>
                <PlanStatusBadge />
              </div>
            )}
          </div>

          {/* Plan Status Mini */}
          <PlanStatusMini />

          {/* Progress Indicator */}
          {progress !== 'idle' && progress !== 'success' && (
            <Card className="mb-6 border-l-4 border-l-[#F89813]">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  {progress === 'uploading' && <Loader2 className="h-5 w-5 animate-spin text-[#F89813]" />}
                  {progress === 'processing' && <Loader2 className="h-5 w-5 animate-spin text-[#F89813]" />}
                  {progress === 'error' && <AlertCircle className="h-5 w-5 text-red-600" />}
                  {progress === 'upgrade-required' && <AlertCircle className="h-5 w-5 text-orange-600" />}
                  
                  <div className="flex-1">
                    <p className="font-medium text-[#404040]">
                      {progress === 'uploading' && 'Bild-Upload läuft...'}
                      {progress === 'processing' && 'KI-Verarbeitung läuft...'}
                      {progress === 'error' && 'Fehler aufgetreten'}
                      {progress === 'upgrade-required' && 'Angebot-Limit erreicht'}
                    </p>
                    <p className="text-sm text-[#676767]">{progressMessage}</p>
                  </div>
                  
                  {progress === 'error' && (
                    <Button
                      onClick={resetForm}
                      variant="outline"
                      size="sm"
                      className="text-red-600 border-red-600 hover:bg-red-600 hover:text-white"
                    >
                      Erneut versuchen
                    </Button>
                  )}
                  
                  {progress === 'upgrade-required' && (
                    <Button
                      onClick={() => router.push('/einstellungen/app')}
                      variant="outline"
                      size="sm"
                      className="text-orange-600 border-orange-600 hover:bg-orange-600 hover:text-white"
                    >
                      Jetzt upgraden
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Success Block */}
          {progress === 'success' && <SuccessBlock />}

          {/* Main Form Card - only show if not in success state */}
          {progress !== 'success' && (
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
                        disabled={isSubmitting}
                      />
                      <label htmlFor="file-upload" className="cursor-pointer">
                        <div className={`
                          w-16 h-16 bg-gradient-to-r from-[#F89813] to-[#FFB366] rounded-[14px] 
                          flex items-center justify-center shadow-md hover:shadow-lg transition-shadow
                          ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}
                        `}>
                          {selectedFile ? (
                            <CheckCircle className="text-white text-2xl" />
                          ) : (
                            <Upload className="text-white text-2xl" />
                          )}
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
                            disabled={isSubmitting}
                            className="text-red-600 border-red-600 hover:bg-red-600 hover:text-white"
                          >
                            Entfernen
                          </Button>
                        </div>
                      )}
                    </div>
                    
                    {uploadError && (
                      <p className="text-red-600 text-sm flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        {uploadError}
                      </p>
                    )}
                  </div>

                  {/* Project Information Section */}
                  <div className="space-y-3">
                    <Label className="text-base font-medium text-[#404040]">2. Projektinformationen</Label>
                    <Textarea
                      value={projectInfo}
                      onChange={(e) => setProjectInfo(e.target.value)}
                      placeholder="Beschreiben Sie das Projekt detailliert..."
                      className="bg-[#EDEDED] border-[#EDEDED] focus:border-[#F89813] focus:ring-[#F89813] text-base min-h-24 resize-none rounded-[10px]"
                      required
                      disabled={isSubmitting}
                    />
                    <p className="text-xs text-[#676767]">
                      Je detaillierter die Beschreibung, desto präziser die KI-Analyse
                    </p>
                  </div>

                  {/* Client Name Section */}
                  <div className="space-y-3">
                    <Label className="text-base font-medium text-[#404040]">3. Name des Auftraggebers</Label>
                    <Input
                      type="text"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="Vor- & Nachname oder Firmenname"
                      className="bg-[#EDEDED] border-[#EDEDED] focus:border-[#F89813] focus:ring-[#F89813] h-12 text-base rounded-[10px]"
                      required
                      disabled={isSubmitting}
                    />
                  </div>

                  {/* Address Section */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="includeAddress"
                        checked={includeAddress}
                        onChange={(e) => setIncludeAddress(e.target.checked)}
                        className="w-4 h-4 text-[#F89813] bg-[#EDEDED] border-[#EDEDED] rounded focus:ring-[#F89813] focus:ring-2"
                        disabled={isSubmitting}
                      />
                      <Label htmlFor="includeAddress" className="text-base font-medium text-[#404040] cursor-pointer">
                        Adresse hinzufügen
                      </Label>
                    </div>
                    
                    {includeAddress && (
                      <div className="space-y-3 pl-6">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-[#404040]">Straße & Hausnummer</Label>
                          <Input
                            type="text"
                            value={clientStreet}
                            onChange={(e) => setClientStreet(e.target.value)}
                            placeholder="Musterstraße 123"
                            className="bg-[#EDEDED] border-[#EDEDED] focus:border-[#F89813] focus:ring-[#F89813] h-12 text-base rounded-[10px]"
                            required={includeAddress}
                            disabled={isSubmitting}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-[#404040]">PLZ & Ort</Label>
                          <Input
                            type="text"
                            value={clientCity}
                            onChange={(e) => setClientCity(e.target.value)}
                            placeholder="90475 Nürnberg"
                            className="bg-[#EDEDED] border-[#EDEDED] focus:border-[#F89813] focus:ring-[#F89813] h-12 text-base rounded-[10px]"
                            required={includeAddress}
                            disabled={isSubmitting}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={
                      !selectedFile || 
                      !projectInfo.trim() || 
                      !clientName.trim() || 
                      (includeAddress && (!clientStreet.trim() || !clientCity.trim())) ||
                      isSubmitting
                    }
                    className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-[#F89813] to-[#FFB366] hover:from-[#E88A0F] hover:to-[#F89813] border-0 shadow-lg rounded-[14px] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Angebot wird erstellt...
                      </div>
                    ) : (
                      'Angebot erstellen'
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {/* New Offer Button - only show in success state */}
          {progress === 'success' && (
            <Button
              onClick={resetForm}
              className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-[#F89813] to-[#FFB366] hover:from-[#E88A0F] hover:to-[#F89813] border-0 shadow-lg rounded-[14px]"
            >
              <Plus className="h-5 w-5 mr-2" />
              Neues Angebot erstellen
            </Button>
          )}


        </div>
      </div>
      
      {/* Hard Paywall Modal */}
      <HardPaywallModal
        isOpen={showHardPaywall}
        onClose={() => setShowHardPaywall(false)}
        onUpgrade={() => {
          setShowHardPaywall(false)
          // Redirect to upgrade page using Next.js router to maintain PWA context
          router.push('/einstellungen/app')
        }}
        remainingQuotes={0}
        limit={5}
        userEmail={session?.user?.email || undefined}
        userName={getUserFirstName() || session?.user?.name || undefined}
      />
      
      {/* Upgrade Success Modal */}
      <UpgradeSuccessModal 
        isOpen={showUpgradeSuccess}
        onClose={() => setShowUpgradeSuccess(false)}
      />
      
      {/* Company Info Modal */}
      <CompanyInfoModal 
        isOpen={showCompanyModal}
        onClose={() => setShowCompanyModal(false)}
      />
      
      <MobileNavigation />
    </>
  )
}
