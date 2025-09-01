'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  AlertTriangle, 
  Gift, 
  Users, 
  Zap, 
  X, 
  Share2
} from 'lucide-react';
import { trackEventClient } from '@/lib/loops';
import { WhatsAppService } from '@/lib/whatsapp';

interface HardPaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
  remainingQuotes: number;
  limit: number;
  userEmail?: string;
  userName?: string;
}

// Einfacher Share-Button für native Sharing-Funktionalität

export function HardPaywallModal({
  isOpen,
  onClose,
  onUpgrade,
  remainingQuotes,
  limit,
  userEmail,
  userName
}: HardPaywallModalProps) {
  const [referralCode, setReferralCode] = useState('');
  const [shareLinks, setShareLinks] = useState<any>(null);

  useEffect(() => {
    if (isOpen && !referralCode) {
      generateReferralCode();
    }
  }, [isOpen, referralCode]);

  const generateReferralCode = async () => {
    try {
      // Generiere einen einfachen Referral-Code für die Anzeige
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      setReferralCode(code);
    } catch (error) {
      console.error('Failed to generate referral code:', error);
    }
  };

  const handleNativeShare = async () => {
    if (!referralCode || typeof window === 'undefined') return;

    const shareData = {
      title: `${userName || 'Ein Freund'} lädt dich zu AngebotNow ein!`,
      text: `Du bekommst 2 GRATIS-Angebote! Registriere dich mit Code: ${referralCode}`,
      url: `${window.location.origin}/auth/signin?referral=${referralCode}`
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        
        // Loops Event: referral_shared
        await trackEventClient(userEmail || 'user@example.com', 'referral_shared', {
          method: 'native_share',
          source: 'hard_paywall',
          inviteCode: referralCode
        });
      } else {
        // Fallback für Browser ohne Web Share API
        if (navigator.clipboard) {
          const link = shareData.url;
          await navigator.clipboard.writeText(link);
          // Verwende eine benutzerfreundliche Benachrichtigung statt alert
          // Hier könntest du einen Toast oder eine andere UI-Benachrichtigung verwenden
        }
      }
    } catch (error) {
      console.error('Share failed:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-between items-start">
            <div className="flex-1" />
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-center">
              <div className="p-3 bg-red-100 rounded-full">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
            </div>
            
            <CardTitle className="text-2xl font-bold text-gray-900">
              Angebot-Limit erreicht!
            </CardTitle>
            
            <p className="text-gray-600">
              Du hast dein monatliches Limit von {limit} Angeboten erreicht.
            </p>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">

          {/* Referral Section */}
          <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="p-3 bg-blue-100 rounded-full">
                  <Gift className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-blue-900 mb-2">
                  🎁 2 Gratis-Credits für dich & deinen Freund!
                </h3>
                <p className="text-blue-700 text-sm mb-6">
                  Lade einen Freund ein und ihr bekommt beide 2 zusätzliche Angebote!
                </p>
              </div>

              {/* Einfacher Share-Button */}
              <Button
                onClick={handleNativeShare}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
              >
                <Share2 className="w-5 h-5 mr-2" />
                Freund einladen & 2 Credits sichern
              </Button>

              <p className="text-xs text-blue-600">
                
              </p>
            </div>
          </div>

          {/* Upgrade Section */}
          <div className="p-6 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg border border-orange-200">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="p-3 bg-orange-100 rounded-full">
                  <Zap className="w-6 h-6 text-orange-600" />
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-orange-900 mb-2">
                  Jetzt auf Pro upgraden
                </h3>
                <p className="text-orange-700 text-sm">
                  Unbegrenzte Angebote, Positionen bearbeiten & mehr!
                </p>
              </div>

              <Button
                onClick={onUpgrade}
                className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 text-lg"
              >
                Jetzt upgraden - 19,99€/Monat
              </Button>
            </div>
          </div>

          {/* Alternative: Wait for next month */}
          <div className="text-center">
            <p className="text-gray-500 text-sm">
              Oder warte bis zum nächsten Monat für neue Gratis-Angebote
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
