'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Crown, Zap, Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { STRIPE_PLANS } from '@/lib/stripe-client';

interface PlanStatusInfo {
  tier: 'FREE' | 'PRO';
  monthlyQuoteCount: number;
  remainingQuotes: number;
  limit: number;
  referralCredits: number;
}

export function PlanStatusMini() {
  const { data: session } = useSession();
  const [planInfo, setPlanInfo] = useState<PlanStatusInfo | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (session?.user?.id) {
      loadPlanInfo();
    }
  }, [session]);

  const loadPlanInfo = async () => {
    try {
      const response = await fetch('/api/subscription');
      if (response.ok) {
        const data = await response.json();
        setPlanInfo({
          tier: data.tier,
          monthlyQuoteCount: data.monthlyQuoteCount,
          remainingQuotes: data.remainingQuotes,
          limit: data.limit,
          referralCredits: data.referralCredits
        });
      }
    } catch (error) {
      console.error('Error loading plan info:', error);
    }
  };

  const handleManageSubscription = () => {
    router.push('/einstellungen/app');
  };

  if (!planInfo) {
    return null;
  }

  const isPro = planInfo.tier === 'PRO';
  
  // Don't show this component for Pro users
  if (isPro) {
    return null;
  }

  const remainingQuotes = planInfo.remainingQuotes;
  const limit = planInfo.limit;

  return (
    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border border-orange-100 mb-6">
      <div className="flex items-center gap-3">
        <Zap className="w-5 h-5 text-orange-600" />
        <div>
          <span className="text-sm font-medium text-gray-700">
            Free Plan
          </span>
          <div className="text-xs text-gray-500">
            {`${remainingQuotes} von ${limit} Angeboten übrig`}
          </div>
        </div>
      </div>
      
      <Button
        variant="outline"
        size="sm"
        onClick={handleManageSubscription}
        className="text-orange-600 border-orange-200 hover:bg-orange-50 hover:border-orange-300"
      >
        <Settings className="w-4 h-4 mr-2" />
        Abo verwalten
      </Button>
    </div>
  );
}
