'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MobileNavigation } from "@/components/mobile-navigation"
import Link from 'next/link'
import { ArrowLeft, Edit, Save, X, CheckCircle, AlertCircle } from 'lucide-react'
import { type UserData } from '@/lib/user-data'

export default function KontoPage() {
  const { data: session, status } = useSession()
  const [userData, setUserData] = useState<UserData | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle')

  // Load user data from database when session is available
  useEffect(() => {
    if (status === 'loading') return

    if (status === 'authenticated' && session?.user?.id) {
      loadUserData()
    } else if (status === 'unauthenticated') {
      // Fallback to localStorage for demo mode
      loadFromLocalStorage()
    }
  }, [status, session]) // eslint-disable-line react-hooks/exhaustive-deps

  const loadUserData = async () => {
    try {
      const response = await fetch('/api/user-data')
      if (response.ok) {
        const data = await response.json()
        setUserData(data)
      } else {
        // Fallback to localStorage if API fails
        loadFromLocalStorage()
      }
    } catch (error) {
      console.error('Error loading user data:', error)
      loadFromLocalStorage()
    } finally {
      setIsLoading(false)
    }
  }

  const loadFromLocalStorage = () => {
    try {
      const stored = localStorage.getItem('userData')
      if (stored) {
        setUserData(JSON.parse(stored))
      } else {
        // Use default data
        setUserData({
          firstName: 'Max',
          lastName: 'Mustermann',
          companyName: 'Inatros GmbH',
          street: 'Musterstraße 123',
          city: '90475 Nürnberg',
          email: 'info@inatros.de',
          phone: '+49 911 123456',
          companyLogo: '',
          taxNumber: 'DE123456789',
          vatNumber: 'DE123456789',
          bankName: 'Musterbank AG',
          bankAccount: 'DE89 3704 0044 0532 0130 00',
          bankBic: 'COBADEFFXXX',
          defaultQuotePrefix: 'AN',
          defaultCurrency: 'EUR',
          defaultPaymentTerms: '30 Tage netto',
          defaultValidity: '30 Tage',
          lastQuoteNumber: 0,
          currentYear: new Date().getFullYear()
        })
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (!userData) return

    setIsSaving(true)
    setSaveStatus('idle')

    try {
      if (status === 'authenticated') {
        // Save to database
        const response = await fetch('/api/user-data', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(userData),
        })

        if (response.ok) {
          setSaveStatus('success')
          setIsEditing(false)
        } else {
          setSaveStatus('error')
        }
      } else {
        // Save to localStorage for demo mode
        localStorage.setItem('userData', JSON.stringify(userData))
        setSaveStatus('success')
        setIsEditing(false)
      }
    } catch (error) {
      console.error('Error saving user data:', error)
      setSaveStatus('error')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    // Reload data from source
    if (status === 'authenticated') {
      loadUserData()
    } else {
      loadFromLocalStorage()
    }
    setIsEditing(false)
    setSaveStatus('idle')
  }

  // Show loading state while data is being loaded
  if (isLoading || !userData) {
    return (
      <>
        <div className="min-h-screen bg-background p-4 sm:p-8 pb-20 md:pb-8">
          <div className="container mx-auto max-w-4xl">
            <div className="text-center py-12">
              <p className="text-[#676767]">Lade Kontodaten...</p>
            </div>
          </div>
        </div>
        <MobileNavigation />
      </>
    )
  }

  return (
    <>
      <div className="min-h-screen bg-background p-4 sm:p-8 pb-20 md:pb-8">
        <div className="container mx-auto max-w-4xl">
          {/* Header with top spacing and back button */}
          <div className="pt-8 sm:pt-12 mb-6 sm:mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="mr-3 bg-[#F89813] hover:bg-[#E88A0F] text-white border-0 shadow-sm rounded-[14px]" 
                  asChild
                >
                  <Link href="/einstellungen">
                    <ArrowLeft size={20} className="text-white" />
                  </Link>
                </Button>
                <h1 className="text-2xl sm:text-3xl font-bold text-[#404040]">Dein Konto</h1>
              </div>
              
              {/* Global Edit Button */}
              {!isEditing ? (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setIsEditing(true)}
                  className="text-[#F89813] border-[#F89813] hover:bg-[#F89813] hover:text-white flex items-center gap-2 rounded-[14px]"
                >
                  <Edit size={16} />
                  Bearbeiten
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleCancel}
                    className="flex items-center gap-2 rounded-[14px]"
                    disabled={isSaving}
                  >
                    <X size={16} />
                    Abbrechen
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={handleSave}
                    className="bg-[#F89813] hover:bg-[#E88A0F] flex items-center gap-2 rounded-[14px]"
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Speichern...
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        Speichern
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
            <p className="text-[#676767]">Verwalten Sie Ihre Kontodaten und Firmeninformationen</p>
            
            {/* Save Status */}
            {saveStatus === 'success' && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2">
                <CheckCircle size={16} className="text-green-600" />
                <p className="text-sm text-green-800">Daten erfolgreich gespeichert!</p>
              </div>
            )}
            
            {saveStatus === 'error' && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2">
                <AlertCircle size={16} className="text-red-600" />
                <p className="text-sm text-red-800">Fehler beim Speichern. Bitte versuchen Sie es erneut.</p>
              </div>
            )}
            
            {/* PDF Integration Notice */}
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-xl">
              <p className="text-sm text-blue-800">
                <strong>Hinweis:</strong> Die hier eingegebenen Firmeninformationen werden automatisch in alle generierten PDF-Angebote eingefügt.
              </p>
            </div>

            {/* Storage Mode Notice */}
            {status === 'authenticated' ? (
              <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-xs text-green-700">
                  <strong>Datenbank-Modus:</strong> Ihre Daten werden sicher in der Cloud gespeichert.
                </p>
              </div>
            ) : (
              <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-xs text-yellow-700">
                  <strong>Demo-Modus:</strong> Daten werden lokal gespeichert. Melden Sie sich an für Cloud-Speicherung.
                </p>
              </div>
            )}
          </div>

          {/* Personal Information Card */}
          <Card className="mb-6">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg sm:text-xl text-[#404040]">Persönliche Informationen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-[#404040]">Vorname *</Label>
                  {isEditing ? (
                    <Input
                      value={userData.firstName}
                      onChange={(e) => setUserData({...userData, firstName: e.target.value})}
                      className="bg-[#EDEDED] border-[#EDEDED] focus:border-[#F89813] focus:ring-[#F89813] rounded-[10px]"
                    />
                  ) : (
                    <p className="text-[#676767] py-2">{userData.firstName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-[#404040]">Nachname *</Label>
                  {isEditing ? (
                    <Input
                      value={userData.lastName}
                      onChange={(e) => setUserData({...userData, lastName: e.target.value})}
                      className="bg-[#EDEDED] border-[#EDEDED] focus:border-[#F89813] focus:ring-[#F89813] rounded-[10px]"
                    />
                  ) : (
                    <p className="text-[#676767] py-2">{userData.lastName}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Company Information Card */}
          <Card className="mb-6">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg sm:text-xl text-[#404040]">Firmeninformationen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-[#404040]">Firmenname *</Label>
                  {isEditing ? (
                    <Input
                      value={userData.companyName}
                      onChange={(e) => setUserData({...userData, companyName: e.target.value})}
                      className="bg-[#EDEDED] border-[#EDEDED] focus:border-[#F89813] focus:ring-[#F89813] rounded-[10px]"
                    />
                  ) : (
                    <p className="text-[#676767] py-2">{userData.companyName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-[#404040]">Straße & Hausnummer *</Label>
                  {isEditing ? (
                    <Input
                      value={userData.street}
                      onChange={(e) => setUserData({...userData, street: e.target.value})}
                      className="bg-[#EDEDED] border-[#EDEDED] focus:border-[#F89813] focus:ring-[#F89813] rounded-[10px]"
                    />
                  ) : (
                    <p className="text-[#676767] py-2">{userData.street}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-[#404040]">PLZ & Ort *</Label>
                  {isEditing ? (
                    <Input
                      value={userData.city}
                      onChange={(e) => setUserData({...userData, city: e.target.value})}
                      className="bg-[#EDEDED] border-[#EDEDED] focus:border-[#F89813] focus:ring-[#F89813] rounded-[10px]"
                    />
                  ) : (
                    <p className="text-[#676767] py-2">{userData.city}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-[#404040]">E-Mail *</Label>
                    {isEditing ? (
                      <Input
                        type="email"
                        value={userData.email}
                        onChange={(e) => setUserData({...userData, email: e.target.value})}
                        className="bg-[#EDEDED] border-[#EDEDED] focus:border-[#F89813] focus:ring-[#F89813] rounded-[10px]"
                      />
                    ) : (
                      <p className="text-[#676767] py-2">{userData.email}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-[#404040]">Telefon</Label>
                    {isEditing ? (
                      <Input
                        value={userData.phone}
                        onChange={(e) => setUserData({...userData, phone: e.target.value})}
                        className="bg-[#EDEDED] border-[#EDEDED] focus:border-[#F89813] focus:ring-[#F89813] rounded-[10px]"
                      />
                    ) : (
                      <p className="text-[#676767] py-2">{userData.phone}</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Business Information Card */}
          <Card className="mb-6">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg sm:text-xl text-[#404040]">Geschäftsinformationen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-[#404040]">Steuernummer</Label>
                  {isEditing ? (
                    <Input
                      value={userData.taxNumber}
                      onChange={(e) => setUserData({...userData, taxNumber: e.target.value})}
                      className="bg-[#EDEDED] border-[#EDEDED] focus:border-[#F89813] focus:ring-[#F89813] rounded-[10px]"
                    />
                  ) : (
                    <p className="text-[#676767] py-2">{userData.taxNumber}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-[#404040]">USt-IdNr.</Label>
                  {isEditing ? (
                    <Input
                      value={userData.vatNumber}
                      onChange={(e) => setUserData({...userData, vatNumber: e.target.value})}
                      className="bg-[#EDEDED] border-[#EDEDED] focus:border-[#F89813] focus:ring-[#F89813] rounded-[10px]"
                    />
                  ) : (
                    <p className="text-[#676767] py-2">{userData.vatNumber}</p>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-[#404040]">Bankname</Label>
                  {isEditing ? (
                    <Input
                      value={userData.bankName}
                      onChange={(e) => setUserData({...userData, bankName: e.target.value})}
                      className="bg-[#EDEDED] border-[#EDEDED] focus:border-[#F89813] focus:ring-[#F89813] rounded-[10px]"
                    />
                  ) : (
                    <p className="text-[#676767] py-2">{userData.bankName}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-[#404040]">IBAN</Label>
                    {isEditing ? (
                      <Input
                        value={userData.bankAccount}
                        onChange={(e) => setUserData({...userData, bankAccount: e.target.value})}
                        className="bg-[#EDEDED] border-[#EDEDED] focus:border-[#F89813] focus:ring-[#F89813] rounded-[10px]"
                      />
                    ) : (
                      <p className="text-[#676767] py-2">{userData.bankAccount}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-[#404040]">BIC/SWIFT</Label>
                    {isEditing ? (
                      <Input
                        value={userData.bankBic}
                        onChange={(e) => setUserData({...userData, bankBic: e.target.value})}
                        className="bg-[#EDEDED] border-[#EDEDED] focus:border-[#F89813] focus:ring-[#F89813] rounded-[10px]"
                      />
                    ) : (
                      <p className="text-[#676767] py-2">{userData.bankBic}</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quote Settings Card */}
          <Card className="mb-6">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg sm:text-xl text-[#404040]">Angebot-Einstellungen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-[#404040]">Angebots-Präfix</Label>
                  {isEditing ? (
                    <Input
                      value={userData.defaultQuotePrefix}
                      onChange={(e) => setUserData({...userData, defaultQuotePrefix: e.target.value})}
                      className="bg-[#EDEDED] border-[#EDEDED] focus:border-[#F89813] focus:ring-[#F89813] rounded-[10px]"
                    />
                  ) : (
                    <p className="text-[#676767] py-2">{userData.defaultQuotePrefix}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-[#404040]">Währung</Label>
                  {isEditing ? (
                    <Input
                      value={userData.defaultCurrency}
                      onChange={(e) => setUserData({...userData, defaultCurrency: e.target.value})}
                      className="bg-[#EDEDED] border-[#EDEDED] focus:border-[#F89813] focus:ring-[#F89813] rounded-[10px]"
                    />
                  ) : (
                    <p className="text-[#676767] py-2">{userData.defaultCurrency}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-[#404040]">Zahlungsbedingungen</Label>
                  {isEditing ? (
                    <Input
                      value={userData.defaultPaymentTerms}
                      onChange={(e) => setUserData({...userData, defaultPaymentTerms: e.target.value})}
                      className="bg-[#EDEDED] border-[#EDEDED] focus:border-[#F89813] focus:ring-[#F89813] rounded-[10px]"
                    />
                  ) : (
                    <p className="text-[#676767] py-2">{userData.defaultPaymentTerms}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-[#404040]">Gültigkeit</Label>
                  {isEditing ? (
                    <Input
                      value={userData.defaultValidity}
                      onChange={(e) => setUserData({...userData, defaultValidity: e.target.value})}
                      className="bg-[#EDEDED] border-[#EDEDED] focus:border-[#F89813] focus:ring-[#F89813] rounded-[10px]"
                    />
                  ) : (
                    <p className="text-[#676767] py-2">{userData.defaultValidity}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <MobileNavigation />
    </>
  )
}
