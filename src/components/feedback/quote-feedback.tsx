'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ThumbsUp, ThumbsDown, CheckCircle, Loader2 } from 'lucide-react'

interface FeedbackData {
  id: string
  rating: 'UP' | 'DOWN' | 'NEUTRAL'
  text: string | null
  createdAt: string
  updatedAt: string
}

interface QuoteFeedbackProps {
  quoteId: string
  userId: string
}

export function QuoteFeedback({ quoteId, userId }: QuoteFeedbackProps) {
  const [feedback, setFeedback] = useState<FeedbackData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showTextInput, setShowTextInput] = useState(false)
  const [text, setText] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [showThankYou, setShowThankYou] = useState(false)

  // Feedback laden
  useEffect(() => {
    loadFeedback()
  }, [quoteId])

  const loadFeedback = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/feedback/${quoteId}`)
      if (response.ok) {
        const data = await response.json()
        setFeedback(data)
        setText(data?.text || '')
        setShowTextInput(!data?.text && !!data)
        setShowThankYou(!!data?.text)
      } else if (response.status === 404) {
        setFeedback(null)
      }
    } catch (error) {
      console.error('Error loading feedback:', error)
      setError('Fehler beim Laden des Feedbacks')
    } finally {
      setLoading(false)
    }
  }

  const saveFeedback = async (rating: 'UP' | 'DOWN' | 'NEUTRAL', withText = false) => {
    try {
      setSaving(true)
      setError(null)

      const response = await fetch(`/api/feedback/${quoteId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rating,
          text: withText ? (text.trim() || undefined) : undefined
        })
      })

      if (response.ok) {
        const data = await response.json()
        setFeedback(data.feedback)
        if (withText) {
          setShowTextInput(false)
          setShowThankYou(true)
        } else {
          setShowTextInput(true)
          setShowThankYou(false)
        }
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Fehler beim Speichern')
      }
    } catch (error) {
      console.error('Error saving feedback:', error)
      setError('Fehler beim Speichern des Feedbacks')
    } finally {
      setSaving(false)
    }
  }

  // Entfernt: deleteFeedback und Bearbeiten gemäß Lock-Regel

  if (loading) {
    return (
      <Card className="mt-6">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-[#F89813]" />
            <span className="ml-2 text-[#676767]">Lade Feedback...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="mt-6">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg text-[#404040]">Feedback</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            {error}
          </div>
        )}
        {/* Titel + Thumbs */}
        <div className="text-[#676767] -mt-2">Wie gut wurde dieses Angebot kalkuliert?</div>
        <div className="flex items-center gap-4 mt-2">
          <button
            disabled={saving || !!feedback?.text}
            onClick={() => { if (!feedback) saveFeedback('UP', false) }}
            className={`flex-1 h-14 rounded-[18px] border transition-colors ${
              feedback?.rating === 'UP'
                ? 'bg-[#F89813] border-[#F89813] text-white'
                : feedback?.rating === 'DOWN'
                  ? 'border-gray-300 text-gray-400'
                  : 'border-[#F89813] text-[#F89813] hover:bg-orange-50'
            } ${feedback?.text ? 'cursor-not-allowed' : ''}`}
          >
            <div className="flex items-center justify-center gap-2">
              <ThumbsUp className="h-5 w-5" />
            </div>
          </button>
          <button
            disabled={saving || !!feedback?.text}
            onClick={() => { if (!feedback) saveFeedback('DOWN', false) }}
            className={`flex-1 h-14 rounded-[18px] border transition-colors ${
              feedback?.rating === 'DOWN'
                ? 'bg-[#F89813] border-[#F89813] text-white'
                : feedback?.rating === 'UP'
                  ? 'border-gray-300 text-gray-400'
                  : 'border-[#F89813] text-[#F89813] hover:bg-orange-50'
            } ${feedback?.text ? 'cursor-not-allowed' : ''}`}
          >
            <div className="flex items-center justify-center gap-2">
              <ThumbsDown className="h-5 w-5" />
            </div>
          </button>
        </div>

        {showThankYou && (
          <div className="rounded-[18px] border border-green-400 bg-green-50 text-green-700 px-4 py-3">
            Danke für dein Feedback!
          </div>
        )}

        {/* Text-Eingabe */}
        {showTextInput && !feedback?.text && (
          <div className="space-y-3">
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Erzähle uns mehr..."
              className="bg-[#EDEDED] border-[#EDEDED] focus:border-[#F89813] focus:ring-[#F89813] rounded-xl resize-none"
              rows={3}
              maxLength={1000}
            />
            <div className="flex justify-between items-center text-xs text-[#676767]">
              <span>Wir freuen uns über jedes Feedback und werden es sorgfältig prüfen.</span>
              <span>{text.length}/1000</span>
            </div>
            
            <div>
              <Button
                onClick={() => feedback && saveFeedback(feedback.rating, true)}
                disabled={saving || text.trim().length === 0}
                className="w-full h-12 text-base bg-gradient-to-r from-[#F89813] to-[#FFB366] hover:from-[#E88A0F] hover:to-[#F89813] border-0 rounded-[14px]"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : null}
                Feedback senden
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
