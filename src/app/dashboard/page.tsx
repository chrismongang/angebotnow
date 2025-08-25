'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { createQuote } from '@/lib/actions'

export default function DashboardPage() {
  const [file, setFile] = useState<File | null>(null)
  const [projectInfo, setProjectInfo] = useState('')
  const [clientName, setClientName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    // Check file size (10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      alert('Datei ist zu groß. Maximale Größe: 10MB')
      return
    }

    // Check file type
    if (!selectedFile.type.startsWith('image/')) {
      alert('Bitte wählen Sie eine Bilddatei aus')
      return
    }

    setFile(selectedFile)

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target?.result as string)
    }
    reader.readAsDataURL(selectedFile)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file || !projectInfo.trim() || !clientName.trim()) {
      alert('Bitte füllen Sie alle Felder aus')
      return
    }

    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('projectInfo', projectInfo)
      formData.append('clientName', clientName)

      const result = await createQuote(formData)
      
      if (result.success) {
        alert('Angebot erfolgreich erstellt!')
        // Reset form
        setFile(null)
        setProjectInfo('')
        setClientName('')
        setPreview(null)
      } else {
        alert(`Fehler: ${result.error}`)
      }
    } catch (error) {
      alert('Ein Fehler ist aufgetreten')
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Erstellen Sie ein neues Angebot</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle>Foto hochladen</CardTitle>
              <CardDescription>
                Laden Sie ein Foto Ihres Projekts hoch (max. 10MB)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="file">Projektfoto</Label>
                <Input
                  id="file"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Unterstützte Formate: JPG, PNG, WebP (max. 10MB)
                </p>
              </div>
              
              {preview && (
                <div className="mt-4">
                  <p className="text-sm font-medium mb-2">Vorschau:</p>
                  <img 
                    src={preview} 
                    alt="Vorschau" 
                    className="max-w-xs rounded-xl border"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Project Info Section */}
          <Card>
            <CardHeader>
              <CardTitle>Projektinformationen</CardTitle>
              <CardDescription>
                Beschreiben Sie Ihr Projekt
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="projectInfo">Projektbeschreibung</Label>
                <Textarea
                  id="projectInfo"
                  placeholder="Beschreiben Sie Ihr Projekt, Anforderungen, Materialien, etc..."
                  value={projectInfo}
                  onChange={(e) => setProjectInfo(e.target.value)}
                  required
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Client Section */}
          <Card>
            <CardHeader>
              <CardTitle>Auftraggeber</CardTitle>
              <CardDescription>
                Informationen zum Kunden
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="clientName">Name des Auftraggebers</Label>
                <Input
                  id="clientName"
                  placeholder="Name oder Firma"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit Section */}
          <div className="flex justify-end">
            <Button 
              type="submit" 
              size="lg" 
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Wird erstellt...' : 'Angebot erstellen'}
            </Button>
          </div>
        </form>

        {/* Quick Actions */}
        <div className="mt-12">
          <h2 className="text-xl font-semibold mb-4">Schnellzugriff</h2>
          <div className="flex gap-4">
            <Button variant="outline" asChild>
              <a href="/angebote">Alle Angebote anzeigen</a>
            </Button>
            <Button variant="outline" asChild>
              <a href="/styleguide">Design System</a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
