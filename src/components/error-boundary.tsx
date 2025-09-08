'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RefreshCw, AlertTriangle } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error?: Error; resetError: () => void }>
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback
        return <FallbackComponent error={this.state.error} resetError={this.resetError} />
      }

      return <DefaultErrorFallback error={this.state.error} resetError={this.resetError} />
    }

    return this.props.children
  }
}

function DefaultErrorFallback({ error, resetError }: { error?: Error; resetError: () => void }) {
  const isChunkError = error?.message?.includes('chunk') || error?.message?.includes('ChunkLoadError')
  const router = useRouter()
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <CardTitle className="text-xl font-bold text-gray-800">
            {isChunkError ? 'Ladefehler' : 'Ein Fehler ist aufgetreten'}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <p className="text-gray-600 text-center">
            {isChunkError 
              ? 'Es gab ein Problem beim Laden der Seite. Bitte versuchen Sie es erneut.'
              : 'Entschuldigung, etwas ist schiefgelaufen. Bitte versuchen Sie es erneut.'
            }
          </p>
          
          <div className="space-y-3">
            <Button 
              onClick={() => {
                resetError()
                window.location.reload()
              }}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Seite neu laden
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => router.push('/')}
              className="w-full"
            >
              Zur Startseite
            </Button>
          </div>
          
          {process.env.NODE_ENV === 'development' && error && (
            <details className="mt-4 p-3 bg-gray-100 rounded-lg">
              <summary className="cursor-pointer text-sm font-medium text-gray-700">
                Fehlerdetails (nur in Entwicklung)
              </summary>
              <pre className="mt-2 text-xs text-gray-600 whitespace-pre-wrap">
                {error.message}
                {error.stack}
              </pre>
            </details>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default ErrorBoundary
