"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, CreditCard, Users, Shield } from 'lucide-react';
import { CrossmintNFTPurchase } from '@/components/cockpit/CrossmintNFTPurchase';
import { useAuth } from '@/hooks/useAuth';

export default function MembershipPage() {
  const { authenticated, loading: authLoading, user } = useAuth();
  const router = useRouter();
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [isMember, setIsMember] = useState(false);

  // Redirect to login if not authenticated
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!authenticated) {
    router.push('/login');
    return null;
  }

  const handlePurchaseSuccess = (transactionId: string) => {
    console.log('NFT purchase successful:', transactionId);
    setIsMember(true);
    setShowPurchaseModal(false);
  };

  const handlePurchaseError = (error: string) => {
    console.error('NFT purchase failed:', error);
  };

  const membershipBenefits = [
    'Access to exclusive member-only content',
    'Priority support and assistance',
    'Early access to new features and updates',
    'Member directory and networking opportunities',
    'Discounts on events and services',
    'Voting rights on community decisions'
  ];

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Membership Program</h1>
        <p className="text-muted-foreground mt-2">
          Join our community and unlock exclusive benefits through NFT membership.
        </p>
      </div>

      {/* Overview Section */}
      <div className="space-y-6 mb-8">
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-col space-y-1.5">
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Secure
              </CardTitle>
              <CardDescription>
                Blockchain-secured membership with transparent ownership
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="flex flex-col space-y-1.5">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Community
              </CardTitle>
              <CardDescription>
                Join a network of like-minded individuals and professionals
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="flex flex-col space-y-1.5">
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Flexible
              </CardTitle>
              <CardDescription>
                Easy purchase and management through Crossmint
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Current Status</CardTitle>
            <CardDescription>
              Your membership status and next steps
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isMember ? (
              <div className="flex items-center space-x-4">
                <Badge variant="secondary" className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Active Member
                </Badge>
                <p className="text-sm text-muted-foreground">
                  You have successfully purchased your membership NFT and have access to all member benefits.
                </p>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Badge variant="outline">Not a Member</Badge>
                  <p className="text-sm text-muted-foreground">
                    Purchase a membership NFT to unlock exclusive benefits
                  </p>
                </div>
                <Button onClick={() => setShowPurchaseModal(true)}>
                  Join Now
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Benefits Section */}
      <div className="space-y-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Membership Benefits</CardTitle>
            <CardDescription>
              Everything you get when you become a member
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {membershipBenefits.map((benefit, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Purchase Section */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Purchase Membership NFT</CardTitle>
            <CardDescription>
              Complete your membership by purchasing the NFT below
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-w-md mx-auto">
              <CrossmintNFTPurchase
                onPurchase={handlePurchaseSuccess}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Purchase Modal */}
      {showPurchaseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full m-4">
            <h3 className="text-lg font-semibold mb-4">Purchase Membership</h3>
            <p className="text-sm text-gray-600 mb-6">
              Complete your membership by purchasing the NFT below. This will grant you access to all member benefits.
            </p>
            <CrossmintNFTPurchase
              onPurchase={handlePurchaseSuccess}
            />
            <Button 
              variant="outline" 
              onClick={() => setShowPurchaseModal(false)}
              className="mt-4 w-full"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}