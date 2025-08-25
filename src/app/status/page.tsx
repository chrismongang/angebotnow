import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MobileNavigation } from "@/components/mobile-navigation"

type BadgeVariant = "default" | "secondary" | "destructive" | "outline"

export default function StatusPage() {
  const services = [
    {
      name: 'Datenbank',
      status: process.env.DATABASE_URL ? 'Verfügbar' : 'Nicht konfiguriert',
      variant: (process.env.DATABASE_URL ? 'default' : 'destructive') as BadgeVariant,
      description: process.env.DATABASE_URL ? 'PostgreSQL-Datenbank ist verbunden' : 'DATABASE_URL fehlt in den Umgebungsvariablen',
      icon: '🗄️'
    },
    {
      name: 'Cloudinary',
      status: process.env.CLOUDINARY_CLOUD_NAME ? 'Verfügbar' : 'Nicht konfiguriert',
      variant: (process.env.CLOUDINARY_CLOUD_NAME ? 'default' : 'secondary') as BadgeVariant,
      description: process.env.CLOUDINARY_CLOUD_NAME ? 'Bild-Upload ist aktiv' : 'Verwendet Placeholder-Bilder',
      icon: '☁️'
    },
    {
      name: 'OpenAI',
      status: process.env.OPENAI_API_KEY ? 'Verfügbar' : 'Mock-Modus',
      variant: (process.env.OPENAI_API_KEY ? 'default' : 'outline') as BadgeVariant,
      description: process.env.OPENAI_API_KEY ? 'GPT-4o-mini AI-Verarbeitung' : 'Verwendet Mock-AI für Tests',
      icon: '🤖'
    },
    {
      name: 'Sentry',
      status: process.env.SENTRY_DSN ? 'Aktiv' : 'Nicht konfiguriert',
      variant: (process.env.SENTRY_DSN ? 'default' : 'secondary') as BadgeVariant,
      description: process.env.SENTRY_DSN ? 'Error-Tracking ist aktiv' : 'Kein Error-Monitoring',
      icon: '📊'
    }
  ]

  return (
    <>
      <div className="min-h-screen bg-background p-4 sm:p-8 pb-20 md:pb-8">
        <div className="container mx-auto max-w-4xl">
          {/* Mobile-optimierter Header */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">System Status</h1>
            <p className="text-muted-foreground">
              Aktueller Status aller Services und Konfigurationen
            </p>
          </div>

          {/* Mobile-optimierte Service Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {services.map((service) => (
              <Card key={service.name} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{service.icon}</span>
                      <CardTitle className="text-base sm:text-lg">{service.name}</CardTitle>
                    </div>
                    <Badge variant={service.variant} className="text-xs">
                      {service.status}
                    </Badge>
                  </div>
                  <CardDescription className="text-sm">
                    {service.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>

          {/* Mobile-optimierte Deployment Info */}
          <Card className="mt-6 sm:mt-8">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg sm:text-xl">🔧 Deployment-Informationen</CardTitle>
              <CardDescription>
                Technische Details zur aktuellen Installation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <span className="font-medium">Node.js Environment:</span>
                  <p className="text-muted-foreground">{process.env.NODE_ENV || 'development'}</p>
                </div>
                <div className="space-y-1">
                  <span className="font-medium">Next.js Version:</span>
                  <p className="text-muted-foreground">15.5.0</p>
                </div>
                <div className="space-y-1">
                  <span className="font-medium">Build Time:</span>
                  <p className="text-muted-foreground">{new Date().toLocaleString('de-DE')}</p>
                </div>
                <div className="space-y-1">
                  <span className="font-medium">Turbopack:</span>
                  <p className="text-muted-foreground">Aktiviert</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Mobile-optimierte Next Steps */}
          <Card className="mt-6 sm:mt-8">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg sm:text-xl">📋 Nächste Schritte</CardTitle>
              <CardDescription>
                Empfohlene Konfigurationen für Produktionsumgebung
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {!process.env.DATABASE_URL && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm font-medium text-yellow-800">
                      🔴 DATABASE_URL konfigurieren
                    </p>
                    <p className="text-sm text-yellow-700 mt-1">
                      Setzen Sie DATABASE_URL in den Umgebungsvariablen für vollständige Funktionalität.
                    </p>
                  </div>
                )}
                
                {!process.env.CLOUDINARY_CLOUD_NAME && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm font-medium text-blue-800">
                      🟡 Cloudinary konfigurieren (optional)
                    </p>
                    <p className="text-sm text-blue-700 mt-1">
                      Für echte Bild-Uploads: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
                    </p>
                  </div>
                )}
                
                {!process.env.OPENAI_API_KEY && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm font-medium text-green-800">
                      🟢 OpenAI konfigurieren (optional)
                    </p>
                    <p className="text-sm text-green-700 mt-1">
                      Für echte AI-Verarbeitung: OPENAI_API_KEY und USE_OPENAI=true
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <MobileNavigation />
    </>
  )
}
