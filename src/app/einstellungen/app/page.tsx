'use client'

// Force dynamic rendering to avoid prerendering issues
export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { MobileNavigation } from "@/components/mobile-navigation"
import { SubscriptionBanner } from "@/components/subscription-banner"
import Link from 'next/link'
import { ArrowLeft, LogOut, Send, CheckCircle, AlertCircle, Gift, Share2, Users, Zap } from 'lucide-react'

interface SubscriptionInfo {
  tier: 'FREE' | 'PRO';
  status: string;
  monthlyQuoteCount: number;
  remainingQuotes: number;
  limit: number;
  canEditPositions: boolean;
  canCustomizeLogo: boolean;
  referralCredits: number;
}

export default function AppSettingsPage() {
  const { data: session } = useSession()
  const [feedback, setFeedback] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [subscriptionInfo, setSubscriptionInfo] = useState<SubscriptionInfo | null>(null)
  const [referralCode, setReferralCode] = useState('')
  const [referralCredits, setReferralCredits] = useState(0)
  const [referralCount, setReferralCount] = useState(0)

  useEffect(() => {
    if (session?.user?.id) {
      loadSubscriptionInfo()
      loadReferralInfo()
    }
  }, [session])

  // Debug: Log referralCode changes
  useEffect(() => {
    console.log('referralCode state changed:', referralCode)
  }, [referralCode])

  const loadSubscriptionInfo = async () => {
    try {
      const response = await fetch('/api/subscription')
      if (response.ok) {
        const data = await response.json()
        setSubscriptionInfo(data)
      }
    } catch (error) {
      console.error('Error loading subscription info:', error)
    }
  }

  const loadReferralInfo = async () => {
    try {
      console.log('Loading referral info...')
      const response = await fetch('/api/referral/info')
      if (response.ok) {
        const data = await response.json()
        console.log('Referral info loaded:', data)
        setReferralCode(data.referralCode || '')
        setReferralCredits(data.referralCredits || 0)
        setReferralCount(data.referralCount || 0)
      } else {
        console.error('Failed to load referral info:', response.status, response.statusText)
      }
    } catch (error) {
      console.error('Error loading referral info:', error)
    }
  }

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!feedback.trim()) return

    setIsSubmitting(true)
    setSubmitStatus('idle')

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          feedback: feedback.trim(),
          userEmail: session?.user?.email || 'Unknown',
          userName: session?.user?.name || 'Unknown'
        }),
      })

      if (response.ok) {
        setSubmitStatus('success')
        setFeedback('')
        // Reset success message after 3 seconds
        setTimeout(() => setSubmitStatus('idle'), 3000)
      } else {
        setSubmitStatus('error')
      }
    } catch (error) {
      console.error('Error submitting feedback:', error)
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLogout = () => {
    signOut({ callbackUrl: '/' })
  }

  const handleNativeShare = async () => {
    console.log('handleNativeShare called, referralCode:', referralCode, 'window:', typeof window)
    if (!referralCode || typeof window === 'undefined') {
      console.log('Early return: referralCode missing or window undefined')
      return
    }

    const shareData = {
      title: `${session?.user?.name || 'Ein Freund'} lädt dich zu AngebotNow ein!`,
      text: `Du bekommst 2 GRATIS-Angebote! Registriere dich mit Code: ${referralCode}`,
      url: `${window.location.origin}/auth/signin?referral=${referralCode}`
    }

    console.log('Share data prepared:', shareData)
    console.log('navigator.share available:', !!navigator.share)

    try {
      if (navigator.share) {
        console.log('Attempting to share...')
        await navigator.share(shareData)
        console.log('Share successful')
        
        // Loops Event: referral_shared
        try {
          const response = await fetch('/api/loops/track-event', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: session?.user?.email || 'user@example.com',
              eventName: 'referral_shared',
              properties: {
                method: 'native_share',
                source: 'referral_program',
                inviteCode: referralCode
              }
            }),
          });
        } catch (loopsError) {
          console.error('Loops tracking failed:', loopsError);
        }
      } else {
        console.log('Web Share API not available, using clipboard fallback')
        // Fallback für Browser ohne Web Share API
        if (navigator.clipboard) {
          const link = shareData.url;
          await navigator.clipboard.writeText(link);
          console.log('Link copied to clipboard:', link)
          setSubmitStatus('success')
          setTimeout(() => setSubmitStatus('idle'), 2000)
        } else {
          console.log('Clipboard not available either')
        }
      }
    } catch (error) {
      console.error('Share failed:', error)
      // Fallback bei Fehlern
      if (navigator.clipboard) {
        try {
          await navigator.clipboard.writeText(shareData.url)
          console.log('Error fallback: Link copied to clipboard')
          setSubmitStatus('success')
          setTimeout(() => setSubmitStatus('idle'), 2000)
        } catch (clipboardError) {
          console.error('Clipboard fallback failed:', clipboardError)
        }
      }
    }
  }

  const isFreeUser = subscriptionInfo?.tier === 'FREE'

  return (
    <>
      <div className="min-h-screen bg-background p-4 sm:p-8 pb-20 md:pb-8">
        <div className="container mx-auto max-w-4xl">
          {/* Header with top spacing and back button */}
          <div className="pt-8 sm:pt-12 mb-6 sm:mb-8">
            <div className="flex items-center mb-4">
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
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#404040]">App-Einstellungen</h1>
            </div>
            <p className="text-[#676767]">Verwalte deine App-Einstellungen und gib uns Feedback</p>
          </div>

          {/* Subscription Banner */}
          <SubscriptionBanner />

          {/* Feedback Card */}
          <Card className="mb-6">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg sm:text-xl text-[#404040]">Feedback</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-[#404040]">
                    Teile uns deine Gedanken mit
                  </Label>
                  <Textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Dein Feedback, Verbesserungsvorschläge, Bug-Reports oder einfach was dir auf dem Herzen liegt..."
                    className="bg-[#EDEDED] border-[#EDEDED] focus:border-[#F89813] focus:ring-[#F89813] text-base min-h-32 resize-none rounded-[10px]"
                    required
                    disabled={isSubmitting}
                  />
                  <p className="text-xs text-[#676767]">
                    Wir freuen uns über jedes Feedback und werden es sorgfältig prüfen.
                  </p>
                </div>

                {/* Submit Status */}
                {submitStatus === 'success' && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2">
                    <CheckCircle size={16} className="text-green-600" />
                    <p className="text-sm text-green-800">Feedback erfolgreich gesendet! Vielen Dank.</p>
                  </div>
                )}
                
                {submitStatus === 'error' && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2">
                    <AlertCircle size={16} className="text-red-600" />
                    <p className="text-sm text-red-800">Fehler beim Senden. Bitte versuche es erneut.</p>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={!feedback.trim() || isSubmitting}
                  className="w-full h-12 text-base font-semibold bg-gradient-to-r from-[#F89813] to-[#FFB366] hover:from-[#E88A0F] hover:to-[#F89813] border-0 shadow-lg rounded-[14px] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Wird gesendet...
                    </div>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Feedback senden
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Referral Program Card - Only for Free Users */}
          {isFreeUser && (
            <Card className="mb-6">
                             <CardHeader className="pb-4">
                 <CardTitle className="text-lg sm:text-xl text-[#404040] flex items-center gap-2">
                   <Gift className="w-5 h-5 text-[#F89813]" />
                   Referral-Programm
                 </CardTitle>
               </CardHeader>
              <CardContent className="space-y-6">
                {/* Program Description */}
                <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                  <div className="text-center space-y-3">
                    <h3 className="text-lg font-semibold text-blue-900">
                      Verdiene Gratis-Credits durch Empfehlungen!
                    </h3>
                    <p className="text-blue-700 text-sm">
                      Lade Freunde ein und ihr bekommt beide 2 zusätzliche Angebote pro Monat!
                    </p>
                  </div>
                </div>

                                 {/* Current Status */}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="text-center p-4 bg-gray-50 rounded-lg">
                     <div className="text-2xl font-bold text-blue-600">{referralCount}</div>
                     <div className="text-sm text-gray-600">Erfolgreiche Empfehlungen</div>
                   </div>
                   <div className="text-center p-4 bg-gray-50 rounded-lg">
                     <div className="text-2xl font-bold text-green-600">{subscriptionInfo?.remainingQuotes || 0}</div>
                     <div className="text-sm text-gray-600">Verbleibende Angebote</div>
                   </div>
                 </div>



                {/* Share Button */}
                <div className="space-y-3">
                  <Button
                    onClick={handleNativeShare}
                    className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 border-0 shadow-lg rounded-[14px]"
                  >
                    <Share2 className="w-5 h-5 mr-2" />
                    Jetzt Freund einladen
                  </Button>
                  
                  <p className="text-xs text-gray-500 text-center">
                    Teile deinen Referral-Link mit Freunden und verdiene Credits
                  </p>
                </div>

                {/* How it works */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold text-[#404040] mb-3">So funktioniert es:</h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-[#F89813] rounded-full mt-2 flex-shrink-0"></div>
                      <span>Teile deinen Referral-Code mit Freunden</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-[#F89813] rounded-full mt-2 flex-shrink-0"></div>
                      <span>Freunde registrieren sich mit deinem Code</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-[#F89813] rounded-full mt-2 flex-shrink-0"></div>
                      <span>Ihr bekommt beide 2 Gratis-Credits</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-[#F89813] rounded-full mt-2 flex-shrink-0"></div>
                      <span>Credits können für zusätzliche Angebote verwendet werden</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Account Information Card */}
          <Card className="mb-6">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg sm:text-xl text-[#404040]">Account-Informationen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-[#404040]">Angemeldet als</Label>
                <p className="text-[#676767] py-2">{session?.user?.email || 'Nicht verfügbar'}</p>
              </div>
              
              <div className="pt-4">
                <Button 
                  variant="outline" 
                  onClick={handleLogout}
                  className="text-red-600 border-red-600 hover:bg-red-600 hover:text-white flex items-center gap-2 rounded-[14px]"
                >
                  <LogOut size={16} />
                  Sitzung beenden
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <MobileNavigation />
    </>
  )
}
