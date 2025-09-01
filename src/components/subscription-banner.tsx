'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Crown, Check, X, AlertCircle, Zap } from 'lucide-react';
import { STRIPE_PLANS } from '@/lib/stripe-client';
import { trackEvent } from '@/lib/loops';

interface SubscriptionInfo {
  tier: 'FREE' | 'PRO';
  status: string;
  monthlyQuoteCount: number;
  remainingQuotes: number;
  limit: number;
  canEditPositions: boolean;
  canCustomizeLogo: boolean;
  referralCredits: number;
}

export function SubscriptionBanner() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [subscriptionInfo, setSubscriptionInfo] = useState<SubscriptionInfo | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  useEffect(() => {
    if (session?.user?.id) {
      loadSubscriptionInfo();
    }
  }, [session]);

  const loadSubscriptionInfo = async () => {
    try {
      const response = await fetch('/api/subscription');
      if (response.ok) {
        const data = await response.json();
        setSubscriptionInfo(data);
      }
    } catch (error) {
      console.error('Error loading subscription info:', error);
    }
  };

  const handleUpgrade = async () => {
    try {
      // Quotes-Anzahl für Loops Event ermitteln
      const quotesCount = await fetch('/api/quotes').then(res => res.json()).then(quotes => Array.isArray(quotes) ? quotes.length : 0);

      // Loops Event: clicked_upgrade
      await trackEvent(session?.user?.email!, 'clicked_upgrade', {
        userId: session?.user?.id,
        plan: 'free',
        quotesCount: quotesCount,
        createdAt: new Date().toISOString(),
        source: 'subscription_banner',
        location: 'dashboard'
      });

      // Weiterleitung zum Checkout
      setLoading(true);
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST'
      });
      const { url } = await response.json();
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error('Upgrade tracking failed:', error);
      // Trotzdem mit Upgrade fortfahren
      setLoading(true);
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST'
      });
      const { url } = await response.json();
      if (url) {
        window.location.href = url;
      }
    } finally {
      setLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/stripe/customer-portal', {
        method: 'POST',
      });
      
      if (response.ok) {
        const { url } = await response.json();
        window.location.href = url; // Redirect to Stripe Customer Portal
      } else {
        console.error('Failed to create customer portal session');
      }
    } catch (error) {
      console.error('Error managing subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!subscriptionInfo) {
    return null;
  }

  const isPro = subscriptionInfo.tier === 'PRO';
  const remainingQuotes = subscriptionInfo.remainingQuotes;
  const limit = subscriptionInfo.limit;

  return (
    <>
      <Card className="mb-6 border-2 bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isPro ? (
                <Crown className="w-6 h-6 text-orange-600" />
              ) : (
                <Zap className="w-6 h-6 text-orange-600" />
              )}
              <CardTitle className="text-lg text-gray-800">
                {isPro ? 'Pro Abonnement' : 'Free Plan'}
              </CardTitle>
            </div>
            <Badge variant={isPro ? 'default' : 'secondary'} className={isPro ? 'bg-orange-600' : 'bg-gray-300'}>
              {isPro ? 'PRO' : 'FREE'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Current Plan Status */}
            <div className="p-4 bg-white rounded-lg border border-orange-100 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Angebote diesen Monat:</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-orange-600">
                    {subscriptionInfo.monthlyQuoteCount}
                  </span>
                  <span className="text-sm text-gray-500">
                    / {limit === -1 ? '∞' : limit}
                  </span>
                </div>
              </div>
              
              {/* Progress Bar */}
              {limit !== -1 && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-orange-600 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${Math.min((subscriptionInfo.monthlyQuoteCount / limit) * 100, 100)}%` 
                    }}
                  />
                </div>
              )}
            </div>

            {/* Free Plan Features - Only show for Free Users */}
            {!isPro && (
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-800 text-lg">Free Plan Features:</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Check className="w-4 h-4 text-green-600" />
                    <span className="text-sm">E-Mail-Support (24h Antwortzeit)</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Check className="w-4 h-4 text-green-600" />
                    <span className="text-sm">5 Angebote pro Monat</span>
                  </div>
                </div>
              </div>
            )}

            {/* Pro Plan Benefits - Only show for Free Users */}
            {!isPro && (
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-800 text-lg">Upgrade auf Pro für:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 text-green-700">
                    <Check className="w-5 h-5" />
                    <span className="text-sm">Unbegrenzte Angebote</span>
                  </div>
                  <div className="flex items-center gap-2 text-green-700">
                    <Check className="w-5 h-5" />
                    <span className="text-sm">Positionen bearbeiten</span>
                  </div>
                  <div className="flex items-center gap-2 text-green-700">
                    <Check className="w-5 h-5" />
                    <span className="text-sm">AngebotNow Branding aus PDF entfernen</span>
                  </div>
                  <div className="flex items-center gap-2 text-green-700">
                    <Check className="w-5 h-5" />
                    <span className="text-sm">Prioritäts-Support</span>
                  </div>
                </div>
              </div>
            )}

            {/* Upgrade Button for Free Users */}
            {!isPro && (
              <div className="pt-2">
                <Button
                  onClick={handleUpgrade}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white"
                >
                  {loading ? 'Wird verarbeitet...' : 'Jetzt upgraden (19,99€/Monat)'}
                </Button>
              </div>
            )}

            {/* Pro User Info */}
            {isPro && (
              <div className="pt-2 space-y-3">
                <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 p-3 rounded-lg">
                  <Check className="w-4 h-4" />
                  <span>Sie haben Zugriff auf alle Pro-Features</span>
                </div>
                
                <Button
                  variant="outline"
                  onClick={handleManageSubscription}
                  disabled={loading}
                  className="w-full border-orange-200 text-orange-600 hover:bg-orange-50 hover:border-orange-300"
                >
                  {loading ? 'Wird geladen...' : 'Abo verwalten'}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Upgrade auf Pro</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium">Pro Features:</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• Unbegrenzte Angebote pro Monat</li>
                  <li>• Positionen bearbeiten</li>
                  <li>• Prioritäts-Support (4h Antwortzeit)</li>
                  <li>• Eigenes Logo in PDF</li>
                  <li>• Kein AngebotNow Branding</li>
                </ul>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">19,99€/Monat</p>
                <p className="text-sm text-gray-500">Jederzeit kündbar</p>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowUpgradeModal(false)}
                  className="flex-1"
                >
                  Abbrechen
                </Button>
                <Button
                  onClick={handleUpgrade}
                  disabled={loading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  {loading ? 'Wird verarbeitet...' : 'Jetzt upgraden'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
