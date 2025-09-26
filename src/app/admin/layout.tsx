import { ReactNode } from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, FileText, MessageSquare, Home } from 'lucide-react'

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background p-4 sm:p-8 pb-20 md:pb-8">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="pt-8 sm:pt-12 mb-6 sm:mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-[#404040]">Admin Dashboard</h1>
              <p className="text-lg sm:text-xl text-[#676767]">Verwaltung und Übersicht</p>
            </div>
            <Button
              asChild
              variant="outline"
              className="border-[#F89813] text-[#F89813] hover:bg-[#F89813] hover:text-white"
            >
              <Link href="/dashboard">
                <Home className="h-4 w-4 mr-2" />
                Zur App
              </Link>
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <Card className="mb-6">
          <div className="p-4">
            <nav className="flex flex-wrap gap-2">
              <Button
                asChild
                variant="ghost"
                className="text-[#404040] hover:bg-[#F89813] hover:text-white"
              >
                <Link href="/admin">
                  <Home className="h-4 w-4 mr-2" />
                  Dashboard
                </Link>
              </Button>
              <Button
                asChild
                variant="ghost"
                className="text-[#404040] hover:bg-[#F89813] hover:text-white"
              >
                <Link href="/admin/nutzer">
                  <Users className="h-4 w-4 mr-2" />
                  Nutzer
                </Link>
              </Button>
              <Button
                asChild
                variant="ghost"
                className="text-[#404040] hover:bg-[#F89813] hover:text-white"
              >
                <Link href="/admin/angebote">
                  <FileText className="h-4 w-4 mr-2" />
                  Angebote
                </Link>
              </Button>
              <Button
                asChild
                variant="ghost"
                className="text-[#404040] hover:bg-[#F89813] hover:text-white"
              >
                <Link href="/admin/feedback">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Feedback
                </Link>
              </Button>
            </nav>
          </div>
        </Card>

        {/* Content */}
        {children}
      </div>
    </div>
  )
}


