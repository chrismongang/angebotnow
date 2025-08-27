'use client'

import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { MobileNavigation } from "@/components/mobile-navigation"
import Link from 'next/link'
import { ArrowLeft, LogOut, Send, CheckCircle, AlertCircle } from 'lucide-react'

export default function AppSettingsPage() {
  const { data: session } = useSession()
  const [feedback, setFeedback] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')

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
        </div>
      </div>
      <MobileNavigation />
    </>
  )
}
