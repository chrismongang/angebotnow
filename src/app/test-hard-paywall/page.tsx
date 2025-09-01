'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { HardPaywallModal } from '@/components/hard-paywall-modal';

export default function TestHardPaywallPage() {
  const [showPaywall, setShowPaywall] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Hard Paywall Test
        </h1>
        
        <p className="text-gray-600 max-w-md">
          Diese Seite demonstriert die Hard Paywall mit Multi-Channel Referral-Optionen. 
          Klicke auf den Button, um die Paywall zu öffnen.
        </p>

        <Button
          onClick={() => setShowPaywall(true)}
          size="lg"
          className="bg-blue-600 hover:bg-blue-700"
        >
          Hard Paywall öffnen
        </Button>

        <div className="text-sm text-gray-500">
          <p>Features der Paywall:</p>
          <ul className="mt-2 space-y-1">
            <li>• WhatsApp-Einladungen mit vorgefertigten Nachrichten</li>
            <li>• SMS-Einladungen</li>
            <li>• E-Mail-Einladungen</li>
            <li>• Social Media Sharing</li>
            <li>• Link kopieren</li>
            <li>• Upgrade-Option</li>
          </ul>
        </div>
      </div>

      <HardPaywallModal
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
        onUpgrade={() => {
          setShowPaywall(false)
          // Verwende eine benutzerfreundliche Benachrichtigung statt alert
          console.log('Upgrade-Flow würde hier gestartet werden')
        }}
        remainingQuotes={0}
        limit={5}
        userEmail="test@example.com"
        userName="Test User"
      />
    </div>
  );
}
