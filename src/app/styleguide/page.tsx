import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"

export default function StyleguidePage() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4">AngebotNow Styleguide</h1>
          <p className="text-lg text-muted-foreground">
            Design Tokens und UI-Komponenten Übersicht
          </p>
        </div>

        {/* Colors Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Farben</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="w-full h-20 bg-primary rounded-xl mb-2"></div>
                <p className="text-sm font-medium">Primary</p>
                <p className="text-xs text-muted-foreground">#F89813</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="w-full h-20 bg-muted rounded-xl mb-2"></div>
                <p className="text-sm font-medium">Muted</p>
                <p className="text-xs text-muted-foreground">#F4F4F4</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="w-full h-20 bg-card border border-border rounded-xl mb-2"></div>
                <p className="text-sm font-medium">Card</p>
                <p className="text-xs text-muted-foreground">#FFFFFF</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="w-full h-20 bg-destructive rounded-xl mb-2"></div>
                <p className="text-sm font-medium">Destructive</p>
                <p className="text-xs text-muted-foreground">#EF4444</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Buttons Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Buttons</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Button Variants</CardTitle>
                <CardDescription>Alle verfügbaren Button-Styles</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-4">
                  <Button>Default</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="link">Link</Button>
                  <Button variant="destructive">Destructive</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Button Sizes</CardTitle>
                <CardDescription>Verschiedene Button-Größen</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-4 items-center">
                  <Button size="sm">Small</Button>
                  <Button size="default">Default</Button>
                  <Button size="lg">Large</Button>
                  <Button size="icon">🔍</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Form Elements Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Formularelemente</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Input & Textarea</CardTitle>
                <CardDescription>Eingabefelder mit neuen Design Tokens</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" placeholder="Ihr Name..." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-Mail</Label>
                  <Input id="email" type="email" placeholder="ihre@email.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Nachricht</Label>
                  <Textarea id="message" placeholder="Ihre Nachricht..." />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Badges</CardTitle>
                <CardDescription>Status- und Kategorie-Badges</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Badge>Default</Badge>
                  <Badge variant="secondary">Secondary</Badge>
                  <Badge variant="destructive">Destructive</Badge>
                  <Badge variant="outline">Outline</Badge>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge>PENDING</Badge>
                  <Badge variant="secondary">AI_DONE</Badge>
                  <Badge variant="outline">COMPLETED</Badge>
                  <Badge variant="destructive">FAILED</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Cards Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Cards</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Standard Card</CardTitle>
                <CardDescription>Eine einfache Card mit Inhalt</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Diese Card zeigt die neuen Design Tokens mit rounded-2xl und soft shadow.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Card mit Button</CardTitle>
                <CardDescription>Card mit Call-to-Action</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Cards können verschiedene Aktionen enthalten.
                </p>
                <Button className="w-full">Aktion ausführen</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Card mit Badge</CardTitle>
                <CardDescription>Status-Anzeige in Cards</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge>Status</Badge>
                  <span className="text-sm text-muted-foreground">Aktiv</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Badges können Status-Informationen anzeigen.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Design Tokens Info */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Design Tokens</h2>
          <Card>
            <CardHeader>
              <CardTitle>Verwendete Design Tokens</CardTitle>
              <CardDescription>Übersicht der implementierten Design-System-Werte</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3">Farben</h3>
                  <ul className="space-y-2 text-sm">
                    <li><span className="font-mono">primary:</span> #F89813 (Orange)</li>
                    <li><span className="font-mono">muted:</span> #F4F4F4 (Hellgrau)</li>
                    <li><span className="font-mono">card:</span> #FFFFFF (Weiß)</li>
                    <li><span className="font-mono">border:</span> #EAEAEA (Hellgrau)</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-3">Radius & Shadows</h3>
                  <ul className="space-y-2 text-sm">
                    <li><span className="font-mono">rounded-xl:</span> 20px</li>
                    <li><span className="font-mono">rounded-2xl:</span> 24px</li>
                    <li><span className="font-mono">shadow-soft:</span> 0 8px 24px rgba(0,0,0,0.06)</li>
                    <li><span className="font-mono">font:</span> Inter, system-ui</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}
