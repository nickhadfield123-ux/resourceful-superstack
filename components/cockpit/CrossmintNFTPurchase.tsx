'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface CrossmintNFTPurchaseProps {
  onPurchase?: (result: any) => void;
}

export function CrossmintNFTPurchase({ onPurchase }: CrossmintNFTPurchaseProps) {
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [purchaseResult, setPurchaseResult] = useState<any>(null);

  const handlePurchase = async (collection: string) => {
    setIsPurchasing(true);
    setPurchaseResult(null);

    try {
      // Simulate Crossmint API call
      const response = await fetch('/api/crossmint/mint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          collection,
          testMode: true,
          paymentMethod: 'test_card'
        }),
      });

      const result = await response.json();
      
      if (response.ok) {
        setPurchaseResult({
          success: true,
          message: `Successfully purchased ${collection} NFT!`,
          mintId: result.mintId,
          status: 'completed'
        });
        onPurchase?.(result);
      } else {
        setPurchaseResult({
          success: false,
          message: `Purchase failed: ${result.error}`,
          status: 'failed'
        });
      }
    } catch (error) {
      setPurchaseResult({
        success: false,
        message: `Network error: ${error}`,
        status: 'error'
      });
    } finally {
      setIsPurchasing(false);
    }
  };

  return (
    <Card className="border-none">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Crossmint NFT Purchase</span>
          <span className="text-sm text-green-600 font-semibold">Test Mode: ✅ Enabled</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Button
            onClick={() => handlePurchase('observer')}
            disabled={isPurchasing}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            {isPurchasing ? 'Processing...' : 'Buy Observer NFT (Test)'}
          </Button>
          <Button
            onClick={() => handlePurchase('contributor')}
            disabled={isPurchasing}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            {isPurchasing ? 'Processing...' : 'Buy Contributor NFT (Test)'}
          </Button>
        </div>
        
        <p className="text-sm text-gray-500">
          Use test card: 4242 4242 4242 4242
        </p>

        {purchaseResult && (
          <div className={`p-4 rounded-lg ${
            purchaseResult.success 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            <p className={`font-semibold ${
              purchaseResult.success ? 'text-green-800' : 'text-red-800'
            }`}>
              {purchaseResult.message}
            </p>
            {purchaseResult.mintId && (
              <p className="text-sm text-gray-600 mt-2">
                Mint ID: {purchaseResult.mintId}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}