'use client';

import { useMetaTracking } from '@/hooks/useMetaTracking';
import { useState } from 'react';

export function TestMetaTracking() {
  const { trackEvent, trackUpgrade, trackLead, trackInitiateCheckout } = useMetaTracking();
  const [loading, setLoading] = useState<string | null>(null);

  const handleTest = async (testName: string, testFn: () => Promise<any>) => {
    setLoading(testName);
    try {
      const result = await testFn();
      console.log(`${testName} result:`, result);
      alert(`${testName} completed! Check console for details.`);
    } catch (error) {
      console.error(`${testName} error:`, error);
      alert(`${testName} failed! Check console for details.`);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="p-6 bg-gray-100 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Meta Tracking Test</h3>
      
      <div className="space-y-2">
        <button
          onClick={() => handleTest('Lead', () => trackLead({
            contentName: 'Test Lead',
            contentCategory: 'Test',
            value: 0,
            source: 'test-page'
          }))}
          disabled={loading === 'Lead'}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
        >
          {loading === 'Lead' ? 'Testing...' : 'Test Lead Event'}
        </button>

        <button
          onClick={() => handleTest('Upgrade', () => trackUpgrade({
            fromPlan: 'free',
            toPlan: 'pro',
            value: 49.0,
            currency: 'EUR',
            source: 'test-page'
          }))}
          disabled={loading === 'Upgrade'}
          className="px-4 py-2 bg-green-500 text-white rounded disabled:opacity-50"
        >
          {loading === 'Upgrade' ? 'Testing...' : 'Test Upgrade Event'}
        </button>

        <button
          onClick={() => handleTest('InitiateCheckout', () => trackInitiateCheckout({
            value: 49.0,
            currency: 'EUR',
            plan: 'pro',
            source: 'test-page'
          }))}
          disabled={loading === 'InitiateCheckout'}
          className="px-4 py-2 bg-purple-500 text-white rounded disabled:opacity-50"
        >
          {loading === 'InitiateCheckout' ? 'Testing...' : 'Test Checkout Event'}
        </button>

        <button
          onClick={() => handleTest('Custom Event', () => trackEvent('ViewContent', {
            content_name: 'Test Page',
            content_category: 'Test',
            content_type: 'page'
          }))}
          disabled={loading === 'Custom Event'}
          className="px-4 py-2 bg-orange-500 text-white rounded disabled:opacity-50"
        >
          {loading === 'Custom Event' ? 'Testing...' : 'Test Custom Event'}
        </button>
      </div>

      <div className="mt-4 text-sm text-gray-600">
        <p>Check the browser console and Meta Events Manager for results.</p>
        <p>Make sure you're logged in to test these events.</p>
      </div>
    </div>
  );
}
