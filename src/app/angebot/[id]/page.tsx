'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Image } from "@/components/ui/image"
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { formatDate, calculateTotal, calculateTotalWithVAT, formatPrice } from '@/lib/utils'
import { AIResult } from '@/lib/ai/provider'
import { updateQuotePositions } from '@/lib/actions'
import { MobileNavigation } from "@/components/mobile-navigation"
import { ArrowLeft, FileText, Download, Share2, Edit, Save, X, Crown } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Input } from "@/components/ui/input"


interface PageProps {
  params: {
    id: string
  }
}

export default function QuoteDetailPage({ params }: PageProps) {
  const { id } = params
  const { data: session } = useSession()
  const [quote, setQuote] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editedPositions, setEditedPositions] = useState<Array<{ title: string; qty: number; unit: string; price: number }>>([])
  const [isUpdating, setIsUpdating] = useState(false)
  const [canEdit, setCanEdit] = useState(false)

  useEffect(() => {
    const fetchQuote = async () => {
      try {
        const response = await fetch(`/api/quotes/${id}`)
        if (response.ok) {
          const data = await response.json()
          setQuote(data)
        } else {
          setError('Angebot nicht gefunden')
        }
      } catch (err) {
        setError('Fehler beim Laden des Angebots')
      } finally {
        setIsLoading(false)
      }
    }

    const checkEditPermissions = async () => {
      if (session?.user?.id) {
        try {
          const response = await fetch('/api/subscription/can-edit-positions')
          if (response.ok) {
            const data = await response.json()
            setCanEdit(data.canEdit)
          }
        } catch (error) {
          console.error('Error checking edit permissions:', error)
          setCanEdit(false)
        }
      }
    }

    fetchQuote()
    checkEditPermissions()
  }, [id, session])

  if (isLoading) {
    return (
      <>
        <div className="min-h-screen bg-background p-4 sm:p-8 pb-20 md:pb-8">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center py-12">
              <p className="text-[#676767]">Lade Angebot...</p>
            </div>
          </div>
        </div>
        <MobileNavigation />
      </>
    )
  }

  if (error || !quote) {
    notFound()
  }

  const aiData = quote.aiData as AIResult | null

  // Calculate correct totals
  const getQuoteTotal = (positions: Array<{ qty: number; price: number }>) => {
    const subtotal = calculateTotal(positions)
    return calculateTotalWithVAT(subtotal)
  }

  const getSubtotal = (positions: Array<{ qty: number; price: number }>) => {
    return calculateTotal(positions)
  }

  const getVAT = (positions: Array<{ qty: number; price: number }>) => {
    const subtotal = calculateTotal(positions)
    return calculateTotalWithVAT(subtotal) - subtotal
  }

  // Use edited positions if in editing mode, otherwise use original positions
  const currentPositions = isEditing ? editedPositions : (aiData?.positions || [])
  const total = getQuoteTotal(currentPositions)
  const subtotal = getSubtotal(currentPositions)
  const vat = getVAT(currentPositions)

  const handleShare = async () => {
    try {
      // Create personalized message
      const clientName = quote.clientName || 'Kunde'
      const projectDescription = quote.aiData?.description || 'Projekt'
      const personalizedMessage = `Hallo ${clientName}, hier ist Ihr Angebot zu folgendem Projekt: ${projectDescription}`
      
      // Fetch PDF for sharing
      const response = await fetch(`/api/quotes/${id}/pdf`)
      if (response.ok) {
        const blob = await response.blob()
        const fileName = quote.quoteNumber ? `Angebot_${quote.quoteNumber}.pdf` : `Angebot_${id}.pdf`
        const file = new File([blob], fileName, { type: 'application/pdf' })
        
        if (navigator.share) {
          try {
            await navigator.share({
              title: `Angebot ${quote.quoteNumber || quote.id}`,
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
            await fallbackToClipboard(personalizedMessage)
          }
        } else {
          // Fallback: copy link to clipboard
          await fallbackToClipboard(personalizedMessage)
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

  const fallbackToClipboard = async (personalizedMessage: string) => {
    try {
      if (typeof window !== 'undefined' && navigator.clipboard) {
        const url = `${window.location.origin}/api/quotes/${id}/pdf`
        const fullMessage = `${personalizedMessage}\n\nLink zum Angebot: ${url}`
        await navigator.clipboard.writeText(fullMessage)
        alert('Personalisierten Text mit Link zum Angebot wurde in die Zwischenablage kopiert!')
      }
    } catch (clipboardError) {
      console.error('Clipboard fallback failed:', clipboardError)
      alert('Fehler beim Kopieren des Links. Bitte laden Sie die PDF manuell herunter.')
    }
  }

  const handleSaveToAccounting = () => {
    // TODO: Implement accounting tool integration
    alert('Buchhaltungstool-Integration wird implementiert')
  }

  const handleEdit = () => {
    if (quote?.aiData?.positions) {
      setEditedPositions([...quote.aiData.positions])
      setIsEditing(true)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditedPositions([])
  }

  const handleSave = async () => {
    if (!quote || editedPositions.length === 0) return

    setIsUpdating(true)
    try {
      const result = await updateQuotePositions(quote.id, editedPositions)
      
      if (result.success) {
        // Update local state
        setQuote({
          ...quote,
          aiData: {
            ...quote.aiData,
            positions: editedPositions,
            total: editedPositions.reduce((sum, pos) => sum + (pos.qty * pos.price), 0)
          }
        })
        setIsEditing(false)
        setEditedPositions([])
        alert('Angebot erfolgreich aktualisiert!')
      } else {
        alert(result.error || 'Fehler beim Aktualisieren des Angebots')
      }
    } catch (error) {
      console.error('Error updating quote:', error)
      alert('Fehler beim Aktualisieren des Angebots')
    } finally {
      setIsUpdating(false)
    }
  }

  const updatePosition = (index: number, field: 'title' | 'qty' | 'unit' | 'price', value: string | number) => {
    const newPositions = [...editedPositions]
    newPositions[index] = {
      ...newPositions[index],
      [field]: field === 'qty' || field === 'price' ? Number(value) : value
    }
    setEditedPositions(newPositions)
  }

  const removePosition = (index: number) => {
    const newPositions = editedPositions.filter((_, i) => i !== index)
    setEditedPositions(newPositions)
  }

  return (
    <>
      <div className="min-h-screen bg-background p-4 sm:p-8 pb-20 md:pb-8">
        <div className="container mx-auto max-w-6xl">
          {/* Header with back button and title */}
          <div className="pt-8 sm:pt-12 mb-6 sm:mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center min-w-0 flex-1">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="mr-3 bg-[#F89813] hover:bg-[#E88A0F] text-white border-0 shadow-sm rounded-[14px] flex-shrink-0" 
                  asChild
                >
                  <Link href="/angebote">
                    <ArrowLeft size={20} className="text-white" />
                  </Link>
                </Button>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#404040] truncate">Angebot #{quote.quoteNumber || quote.id}</h1>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            {/* Left Column - PDF and Actions */}
            <div className="space-y-6 sm:space-y-8">
              {/* PDF Block - Similar to Success Block */}
              {quote.status === 'COMPLETED' ? (
                <Card>
                  <CardContent className="p-6">
                    {/* PDF Preview */}
                    <div className="flex justify-center mb-6">
                      <div className="bg-gray-100 rounded-[14px] p-4 inline-block">
                        <div className="text-center">
                          <div className="w-16 h-16 bg-[#F89813] rounded-[14px] flex items-center justify-center mx-auto mb-2">
                            <FileText className="h-8 w-8 text-white" />
                          </div>
                          <p className="text-sm text-gray-600">
                            {quote.quoteNumber ? `Angebot_${quote.quoteNumber}.pdf` : `Angebot_${quote.id}.pdf`}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3">
                      <Button 
                        asChild 
                        className="w-full h-12 border-orange-300 text-[#404040] hover:bg-orange-50 rounded-[14px]"
                        variant="outline"
                      >
                        <a href={`/api/quotes/${quote.id}/pdf`} target="_blank" rel="noopener noreferrer">
                          <Download className="h-5 w-5 mr-2 text-[#F89813]" />
                          PDF herunterladen
                        </a>
                      </Button>
                      
                      <Button 
                        className="w-full h-12 border-orange-300 text-[#404040] hover:bg-orange-50 rounded-[14px]"
                        variant="outline"
                        onClick={handleShare}
                      >
                        <Share2 className="h-5 w-5 mr-2 text-[#F89813]" />
                        An Kunden senden
                      </Button>
                      
                      <Button 
                        className="w-full h-12 border-orange-300 text-[#404040] hover:bg-orange-50 rounded-[14px]"
                        variant="outline"
                        onClick={handleSaveToAccounting}
                      >
                        <FileText className="h-5 w-5 mr-2 text-[#F89813]" />
                        In LexWare speichern
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="p-6 sm:p-8 text-center">
                    <div className="space-y-4">
                      <div className="text-4xl">
                        {quote.status === 'FAILED' ? 'Fehler' : 'Wird erstellt...'}
                      </div>
                      <p className="text-muted-foreground">
                        {quote.status === 'FAILED' 
                          ? 'Angebotserstellung fehlgeschlagen' 
                          : 'Angebot wird noch erstellt...'
                        }
                      </p>
                      {quote.status === 'FAILED' && (
                        <Button variant="outline" size="lg" className="h-12">
                          Erneut versuchen
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Project Info Block - Combined */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg sm:text-xl">Projektinfos</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Client Info */}
                  <div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-[#404040]">Auftraggeber</Label>
                      <p className="text-[#676767] py-2">{quote.clientName}</p>
                      {(quote.clientStreet || quote.clientCity) && (
                        <p className="text-[#676767] py-2">
                          {[quote.clientStreet, quote.clientCity].filter(Boolean).join(', ')}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {/* Project Image - Smaller */}
                  {quote.imagePath && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-2">Projektfoto</p>
                      <div className="w-32 h-32 rounded-lg overflow-hidden bg-[#EDEDED] flex-shrink-0">
                        <Image
                          src={quote.imagePath}
                          alt="Projektfoto"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  )}
                  
                  {/* AI Description */}
                  {aiData?.description && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Projektbeschreibung</p>
                      <p className="text-base leading-relaxed">{aiData.description}</p>
                    </div>
                  )}
                  
                  {/* Created Date */}
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Erstellt am</p>
                    <p className="text-base">{formatDate(quote.createdAt)}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - AI Analysis */}
            <div className="space-y-4 sm:space-y-6">
              {/* AI Analysis - Renamed */}
              {aiData && (
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <CardTitle className="text-base sm:text-lg lg:text-xl">Angebotskalkulation</CardTitle>
                      {!isEditing ? (
                        <div className="flex flex-col gap-2 self-start sm:self-auto">
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={!canEdit}
                            onClick={canEdit ? handleEdit : undefined}
                            className={`flex items-center gap-2 rounded-[14px] ${
                              canEdit 
                                ? 'text-[#F89813] border-[#F89813] hover:bg-[#F89813] hover:text-white' 
                                : 'text-gray-400 border-gray-300 bg-gray-50 cursor-not-allowed'
                            }`}
                          >
                            <Edit size={16} />
                            Bearbeiten
                          </Button>
                          
                          {!canEdit && (
                            <div className="flex items-center gap-2 text-sm text-gray-600 bg-orange-50 px-3 py-2 rounded-lg border border-orange-200">
                              <Crown className="w-4 h-4 text-orange-600" />
                              <span>Bearbeiten nur im Pro-Plan verfügbar</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex flex-col sm:flex-row gap-2 self-start sm:self-auto">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleCancel}
                            className="flex items-center gap-2 rounded-[14px]"
                          >
                            <X size={16} />
                            Abbrechen
                          </Button>
                          <Button
                            size="sm"
                            onClick={handleSave}
                            disabled={isUpdating}
                            className="bg-[#F89813] hover:bg-[#E88A0F] flex items-center gap-2 rounded-[14px]"
                          >
                            <Save size={16} />
                            Speichern
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {(isEditing ? editedPositions : aiData.positions) && (isEditing ? editedPositions : aiData.positions).length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-3">Positionen</p>
                        <div className="space-y-3">
                          {(isEditing ? editedPositions : aiData.positions).map((position, index) => (
                            <div key={index} className="p-3 bg-muted/50 rounded-lg">
                              {isEditing ? (
                                <div className="space-y-3">
                                  <div className="flex items-center justify-between">
                                    <Input
                                      value={position.title}
                                      onChange={(e) => updatePosition(index, 'title', e.target.value)}
                                      placeholder="Bezeichnung"
                                      className="bg-white flex-1 mr-2"
                                    />
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => removePosition(index)}
                                      className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2"
                                    >
                                      <X size={16} />
                                    </Button>
                                  </div>
                                  <div className="grid grid-cols-3 gap-2">
                                    <Input
                                      type="number"
                                      value={position.qty}
                                      onChange={(e) => updatePosition(index, 'qty', e.target.value)}
                                      placeholder="Menge"
                                      className="bg-white"
                                    />
                                    <Input
                                      value={position.unit}
                                      onChange={(e) => updatePosition(index, 'unit', e.target.value)}
                                      placeholder="Einheit"
                                      className="bg-white"
                                    />
                                    <Input
                                      type="number"
                                      step="0.01"
                                      value={position.price}
                                      onChange={(e) => updatePosition(index, 'price', e.target.value)}
                                      placeholder="Preis"
                                      className="bg-white"
                                    />
                                  </div>
                                </div>
                              ) : (
                                <div className="flex justify-between items-center">
                                  <div className="flex-1">
                                    <p className="font-medium">{position.title}</p>
                                    <p className="text-sm text-muted-foreground">
                                      {position.qty} {position.unit}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-medium">{formatPrice(position.qty * position.price)}</p>
                                    <p className="text-sm text-muted-foreground">
                                      {formatPrice(position.price)}/{position.unit}
                                    </p>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {total > 0 && (
                      <div className="pt-4 border-t space-y-2">
                        <div className="flex justify-between items-center">
                          <p className="text-sm text-muted-foreground">Zwischensumme</p>
                          <p className="text-sm">{formatPrice(subtotal)}</p>
                        </div>
                        <div className="flex justify-between items-center">
                          <p className="text-sm text-muted-foreground">19% MwSt.</p>
                          <p className="text-sm">{formatPrice(vat)}</p>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t">
                          <p className="text-lg font-semibold">Gesamtsumme</p>
                          <p className="text-2xl font-bold text-primary">{formatPrice(total)}</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="pb-20 md:pb-8"></div>
      <MobileNavigation />
    </>
  )
}
