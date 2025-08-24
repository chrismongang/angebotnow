import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4 text-foreground">
            AngebotNow
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Foto + kurze Infos → KI erstellt Angebotsentwurf → PDF
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Foto hochladen</CardTitle>
              <CardDescription>
                Laden Sie ein Foto Ihres Projekts hoch
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Foto auswählen</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Projektinfo</CardTitle>
              <CardDescription>
                Geben Sie Details zu Ihrem Projekt ein
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">Info hinzufügen</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>PDF generieren</CardTitle>
              <CardDescription>
                KI erstellt automatisch Ihren Angebotsentwurf
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="secondary">Angebot erstellen</Button>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-12">
          <Button size="lg">
            Jetzt starten
          </Button>
        </div>

        <div className="text-center mt-8">
          <a 
            href="/styleguide" 
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            Design System anzeigen →
          </a>
        </div>
      </div>
    </div>
  )
}
