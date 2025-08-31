'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { UpgradeSuccessModal } from '@/components/upgrade-success-modal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function TestUpgradeModalPage() {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/dashboard" 
            className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Zurück zum Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Test: Upgrade Success Modal</h1>
          <p className="text-gray-600 mt-2">
            Hier kannst du das Upgrade-Erfolgs-Popup testen und anpassen, ohne ein echtes Upgrade durchzuführen.
          </p>
        </div>

        {/* Test Controls */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Modal steuern</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <Button 
                onClick={() => setShowModal(true)}
                className="bg-orange-600 hover:bg-orange-700"
              >
                Modal öffnen
              </Button>
              <Button 
                onClick={() => setShowModal(false)}
                variant="outline"
                className="border-orange-200 text-orange-600 hover:bg-orange-50"
              >
                Modal schließen
              </Button>
            </div>
            
            <div className="text-sm text-gray-600">
              <p><strong>Status:</strong> {showModal ? 'Geöffnet' : 'Geschlossen'}</p>
            </div>
          </CardContent>
        </Card>

        {/* Test Scenarios */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Test-Szenarien</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-blue-900 mb-2">Szenario 1: Modal öffnen</h3>
                <p className="text-sm text-blue-700 mb-3">
                  Klicke auf &quot;Modal öffnen&quot; um das Popup zu testen
                </p>
                <Button 
                  size="sm"
                  onClick={() => setShowModal(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Jetzt testen
                </Button>
              </div>

              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <h3 className="font-semibold text-green-900 mb-2">Szenario 2: Schließen testen</h3>
                <p className="text-sm text-green-700 mb-3">
                  Teste alle Schließ-Methoden: X-Button, &quot;Verstanden&quot; Button, außerhalb klicken
                </p>
                <Button 
                  size="sm"
                  onClick={() => setShowModal(true)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Modal öffnen
                </Button>
              </div>

              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <h3 className="font-semibold text-purple-900 mb-2">Szenario 3: Responsive Design</h3>
                <p className="text-sm text-purple-700 mb-3">
                  Ändere die Browser-Fenster-Größe und teste das Modal auf verschiedenen Bildschirmgrößen
                </p>
                <Button 
                  size="sm"
                  onClick={() => setShowModal(true)}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  Modal öffnen
                </Button>
              </div>

              <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                <h3 className="font-semibold text-orange-900 mb-2">Szenario 4: Animationen</h3>
                <p className="text-sm text-orange-700 mb-3">
                  Öffne und schließe das Modal mehrmals, um die Smooth-Animationen zu testen
                </p>
                <Button 
                  size="sm"
                  onClick={() => setShowModal(true)}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  Modal öffnen
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Development Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Entwickler-Notizen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-gray-600">
              <p><strong>Datei:</strong> <code>src/components/upgrade-success-modal.tsx</code></p>
              <p><strong>Verwendung:</strong> Wird automatisch angezeigt nach erfolgreichem Stripe-Upgrade</p>
              <p><strong>Props:</strong> <code>isOpen</code> (boolean), <code>onClose</code> (function)</p>
              <p><strong>Styling:</strong> Verwendet Orange-Brand-Farben und Tailwind CSS</p>
              <p><strong>Features:</strong> Alle 4 Pro-Features sind aufgelistet und können angepasst werden</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* The Modal */}
      <UpgradeSuccessModal 
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </div>
  );
}
