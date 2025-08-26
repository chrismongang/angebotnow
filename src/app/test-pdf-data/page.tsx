'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function TestPDFDataPage() {
  const { data: session, status } = useSession()
  const [userData, setUserData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [pdfData, setPdfData] = useState<any>(null)
  const [dbData, setDbData] = useState<any>(null)

  const loadUserData = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/user-data')
      if (response.ok) {
        const data = await response.json()
        setUserData(data)
      } else {
        console.error('Failed to load user data')
      }
    } catch (error) {
      console.error('Error loading user data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadDbData = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/test-db')
      if (response.ok) {
        const data = await response.json()
        setDbData(data)
      } else {
        console.error('Failed to load DB data')
      }
    } catch (error) {
      console.error('Error loading DB data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const testPDFGeneration = async () => {
    setIsLoading(true)
    try {
      // First, get a sample quote ID
      const quotesResponse = await fetch('/api/quotes')
      if (quotesResponse.ok) {
        const quotes = await quotesResponse.json()
        if (quotes.length > 0) {
          const quoteId = quotes[0].id
          
          // Test PDF generation
          const pdfResponse = await fetch(`/api/quotes/${quoteId}/pdf`)
          if (pdfResponse.ok) {
            setPdfData({
              success: true,
              message: 'PDF generated successfully',
              quoteId
            })
          } else {
            const error = await pdfResponse.text()
            setPdfData({
              success: false,
              message: 'PDF generation failed',
              error
            })
          }
        } else {
          setPdfData({
            success: false,
            message: 'No quotes found to test with'
          })
        }
      } else {
        setPdfData({
          success: false,
          message: 'Failed to fetch quotes'
        })
      }
    } catch (error) {
      console.error('Error testing PDF generation:', error)
      setPdfData({
        success: false,
        message: 'Error testing PDF generation',
        error: error
      })
    } finally {
      setIsLoading(false)
    }
  }

  const testRealPDF = async () => {
    setIsLoading(true)
    try {
      // Test PDF generation with real user data
      const response = await fetch('/api/test-real-pdf')
      if (response.ok) {
        // Create a download link for the PDF
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'test-real-pdf.pdf'
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        
        setPdfData({
          success: true,
          message: 'Real PDF generated and downloaded successfully'
        })
      } else {
        const error = await response.text()
        setPdfData({
          success: false,
          message: 'Real PDF generation failed',
          error
        })
      }
    } catch (error) {
      console.error('Error testing real PDF generation:', error)
      setPdfData({
        success: false,
        message: 'Error testing real PDF generation',
        error: error
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">PDF Daten Test</h1>
      
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Session Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>Status:</strong> {status}</p>
              {session && (
                <>
                  <p><strong>User ID:</strong> {session.user?.id}</p>
                  <p><strong>Email:</strong> {session.user?.email}</p>
                  <p><strong>Name:</strong> {session.user?.name}</p>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Benutzerdaten Test</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button 
                onClick={loadUserData} 
                disabled={isLoading || status !== 'authenticated'}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? 'Lade...' : 'Benutzerdaten laden'}
              </Button>
              
              {userData && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Geladene Benutzerdaten:</h3>
                  <pre className="text-sm overflow-auto">
                    {JSON.stringify(userData, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Datenbank Test</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button 
                onClick={loadDbData} 
                disabled={isLoading || status !== 'authenticated'}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {isLoading ? 'Lade...' : 'Datenbank-Daten laden'}
              </Button>
              
              {dbData && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Datenbank-Daten:</h3>
                  <pre className="text-sm overflow-auto">
                    {JSON.stringify(dbData, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>PDF Generierung Test</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Button 
                  onClick={testPDFGeneration} 
                  disabled={isLoading || status !== 'authenticated'}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isLoading ? 'Teste...' : 'Quote PDF testen'}
                </Button>
                
                <Button 
                  onClick={testRealPDF} 
                  disabled={isLoading || status !== 'authenticated'}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  {isLoading ? 'Teste...' : 'Echte Daten PDF'}
                </Button>
              </div>
              
              {pdfData && (
                <div className={`p-4 rounded-lg ${pdfData.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                  <h3 className={`font-semibold mb-2 ${pdfData.success ? 'text-green-800' : 'text-red-800'}`}>
                    {pdfData.success ? '✅ Erfolgreich' : '❌ Fehler'}
                  </h3>
                  <p className="text-sm mb-2">{pdfData.message}</p>
                  {pdfData.error && (
                    <pre className="text-xs overflow-auto bg-white p-2 rounded border">
                      {typeof pdfData.error === 'string' ? pdfData.error : JSON.stringify(pdfData.error, null, 2)}
                    </pre>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Debug Links</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button asChild variant="outline" className="w-full">
                <a href="/api/debug-user-data" target="_blank">
                  Debug User Data API
                </a>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <a href="/api/user-data" target="_blank">
                  User Data API
                </a>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <a href="/api/test-db" target="_blank">
                  Database Test API
                </a>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <a href="/api/quotes" target="_blank">
                  Quotes API
                </a>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <a href="/api/test-pdf-simple" target="_blank">
                  Simple PDF Test API
                </a>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <a href="/api/test-real-pdf" target="_blank">
                  Real PDF Test API
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
