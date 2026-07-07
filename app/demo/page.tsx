"use client";

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, Wallet, Coins, ArrowRightLeft, Sparkles, Rocket, ArrowRight, Copy, RefreshCw } from 'lucide-react';

type DemoStep = 'welcome' | 'wallet' | 'claim' | 'balance' | 'swap' | 'complete';

interface TokenBalance {
  rsf: string;
  usdc: string;
}

interface DemoState {
  currentStep: DemoStep;
  walletAddress: string;
  balances: TokenBalance;
  isProcessing: boolean;
  errorMessage: string;
  swapAmount: string;
  swapResult: { from: string; to: string } | null;
}

export default function DemoPage() {
  const [state, setState] = useState<DemoState>({
    currentStep: 'welcome',
    walletAddress: '',
    balances: { rsf: '0', usdc: '0' },
    isProcessing: false,
    errorMessage: '',
    swapAmount: '',
    swapResult: null,
  });

  const [provider, setProvider] = useState<ethers.JsonRpcProvider | null>(null);

  useEffect(() => {
    const initProvider = async () => {
      try {
        const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || 'http://localhost:8545';
        const provider = new ethers.JsonRpcProvider(rpcUrl);
        await provider.getNetwork();
        setProvider(provider);
      } catch (error) {
        console.error('Provider init error:', error);
      }
    };

    initProvider();
  }, []);

  const getStepInfo = (step: DemoStep) => {
    const steps = ['welcome', 'wallet', 'claim', 'balance', 'swap', 'complete'] as DemoStep[];
    const index = steps.indexOf(step);
    return {
      number: index + 1,
      total: steps.length,
      title: step === 'welcome' ? 'Welcome to Resourceful' : 
             step === 'wallet' ? 'Create Your Wallet' :
             step === 'claim' ? 'Claim Your Tokens' :
             step === 'balance' ? 'View Your Balance' :
             step === 'swap' ? 'Swap Tokens' : 'Complete!',
      subtitle: step === 'welcome' ? 'Experience the future of work-to-earn' :
              step === 'wallet' ? 'First, we\'ll create a secure wallet for you' :
              step === 'claim' ? 'New members receive 100 RSF tokens' :
              step === 'balance' ? 'Your Resourceful ecosystem dashboard' :
              step === 'swap' ? 'Trade RSF for USDC using Uniswap' :
              'Congratulations! You\'ve experienced Resourceful'
    };
  };

  const handleNextStep = () => {
    const steps = ['welcome', 'wallet', 'claim', 'balance', 'swap', 'complete'] as DemoStep[];
    const currentIndex = steps.indexOf(state.currentStep);
    if (currentIndex < steps.length - 1) {
      setState(prev => ({ ...prev, currentStep: steps[currentIndex + 1] }));
    }
  };

  const handlePreviousStep = () => {
    const steps = ['welcome', 'wallet', 'claim', 'balance', 'swap', 'complete'] as DemoStep[];
    const currentIndex = steps.indexOf(state.currentStep);
    if (currentIndex > 0) {
      setState(prev => ({ ...prev, currentStep: steps[currentIndex - 1] }));
    }
  };

  const generateWallet = async () => {
    if (state.isProcessing) return;

    setState(prev => ({ ...prev, isProcessing: true, errorMessage: '' }));

    try {
      const wallet = ethers.Wallet.createRandom();
      setState(prev => ({ 
        ...prev, 
        walletAddress: wallet.address,
        isProcessing: false 
      }));
      
      setTimeout(handleNextStep, 1000);
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        errorMessage: 'Failed to generate wallet',
        isProcessing: false 
      }));
    }
  };

  const claimTokens = async () => {
    if (state.isProcessing || !state.walletAddress) return;

    setState(prev => ({ ...prev, isProcessing: true, errorMessage: '' }));

    try {
      const response = await fetch('/api/tokens/mint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: state.walletAddress,
          amount: 100
        })
      });

      const result = await response.json();
      
      if (response.ok) {
        setState(prev => ({ 
          ...prev,
          balances: { ...prev.balances, rsf: '100' },
          isProcessing: false 
        }));
        
        setTimeout(handleNextStep, 1500);
      } else {
        throw new Error(result.error || 'Token claim failed');
      }
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        errorMessage: error instanceof Error ? error.message : 'Claim failed',
        isProcessing: false 
      }));
    }
  };

  const handleSwap = async () => {
    if (state.isProcessing || !state.swapAmount || parseFloat(state.swapAmount) <= 0) return;

    const amount = parseFloat(state.swapAmount);
    if (amount > parseFloat(state.balances.rsf)) {
      setState(prev => ({ ...prev, errorMessage: 'Insufficient RSF balance' }));
      return;
    }

    setState(prev => ({ ...prev, isProcessing: true, errorMessage: '' }));

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));

      const usdcReceived = (amount * 0.95).toFixed(2);
      
      setState(prev => ({
        ...prev,
        balances: {
          rsf: (parseFloat(prev.balances.rsf) - amount).toString(),
          usdc: (parseFloat(prev.balances.usdc) + parseFloat(usdcReceived)).toString()
        },
        swapResult: {
          from: `${amount} RSF`,
          to: `${usdcReceived} USDC`
        },
        isProcessing: false,
        swapAmount: ''
      }));

      setTimeout(handleNextStep, 2000);
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        errorMessage: 'Swap failed',
        isProcessing: false 
      }));
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      console.error('Copy failed:', error);
    }
  };

  const formatAddress = (address: string) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const getReputationProgress = () => {
    return 25;
  };

  const currentStepInfo = getStepInfo(state.currentStep);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-600 to-red-600 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/2 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <Card className="w-full max-w-4xl relative z-10 shadow-2xl backdrop-blur-sm border-white/20">
        <div className="px-6 pt-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-gray-600">Step {currentStepInfo.number} of {currentStepInfo.total}</span>
            </div>
            <div className="w-32 h-2 bg-gray-200 rounded-full">
              <div 
                className="h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-300"
                style={{ width: `${(currentStepInfo.number / currentStepInfo.total) * 100}%` }}
              ></div>
            </div>
          </div>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {currentStepInfo.title}
            </h1>
            <p className="text-gray-600 mt-2">{currentStepInfo.subtitle}</p>
          </div>
        </div>

        <CardContent className="pt-6">
          {state.errorMessage && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{state.errorMessage}</p>
            </div>
          )}

          {state.currentStep === 'welcome' && (
            <div className="text-center space-y-8">
              <div className="space-y-4">
                <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mx-auto animate-bounce">
                  <Rocket className="w-12 h-12 text-white" />
                </div>
                <p className="text-lg text-gray-600 max-w-md mx-auto">
                  Resourceful is the future of decentralized work-to-earn platforms. 
                  Experience seamless blockchain interactions, token management, and smart contract functionality.
                </p>
              </div>

              <div className="space-y-4">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-6 text-lg font-semibold transform transition-all duration-200 hover:scale-105"
                  onClick={handleNextStep}
                >
                  Start Demo <Sparkles className="ml-2 h-5 w-5" />
                </Button>
                <p className="text-xs text-gray-500">This demo will take about 2 minutes</p>
              </div>
            </div>
          )}

          {state.currentStep === 'wallet' && (
            <div className="space-y-8">
              <div className="text-center space-y-4">
                <div className={`transition-all duration-500 ${state.walletAddress ? 'scale-110' : 'scale-100'}`}>
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-teal-500 rounded-full mx-auto mb-4">
                    <Wallet className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold">Secure Wallet Generation</h2>
                  <p className="text-gray-600">Creating your blockchain identity</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-6 text-center">
                  {state.isProcessing ? (
                    <div className="space-y-4">
                      <Loader2 className="w-12 h-12 mx-auto text-purple-600 animate-spin" />
                      <p className="text-gray-600">Generating secure wallet...</p>
                    </div>
                  ) : state.walletAddress ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-center space-x-2 text-green-600">
                        <CheckCircle className="w-6 h-6" />
                        <span className="font-semibold">Wallet Created Successfully!</span>
                      </div>
                      <div className="bg-white rounded-lg p-4 border">
                        <p className="text-sm text-gray-500 mb-2">Your Wallet Address</p>
                        <div className="flex items-center justify-between">
                          <code className="font-mono text-sm">{formatAddress(state.walletAddress)}</code>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => copyToClipboard(state.walletAddress)}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <Button 
                      size="lg" 
                      className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white px-8 py-4"
                      onClick={generateWallet}
                    >
                      Generate Wallet <RefreshCw className="ml-2 h-5 w-5" />
                    </Button>
                  )}
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={handlePreviousStep}>
                    Back
                  </Button>
                  <Button 
                    onClick={handleNextStep} 
                    disabled={!state.walletAddress}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                  >
                    Continue
                  </Button>
                </div>
              </div>
            </div>
          )}

          {state.currentStep === 'claim' && (
            <div className="space-y-8">
              <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full mx-auto mb-4">
                  <Coins className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold">Claim Your Tokens</h2>
                <p className="text-gray-600">Receive your welcome 100 RSF tokens</p>
              </div>

              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-6 text-center">
                  {state.isProcessing ? (
                    <div className="space-y-4">
                      <div className="flex justify-center space-x-2">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className={`w-4 h-4 bg-purple-500 rounded-full animate-bounce`} style={{ animationDelay: `${i * 0.1}s` }}></div>
                        ))}
                      </div>
                      <p className="text-gray-600">Minting tokens on blockchain...</p>
                    </div>
                  ) : parseFloat(state.balances.rsf) > 0 ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-center space-x-2 text-green-600">
                        <CheckCircle className="w-6 h-6" />
                        <span className="font-semibold">Tokens Claimed!</span>
                      </div>
                      <div className="bg-white rounded-lg p-4 border">
                        <p className="text-sm text-gray-500 mb-2">Your Balance</p>
                        <div className="text-2xl font-bold text-purple-600">100 RSF</div>
                        <p className="text-xs text-gray-500 mt-1">≈ $50.00 USD</p>
                      </div>
                    </div>
                  ) : (
                    <Button 
                      size="lg" 
                      className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white px-8 py-4"
                      onClick={claimTokens}
                    >
                      Claim 100 RSF Tokens
                    </Button>
                  )}
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={handlePreviousStep}>
                    Back
                  </Button>
                  <Button 
                    onClick={handleNextStep} 
                    disabled={parseFloat(state.balances.rsf) === 0}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                  >
                    Continue
                  </Button>
                </div>
              </div>
            </div>
          )}

          {state.currentStep === 'balance' && (
            <div className="space-y-8">
              <div className="text-center space-y-4">
                <h2 className="text-2xl font-bold">Your Resourceful Dashboard</h2>
                <p className="text-gray-600">Track your tokens and reputation</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Coins className="w-5 h-5" />
                      <span>Token Balance</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">{state.balances.rsf} RSF</div>
                        <div className="text-sm text-gray-600">≈ ${(parseFloat(state.balances.rsf) * 0.5).toFixed(2)} USD</div>
                      </div>
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{state.balances.usdc} USDC</div>
                        <div className="text-sm text-gray-600">≈ ${state.balances.usdc} USD</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Sparkles className="w-5 h-5" />
                      <span>Reputation Status</span>
                    </CardTitle>
                    <CardDescription>Observer Tier</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress to Contributor</span>
                        <span>{getReputationProgress()}%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full">
                        <div 
                          className="h-2 bg-gradient-to-r from-green-500 to-blue-500 rounded-full transition-all duration-300"
                          style={{ width: `${getReputationProgress()}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="text-center text-sm text-gray-600">
                      Complete more actions to level up your reputation
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={handlePreviousStep}>
                  Back
                </Button>
                <Button 
                  onClick={handleNextStep}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                >
                  Continue
                </Button>
              </div>
            </div>
          )}

          {state.currentStep === 'swap' && (
            <div className="space-y-8">
              <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-500 to-blue-500 rounded-full mx-auto mb-4">
                  <ArrowRightLeft className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold">Swap Tokens</h2>
                <p className="text-gray-600">Exchange RSF for USDC using Uniswap</p>
              </div>

              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Amount to Swap</label>
                        <div className="flex space-x-2">
                          <Input
                            type="number"
                            placeholder="0.00"
                            value={state.swapAmount}
                            onChange={(e) => setState(prev => ({ ...prev, swapAmount: e.target.value }))}
                            className="flex-1"
                          />
                          <Button variant="outline" onClick={() => setState(prev => ({ ...prev, swapAmount: state.balances.rsf }))}>
                            Max
                          </Button>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Available: {state.balances.rsf} RSF</p>
                      </div>

                      <div className="bg-white rounded-lg p-4 border">
                        <div className="flex justify-between text-sm mb-2">
                          <span>From:</span>
                          <span className="font-semibold">{state.swapAmount || '0'} RSF</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>To:</span>
                          <span className="font-semibold text-green-600">
                            {state.swapAmount ? (parseFloat(state.swapAmount) * 0.95).toFixed(2) : '0'} USDC
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">Estimated with 5% slippage</p>
                      </div>

                      <Button 
                        size="lg" 
                        className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white"
                        onClick={handleSwap}
                        disabled={state.isProcessing || !state.swapAmount || parseFloat(state.swapAmount) <= 0}
                      >
                        {state.isProcessing ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing Swap...
                          </>
                        ) : (
                          'Swap Tokens'
                        )}
                      </Button>
                    </div>

                    <div className="space-y-4">
                      {state.swapResult && (
                        <div className="bg-white rounded-lg p-6 border-2 border-green-200">
                          <div className="text-center space-y-4">
                            <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
                            <div className="space-y-2">
                              <p className="text-sm text-gray-600">Successfully Swapped</p>
                              <div className="text-2xl font-bold text-green-600">{state.swapResult.from}</div>
                              <ArrowRight className="w-6 h-6 mx-auto text-gray-400" />
                              <div className="text-2xl font-bold text-blue-600">{state.swapResult.to}</div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={handlePreviousStep}>
                    Back
                  </Button>
                  <Button 
                    onClick={handleNextStep} 
                    disabled={!state.swapResult}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                  >
                    Continue
                  </Button>
                </div>
              </div>
            </div>
          )}

          {state.currentStep === 'complete' && (
            <div className="text-center space-y-8">
              <div className="space-y-4">
                <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mx-auto">
                  <CheckCircle className="w-12 h-12 text-white" />
                </div>
                <h2 className="text-3xl font-bold">Congratulations! 🎉</h2>
                <p className="text-gray-600 text-lg">You've successfully experienced Resourceful</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-6 space-y-6">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-white rounded-lg border">
                    <div className="w-12 h-12 bg-blue-100 rounded-full mx-auto mb-3 flex items-center justify-center">
                      <Wallet className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="font-semibold">Wallet Created</h3>
                    <p className="text-sm text-gray-600 mt-1">{formatAddress(state.walletAddress)}</p>
                  </div>
                  
                  <div className="text-center p-4 bg-white rounded-lg border">
                    <div className="w-12 h-12 bg-yellow-100 rounded-full mx-auto mb-3 flex items-center justify-center">
                      <Coins className="w-6 h-6 text-yellow-600" />
                    </div>
                    <h3 className="font-semibold">Tokens Claimed</h3>
                    <p className="text-sm text-gray-600 mt-1">100 RSF received</p>
                  </div>
                  
                  <div className="text-center p-4 bg-white rounded-lg border">
                    <div className="w-12 h-12 bg-green-100 rounded-full mx-auto mb-3 flex items-center justify-center">
                      <ArrowRightLeft className="w-6 h-6 text-green-600" />
                    </div>
                    <h3 className="font-semibold">Tokens Swapped</h3>
                    <p className="text-sm text-gray-600 mt-1">RSF → USDC completed</p>
                  </div>
                </div>

                <div className="pt-4">
                  <a href="/signup">
                    <Button 
                      size="lg" 
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-12 py-6 text-lg font-semibold transform transition-all duration-200 hover:scale-105"
                    >
                      Join Resourceful <ArrowRight className="ml-2 h-6 w-6" />
                    </Button>
                  </a>
                  <p className="text-xs text-gray-500 mt-2">Start your journey with real blockchain interactions</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
