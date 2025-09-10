'use client'

import { Suspense } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Home, ArrowLeft } from 'lucide-react'

// Force dynamic rendering to avoid prerendering issues
export const dynamic = 'force-dynamic'

function NotFoundContent() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-full flex items-center justify-center">
              <Home className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-800">
              Seite nicht gefunden
            </CardTitle>
            <p className="text-gray-600 mt-2">
              Die angeforderte Seite konnte nicht gefunden werden.
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="text-center space-y-4">
              <div className="bg-orange-50 p-4 rounded-lg">
                <p className="text-orange-800 text-sm">
                  <strong>Mögliche Ursachen:</strong>
                </p>
                <ul className="text-orange-700 text-sm mt-2 space-y-1">
                  <li>• Die URL wurde falsch eingegeben</li>
                  <li>• Die Seite wurde verschoben oder gelöscht</li>
                  <li>• Sie haben keinen Zugriff auf diese Seite</li>
                </ul>
              </div>

              <div className="flex flex-col gap-3">
                <Button
                  asChild
                  className="w-full h-12 bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-medium transition-all duration-200 rounded-xl shadow-sm"
                >
                  <Link href="/">
                    <Home className="w-4 h-4 mr-2" />
                    Zur Startseite
                  </Link>
                </Button>
                
                <Button
                  asChild
                  variant="outline"
                  className="w-full h-12 border-orange-300 text-orange-600 hover:bg-orange-50 font-medium transition-all duration-200 rounded-xl"
                >
                  <Link href="/dashboard">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Zum Dashboard
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function NotFound() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
                <p className="text-gray-600">Lade...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    }>
      <NotFoundContent />
    </Suspense>
  )
}
