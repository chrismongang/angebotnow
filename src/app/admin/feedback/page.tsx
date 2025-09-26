'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { MessageSquare, Search, Filter, Download, RefreshCw, ThumbsUp, ThumbsDown, Star, Eye, Edit, Trash2 } from 'lucide-react'
import Link from 'next/link'

interface Feedback {
  id: string
  rating: 'UP' | 'DOWN' | 'NEUTRAL'
  text: string | null
  status: 'NEW' | 'TRIAGED' | 'IN_PROGRESS' | 'RESOLVED' | 'IGNORED'
  tags: string[]
  adminNotes: string | null
  createdAt: string
  updatedAt: string
  user: {
    id: string
    email: string
    name: string | null
    firstName: string | null
    lastName: string | null
  }
  quote: {
    id: string
    clientName: string
    projectInfo: string
    quoteNumber: string | null
    createdAt: string
  }
}

interface FeedbackStats {
  total: number
  recent: number
  satisfactionRate: number
  ratingBreakdown: {
    up: number
    down: number
    neutral: number
  }
  statusBreakdown: Record<string, number>
  topTags: Array<{ tag: string; count: number }>
  averageRating: number | null
  nonIgnoredBreakdown?: { up: number; down: number; neutral: number; total: number }
}

export default function AdminFeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [stats, setStats] = useState<FeedbackStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRating, setFilterRating] = useState<string>('')
  const [filterStatus, setFilterStatus] = useState<string>('')
  const [page, setPage] = useState(1)
  const [pageCount, setPageCount] = useState(1)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async (newPage = 1) => {
    try {
      setLoading(true)
      
      // Load feedbacks and stats in parallel
      const params = new URLSearchParams()
      if (searchTerm) params.set('q', searchTerm)
      if (filterRating) params.set('rating', filterRating)
      if (filterStatus) params.set('status', filterStatus)
      params.set('take', '50')
      params.set('page', String(newPage))

      const [feedbacksRes, statsRes] = await Promise.all([
        fetch(`/api/admin/feedback?${params.toString()}`),
        fetch('/api/admin/feedback/stats')
      ])

      if (feedbacksRes.ok) {
        const feedbacksData = await feedbacksRes.json()
        setFeedbacks(feedbacksData.items)
        setPage(newPage)
        setPageCount(feedbacksData.pageCount || 1)
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData)
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateFeedbackStatus = async (feedbackId: string, status: string) => {
    try {
      const response = await fetch('/api/admin/feedback', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          feedbackId,
          status
        })
      })

      if (response.ok) {
        // Reload data
        loadData()
      }
    } catch (error) {
      console.error('Error updating feedback:', error)
    }
  }

  // filtering moved server-side; client shows returned items
  const filteredFeedbacks = feedbacks;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'NEW': return 'bg-blue-100 text-blue-800'
      case 'TRIAGED': return 'bg-yellow-100 text-yellow-800'
      case 'IN_PROGRESS': return 'bg-orange-100 text-orange-800'
      case 'RESOLVED': return 'bg-green-100 text-green-800'
      case 'IGNORED': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getRatingIcon = (rating: string) => {
    switch (rating) {
      case 'UP': return <ThumbsUp className="h-4 w-4 text-green-600" />
      case 'DOWN': return <ThumbsDown className="h-4 w-4 text-red-600" />
      default: return <div className="h-4 w-4 rounded-full bg-gray-300" />
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-6 w-6 animate-spin text-[#F89813]" />
          <span className="ml-2 text-[#676767]">Lade Feedback-Daten...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#404040]">Feedback-Verwaltung</h2>
          <p className="text-[#676767]">Nutzerfeedback einsehen und verwalten</p>
        </div>
        <Button 
          onClick={() => loadData(page)}
          className="bg-gradient-to-r from-[#F89813] to-[#FFB366] hover:from-[#E88A0F] hover:to-[#F89813] border-0"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Aktualisieren
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <MessageSquare className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-lg font-bold text-[#404040]">{stats.total}</p>
                  <p className="text-xs text-[#676767]">Gesamt</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <ThumbsUp className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="text-lg font-bold text-[#404040]">{stats.ratingBreakdown.up}</p>
                  <p className="text-xs text-[#676767]">Positive</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                  <ThumbsDown className="h-4 w-4 text-red-600" />
                </div>
                <div>
                  <p className="text-lg font-bold text-[#404040]">{stats.ratingBreakdown.down}</p>
                  <p className="text-xs text-[#676767]">Negative</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Star className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-lg font-bold text-[#404040]">{stats.satisfactionRate}%</p>
                  <p className="text-xs text-[#676767]">Zufriedenheit</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#676767]" />
                <Input
                  placeholder="Nach Nutzer, Angebot oder Feedback-Text suchen..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-[#EDEDED] border-[#EDEDED] focus:border-[#F89813] focus:ring-[#F89813] rounded-xl"
                />
              </div>
            </div>
            <select
              value={filterRating}
              onChange={(e) => setFilterRating(e.target.value)}
              className="px-3 py-2 border border-[#EDEDED] rounded-xl bg-[#EDEDED] focus:border-[#F89813] focus:ring-[#F89813]"
            >
              <option value="">Alle Bewertungen</option>
              <option value="UP">Positiv</option>
              <option value="DOWN">Negativ</option>
              <option value="NEUTRAL">Neutral</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-[#EDEDED] rounded-xl bg-[#EDEDED] focus:border-[#F89813] focus:ring-[#F89813]"
            >
              <option value="">Alle Status</option>
              <option value="NEW">Neu</option>
              <option value="TRIAGED">Kategorisiert</option>
              <option value="IN_PROGRESS">In Bearbeitung</option>
              <option value="RESOLVED">Abgeschlossen</option>
              <option value="IGNORED">Ignoriert</option>
            </select>
            <Button variant="outline" onClick={() => loadData(1)} className="border-[#F89813] text-[#F89813] hover:bg-[#F89813] hover:text-white">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Feedback Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-[#404040]">
            Feedback-Übersicht ({filteredFeedbacks.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredFeedbacks.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-[#EDEDED] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="h-8 w-8 text-[#676767]" />
              </div>
              <h3 className="text-lg font-semibold text-[#404040] mb-2">Keine Feedbacks gefunden</h3>
              <p className="text-[#676767]">
                {feedbacks.length === 0 
                  ? 'Noch keine Feedbacks vorhanden.'
                  : 'Keine Feedbacks entsprechen den aktuellen Filtern.'
                }
              </p>
            </div>
          ) : (
            <>
            <div className="space-y-4">
              {filteredFeedbacks.map((feedback) => (
                <div key={feedback.id} className="p-4 border rounded-xl hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getRatingIcon(feedback.rating)}
                        <span className="font-medium text-[#404040]">
                          {feedback.user.email}
                        </span>
                        <Badge className={getStatusColor(feedback.status)}>
                          {feedback.status}
                        </Badge>
                        <span className="text-sm text-[#676767]">
                          {new Date(feedback.createdAt).toLocaleDateString('de-DE')}
                        </span>
                      </div>
                      
                      <div className="mb-2">
                        <p className="text-sm text-[#676767] mb-1">
                          Angebot: <span className="font-medium">{feedback.quote.clientName}</span>
                          {feedback.quote.quoteNumber && (
                            <span className="ml-2 text-xs bg-gray-100 px-2 py-1 rounded">
                              {feedback.quote.quoteNumber}
                            </span>
                          )}
                        </p>
                        <p className="text-sm text-[#676767]">
                          Projekt: {feedback.quote.projectInfo}
                        </p>
                      </div>

                      {feedback.text && (
                        <div className="p-3 bg-[#EDEDED] rounded-lg mb-2">
                          <p className="text-sm text-[#404040]">{feedback.text}</p>
                        </div>
                      )}

                      {feedback.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {feedback.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {feedback.adminNotes && (
                        <div className="p-2 bg-yellow-50 border border-yellow-200 rounded text-sm">
                          <p className="font-medium text-yellow-800 mb-1">Admin-Notizen:</p>
                          <p className="text-yellow-700">{feedback.adminNotes}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="border-[#F89813] text-[#F89813] hover:bg-[#F89813] hover:text-white"
                      >
                        <Link href={`/angebot/${feedback.quote.id}`}>
                          <Eye className="h-4 w-4 mr-1" />
                          Angebot
                        </Link>
                      </Button>
                      
                      <select
                        value={feedback.status}
                        onChange={(e) => updateFeedbackStatus(feedback.id, e.target.value)}
                        className="text-xs px-2 py-1 border border-gray-300 rounded bg-white"
                      >
                        <option value="NEW">Neu</option>
                        <option value="TRIAGED">Kategorisiert</option>
                        <option value="IN_PROGRESS">In Bearbeitung</option>
                        <option value="RESOLVED">Abgeschlossen</option>
                        <option value="IGNORED">Ignoriert</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {/* Pagination */}
            <div className="flex items-center justify-center gap-2 mt-4">
              <Button variant="outline" disabled={page <= 1 || loading} onClick={() => loadData(page - 1)} className="border-[#F89813] text-[#F89813] hover:bg-[#F89813] hover:text-white">Zurück</Button>
              <span className="text-sm text-[#676767]">Seite {page} von {pageCount}</span>
              <Button variant="outline" disabled={page >= pageCount || loading} onClick={() => loadData(page + 1)} className="border-[#F89813] text-[#F89813] hover:bg-[#F89813] hover:text-white">Weiter</Button>
            </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}


