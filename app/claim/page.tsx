"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Wallet, CheckCircle, AlertCircle, Loader2, ExternalLink, CreditCard } from 'lucide-react';
import { ethers } from 'ethers';
import { useAuth } from '@/hooks/useAuth';

declare global {
  interface Window {
    ethereum?: any
  }
}

interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  attributes: Array<{
    trait_type: string;
    value: string;
  }>;
}

interface NFTToken {
  tokenId: string;
  metadata: NFTMetadata;
  claimed: boolean;
}

interface ClaimSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: string;
  tier: string;
}

const ClaimSuccessModal: React.FC<ClaimSuccessModalProps> = ({ isOpen, onClose, amount, tier }) => {
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isOpen) {
      timer = setTimeout(() => {
        window.location.href = '/cockpit';
      }, 3000);
    }
    return () => clearTimeout(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-8 max-w-md w-full text-center">
        <div className="mb-4 flex justify-center">
          <div className="bg-green-100 p-3 rounded-full">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
        </div>
        
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Success!</h3>
        <p className="text-gray-600 mb-2">
          You received <span className="font-bold text-green-600">{amount}</span> RSF tokens!
        </p>
        <p className="text-sm text-gray-500 mb-6">
          Redirecting to dashboard in 3 seconds...
        </p>

        <div className="flex space-x-3">
          <Button 
            onClick={onClose}
            className="flex-1 bg-gray-900 hover:bg-gray-800 text-white"
          >
            Stay Here
          </Button>
          <Button 
            onClick={() => window.location.href = '/cockpit'}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
          >
            Go to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

const ErrorModal: React.FC<{ isOpen: boolean; onClose: () => void; message: string }> = ({ isOpen, onClose, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full text-center">
        <div className="mb-4 flex justify-center">
          <div className="bg-red-100 p-3 rounded-full">
            <AlertCircle className="h-12 w-12 text-red-600" />
          </div>
        </div>
        
        <h3 className="text-xl font-bold text-gray-900 mb-2">Error</h3>
        <p className="text-gray-600 mb-6">{message}</p>

        <Button 
          onClick={onClose}
          className="w-full bg-red-600 hover:bg-red-700 text-white"
        >
          Close
        </Button>
      </div>
    </div>
  );
};

export default function ClaimPage() {
  const { authenticated, loading: authLoading, user } = useAuth();
  const router = useRouter();
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [nfts, setNfts] = useState<NFTToken[]>([]);
  const [loading, setLoading] = useState(false);
  const [walletLoading, setWalletLoading] = useState(false);
  const [successModal, setSuccessModal] = useState<{ isOpen: boolean; amount: string; tier: string }>({
    isOpen: false,
    amount: '',
    tier: ''
  });
  const [errorModal, setErrorModal] = useState<{ isOpen: boolean; message: string }>({
    isOpen: false,
    message: ''
  });

  const isTestMode = !authenticated;

  // TODO: re-enable when /login exists and Ory is running
  // if (authLoading) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center">
  //       <p>Loading...</p>
  //     </div>
  //   );
  // }

  // if (!authenticated) {
  //   router.push('/login');
  //   return null;
  // }

  const NFT_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS || '';
  const NFT_CONTRACT_ABI = [
    "function balanceOf(address owner) view returns (uint256)",
    "function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)",
    "function tokenURI(uint256 tokenId) view returns (string)",
    "function hasClaimed(uint256 tokenId) view returns (bool)",
    "function claimTokens(uint256 tokenId) external"
  ];

  const getTokensForTier = (tier: string): string => {
    switch (tier) {
      case 'Observer': return '5,000';
      case 'Contributor': return '50,000';
      case 'Builder': return '500,000';
      case 'Architect': return '5,000,000';
      default: return '0';
    }
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      setErrorModal({ isOpen: true, message: 'Please install MetaMask to connect your wallet' });
      return;
    }

    try {
      setWalletLoading(true);
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      setWalletAddress(address);
      await loadNFTs(address, provider);
    } catch (error) {
      console.error('Wallet connection failed:', error);
      setErrorModal({ isOpen: true, message: 'Failed to connect wallet. Please try again.' });
    } finally {
      setWalletLoading(false);
    }
  };

  const loadNFTs = async (address: string, provider: ethers.BrowserProvider) => {
    if (!window.ethereum || !NFT_CONTRACT_ADDRESS) return;

    try {
      setLoading(true);
      const contract = new ethers.Contract(NFT_CONTRACT_ADDRESS, NFT_CONTRACT_ABI, provider);
      const balance = await contract.balanceOf(address);
      const nftTokens: NFTToken[] = [];

      for (let i = 0n; i < balance; i++) {
        const tokenId = await contract.tokenOfOwnerByIndex(address, i);
        const tokenURI = await contract.tokenURI(tokenId);
        const claimed = await contract.hasClaimed(tokenId);

        let metadata: NFTMetadata = {
          name: 'Unknown NFT',
          description: '',
          image: '',
          attributes: []
        };

        try {
          const response = await fetch(tokenURI);
          if (response.ok) {
            metadata = await response.json();
          }
        } catch (error) {
          console.error('Failed to fetch metadata:', error);
        }

        nftTokens.push({
          tokenId: tokenId.toString(),
          metadata,
          claimed
        });
      }

      setNfts(nftTokens);
    } catch (error) {
      console.error('Failed to load NFTs:', error);
      setErrorModal({ isOpen: true, message: 'Failed to load your NFTs. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const claimTokens = async (tokenId: string, tier: string) => {
    if (!window.ethereum || !NFT_CONTRACT_ADDRESS) {
      setErrorModal({ isOpen: true, message: 'Please connect your wallet first' });
      return;
    }

    try {
      setLoading(true);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(NFT_CONTRACT_ADDRESS, NFT_CONTRACT_ABI, signer);

      const tx = await contract.claimTokens(tokenId);
      await tx.wait();

      setNfts(prev => prev.map(nft => 
        nft.tokenId === tokenId ? { ...nft, claimed: true } : nft
      ));

      const amount = getTokensForTier(tier);
      setSuccessModal({ isOpen: true, amount, tier });
    } catch (error: any) {
      console.error('Claim failed:', error);
      const errorMessage = error?.message || 'Transaction failed. Please try again.';
      setErrorModal({ isOpen: true, message: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Observer': return 'from-blue-500 to-cyan-500';
      case 'Contributor': return 'from-green-500 to-emerald-500';
      case 'Builder': return 'from-purple-500 to-pink-500';
      case 'Architect': return 'from-yellow-500 to-orange-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'Observer': return <CreditCard className="h-8 w-8" />;
      case 'Contributor': return <CreditCard className="h-8 w-8" />;
      case 'Builder': return <CreditCard className="h-8 w-8" />;
      case 'Architect': return <CreditCard className="h-8 w-8" />;
      default: return <CreditCard className="h-8 w-8" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Claim Your RSF Tokens
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8">
            Connect your wallet to claim tokens from your membership NFTs
          </p>
          
          {isTestMode && (
            <div className="mb-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg max-w-2xl mx-auto">
              <p className="text-sm text-yellow-800">
                <strong>Test mode:</strong> auth is bypassed because Ory is not running and /login does not exist yet.
              </p>
            </div>
          )}
          
          <div className="flex justify-center">
            {walletAddress ? (
              <div className="bg-white rounded-lg p-4 shadow-lg flex items-center gap-4">
                <Wallet className="h-6 w-6 text-green-600" />
                <span className="font-mono text-sm">
                  {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                </span>
                <Button 
                  onClick={connectWallet}
                  variant="outline"
                  className="text-gray-600 hover:text-gray-900"
                >
                  {walletLoading ? 'Connecting...' : 'Change Wallet'}
                </Button>
              </div>
            ) : (
              <Button 
                onClick={connectWallet}
                disabled={walletLoading}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
              >
                {walletLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Wallet className="h-5 w-5" />
                    Connect Wallet
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        <div className="max-w-6xl mx-auto">
          {walletAddress ? (
            loading ? (
              <div className="text-center py-12">
                <Loader2 className="h-12 w-12 animate-spin mx-auto text-gray-600 mb-4" />
                <p className="text-gray-600">Loading your NFTs...</p>
              </div>
            ) : nfts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {nfts.map((nft) => {
                  const tier = nft.metadata.attributes?.find(attr => attr.trait_type === 'Tier')?.value || 'Unknown';
                  const tokens = getTokensForTier(tier);
                  const isClaimed = nft.claimed;

                  return (
                    <Card 
                      key={nft.tokenId}
                      className={`hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-0 ${
                        tier === 'Architect' ? 'ring-2 ring-yellow-400 ring-opacity-50' : ''
                      }`}
                    >
                      <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                          <div className={`w-16 h-16 bg-gradient-to-br ${getTierColor(tier)} rounded-full flex items-center justify-center shadow-lg`}>
                            {getTierIcon(tier)}
                          </div>
                          <div className="text-right">
                            <Badge variant={isClaimed ? "secondary" : "default"}>
                              {isClaimed ? 'Claimed' : 'Available'}
                            </Badge>
                          </div>
                        </div>
                        <CardTitle className="text-2xl font-bold mt-4">{nft.metadata.name}</CardTitle>
                        <CardDescription className="text-gray-600">
                          <span className="text-2xl font-bold text-gray-900">{tokens}</span>
                          <span className="text-sm"> RSF tokens available</span>
                        </CardDescription>
                      </CardHeader>

                      <CardContent className="space-y-6">
                        <div className="text-center">
                          <img 
                            src={nft.metadata.image} 
                            alt={nft.metadata.name}
                            className="w-40 h-40 mx-auto rounded-lg shadow-md object-cover"
                            onError={(e) => {
                              e.currentTarget.src = 'https://via.placeholder.com/300x300/gray/white?text=NFT+Image';
                            }}
                          />
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <span className="text-sm font-medium text-gray-600">Tier</span>
                            <span className="font-semibold">{tier}</span>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <span className="text-sm font-medium text-gray-600">Token ID</span>
                            <span className="font-mono text-sm">{nft.tokenId}</span>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <span className="text-sm font-medium text-gray-600">Status</span>
                            <Badge variant={isClaimed ? "secondary" : "default"}>
                              {isClaimed ? 'Already Claimed' : 'Ready to Claim'}
                            </Badge>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <Button 
                            onClick={() => claimTokens(nft.tokenId, tier)}
                            disabled={isClaimed || loading}
                            className={`w-full ${isClaimed ? 'bg-gray-300 cursor-not-allowed' : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600'} text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105`}
                          >
                            {loading ? (
                              <div className="flex items-center justify-center">
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                Processing...
                              </div>
                            ) : isClaimed ? (
                              'Already Claimed'
                            ) : (
                              'Claim Tokens'
                            )}
                          </Button>
                          
                          <p className="text-xs text-gray-500 text-center">
                            {isClaimed ? 'This NFT has already been claimed' : 'Claim your RSF tokens now'}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-lg shadow-lg">
                <div className="mb-6 flex justify-center">
                  <div className="bg-gray-100 p-4 rounded-full">
                    <AlertCircle className="h-12 w-12 text-gray-600" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">No Membership NFTs Found</h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  You don&apos;t have any membership NFTs yet. Purchase a membership to get started and claim your RSF tokens.
                </p>
                <Button 
                  onClick={() => window.location.href = '/memberships'}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105"
                >
                  Purchase Membership
                </Button>
              </div>
            )
          ) : (
            <div className="text-center py-16 bg-white rounded-lg shadow-lg">
              <div className="mb-6 flex justify-center">
                <div className="bg-blue-100 p-4 rounded-full">
                  <Wallet className="h-12 w-12 text-blue-600" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Connect Your Wallet</h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Connect your wallet to view your membership NFTs and claim your RSF tokens.
              </p>
              <Button 
                onClick={connectWallet}
                disabled={walletLoading}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105"
              >
                {walletLoading ? 'Connecting...' : 'Connect Wallet'}
              </Button>
            </div>
          )}
        </div>
      </div>

      <ClaimSuccessModal
        isOpen={successModal.isOpen}
        onClose={() => setSuccessModal({ isOpen: false, amount: '', tier: '' })}
        amount={successModal.amount}
        tier={successModal.tier}
      />

      <ErrorModal
        isOpen={errorModal.isOpen}
        onClose={() => setErrorModal({ isOpen: false, message: '' })}
        message={errorModal.message}
      />
    </div>
  );
}
