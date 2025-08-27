'use client'

import { SessionProvider } from "next-auth/react"
import { Suspense } from "react"

// Loading-Fallback für SessionProvider
function SessionLoadingFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-2"></div>
        <p className="text-sm text-gray-600">Lade Session...</p>
      </div>
    </div>
  )
}

export default function AuthProvider({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  return (
    <Suspense fallback={<SessionLoadingFallback />}>
      <SessionProvider 
        refetchInterval={5 * 60} // 5 Minuten
        refetchOnWindowFocus={false}
      >
        {children}
      </SessionProvider>
    </Suspense>
  )
}
