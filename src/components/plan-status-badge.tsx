'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Badge } from '@/components/ui/badge';
import { Crown } from 'lucide-react';
import { STRIPE_PLANS } from '@/lib/stripe-client';

interface PlanStatusInfo {
  tier: 'FREE' | 'PRO';
}

export function PlanStatusBadge() {
  const { data: session } = useSession();
  const [planInfo, setPlanInfo] = useState<PlanStatusInfo | null>(null);

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
          tier: data.tier
        });
      }
    } catch (error) {
      console.error('Error loading plan info:', error);
    }
  };

  if (!planInfo) {
    return null;
  }

  const isPro = planInfo.tier === 'PRO';

  return (
    <Badge 
      variant={isPro ? 'default' : 'secondary'} 
      className={isPro ? 'bg-gradient-to-r from-[#FFA200] to-[#FFB366] hover:from-[#E88A0F] hover:to-[#FFA200] text-white border-0' : 'bg-gray-300'}
    >
      {isPro ? 'PRO' : 'FREE'}
    </Badge>
  );
}
