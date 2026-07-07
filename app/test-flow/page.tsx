"use client";

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, CheckCircle, XCircle, RefreshCw, Zap, Wallet, Coins, ArrowRight, Copy, ChevronRight, ChevronLeft } from 'lucide-react';
import Step2Progress from '@/components/cockpit/Step2Progress';

type ViewMode = 'user' | 'dev';
type StepStatus = 'pending' | 'loading' | 'complete' | 'error';

interface Step {
  id: number;
  title: string;
  description: string;
  status: StepStatus;
  action: string;
}

interface Diagnostics {
  nodeRunning: boolean;
  contractsDeployed: boolean;
  tokenConfigured: boolean;
  accountFunded: boolean;
  allGood: boolean;
}

const CrossmintEmbeddedCheckout = ({ onSuccess }: { onSuccess?: () => void }) => {
  const [loading, setLoading] = useState(false);

  return (
    <div className="p-4 bg-black/30 rounded-lg border border-white/10">
      <p className="text-sm text-slate-300 mb-3">Crossmint Integration:</p>
      <p className="text-xs text-slate-400 mb-3">
        Simulated Crossmint onramp for demo purposes.
      </p>
      <button
        onClick={() => {
          setLoading(true);
          setTimeout(() => {
            setLoading(false);
            onSuccess?.();
          }, 1500);
        }}
        disabled={loading}
        className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
      >
        {loading ? 'Processing...' : 'Open Crossmint Onramp'}
      </button>
    </div>
  );
};

export default function TestFlowPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('user');
  const [wallet, setWallet] = useState<string | null>(null);
  const [privateKey, setPrivateKey] = useState<string | null>(null);
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [firstTimeSetup, setFirstTimeSetup] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const [diagnostics, setDiagnostics] = useState<Diagnostics>({
    nodeRunning: false,
    contractsDeployed: false,
    tokenConfigured: false,
    accountFunded: false,
    allGood: false,
  });

  const [provider, setProvider] = useState<ethers.JsonRpcProvider | null>(null);

  useEffect(() => {
    const initProvider = async () => {
      try {
        const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || 'http://localhost:8545';
        const provider = new ethers.JsonRpcProvider(rpcUrl);
        await provider.getNetwork();
        setProvider(provider);
        addLog('✅ Blockchain provider initialized');
      } catch (error) {
        addLog('❌ Failed to initialize blockchain provider');
        console.error('Provider init error:', error);
      }
    };

    initProvider();
  }, []);

  const [steps, setSteps] = useState<Step[]>([
    { id: 1, title: 'Create Your Wallet', description: 'Generate a new wallet address to get started', status: 'pending', action: 'Create Wallet' },
    { id: 2, title: 'Claim Your Tokens', description: 'Mint 100 RSF tokens to your wallet', status: 'pending', action: 'Claim Tokens' },
    { id: 3, title: 'Your Balance', description: 'Check your current RSF token balance', status: 'pending', action: 'Check Balance' },
    { id: 4, title: 'Buy USDC', description: 'Purchase USDC using Crossmint onramp', status: 'pending', action: 'Buy USDC' },
    { id: 5, title: 'Add Liquidity', description: 'Add RSF and USDC to liquidity pool', status: 'pending', action: 'Add Liquidity' },
    { id: 6, title: 'Swap Tokens', description: 'Swap RSF for USDC (now works with liquidity)', status: 'pending', action: 'Swap Tokens' },
    { id: 7, title: 'Remove Liquidity', description: 'Remove your liquidity from the pool', status: 'pending', action: 'Remove Liquidity' },
    { id: 8, title: 'Cash Out', description: 'Convert USDC to fiat using Crossmint offramp', status: 'pending', action: 'Cash Out' },
  ]);

  const [onrampCompleted, setOnrampCompleted] = useState(false);
  const [liquidityAdded, setLiquidityAdded] = useState(false);
  const [liquidityAmount, setLiquidityAmount] = useState(0);
  const [usdcBalance, setUsdcBalance] = useState(0);
  const [swapCompleted, setSwapCompleted] = useState(false);
  const [offrampCompleted, setOfframpCompleted] = useState(false);
  const [isStep2InProgress, setIsStep2InProgress] = useState(false);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`].slice(-50));
  };

  const generateWallet = async () => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      addLog('🎯 Creating your wallet...');
      const wallet = ethers.Wallet.createRandom();
      setWallet(wallet.address);
      setPrivateKey(wallet.privateKey);

      setSteps(prev => prev.map(step => (step.id === 1 ? { ...step, status: 'complete' } : step)));
      addLog(`✅ Wallet created: ${wallet.address.substring(0, 6)}...${wallet.address.slice(-4)}`);
      addLog('🔑 Private key stored securely');
      setSuccessMessage('Wallet created successfully!');

      setSteps(prev => prev.map(step => (step.id === 2 ? { ...step, status: 'pending' } : step)));
    } catch (error) {
      addLog('❌ Wallet creation failed');
      setError('Failed to create wallet');
    } finally {
      setLoading(false);
    }
  };

  const checkHardhatNode = async (): Promise<boolean> => {
    if (!provider) return false;

    try {
      await provider.getBlockNumber();
      return true;
    } catch (error) {
      return false;
    }
  };

  const claimTokens = async () => {
    if (!wallet) return;

    setIsStep2InProgress(true);
    setLoading(true);
    setLoadingMessage('Checking your wallet setup...');

    try {
      addLog('🔍 Checking blockchain...');
      const provider = new ethers.JsonRpcProvider('http://localhost:8545');

      let nodeRunning = false;
      try {
        await provider.getBlockNumber();
        nodeRunning = true;
        addLog('✅ Blockchain connected');
      } catch {
        addLog('⚙️ Blockchain not running, starting it now...');
        setLoadingMessage('Starting blockchain environment... (first time takes 30 seconds)');
      }

      if (!nodeRunning) {
        try {
          const startResponse = await fetch('/api/system/start-node', { method: 'POST' });

          const startData = await startResponse.json();

          if (startData.success) {
            addLog('✅ Blockchain started');
            setLoadingMessage('Blockchain starting up...');
            await new Promise(resolve => setTimeout(resolve, 8000));
          } else {
            throw new Error(startData.error || 'Could not start blockchain automatically');
          }
        } catch (error) {
          setLoadingMessage('Setup failed. Please contact support.');
          addLog(`❌ Auto-start failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
          setLoading(false);
          return;
        }
      }

      setLoadingMessage('Deploying smart contracts... (one-time setup)');
      addLog('🔍 Checking contracts...');

      let contractsDeployed = false;
      try {
        const tokenAddress = process.env.NEXT_PUBLIC_RESOURCEFUL_TOKEN_ADDRESS;
        if (tokenAddress) {
          const code = await provider.getCode(tokenAddress);
          contractsDeployed = code !== '0x';

          if (contractsDeployed) {
            addLog('✅ Contracts ready');
          }
        } else {
          addLog('⚠️ Token address not configured');
        }
      } catch {
        addLog('⚙️ Contracts not found, deploying now...');
      }

      if (!contractsDeployed) {
        try {
          setLoadingMessage('Deploying smart contracts... (one-time setup)');

          const deployResponse = await fetch('/api/system/deploy-contracts', { method: 'POST' });

          const deployData = await deployResponse.json();

          if (deployData.success) {
            addLog('✅ Contracts deployed');
            await new Promise(resolve => setTimeout(resolve, 2000));
          } else {
            throw new Error(deployData.error || 'Could not deploy contracts automatically');
          }
        } catch (error) {
          setLoadingMessage('Setup failed. Please contact support.');
          addLog(`❌ Auto-deploy failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
          setLoading(false);
          return;
        }
      }

      setLoadingMessage('Claiming your 100 RSF tokens...');
      addLog('💰 Minting tokens...');

      const response = await fetch('/api/tokens/mint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: wallet, amount: '100' }),
      });

      if (!response.ok) {
        const error = await response.json();
        setLoadingMessage('Claim failed. Please try again.');
        addLog(`❌ Mint failed: ${error.error}`);
        setLoading(false);
        return;
      }

      const data = await response.json();
      addLog(`✅ Successfully claimed 100 RSF!`);
      addLog(`📝 Transaction: ${data.txHash}`);

      setLoadingMessage('Success! Updating your balance...');
      await updateBalance();

      setLoadingMessage('');
      setFirstTimeSetup(true);
    } catch (error: any) {
      setLoadingMessage('Something went wrong. Please try again.');
      addLog(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
      setLoadingMessage('');
    }
  };

  const updateBalance = async () => {
    if (!wallet || !provider) return;

    setLoading(true);
    setError(null);

    try {
      addLog('🎯 Checking your balance...');

      const tokenAddress = process.env.NEXT_PUBLIC_RESOURCEFUL_TOKEN_ADDRESS;
      if (!tokenAddress) {
        throw new Error('RSF token address not configured');
      }

      const tokenAbi = ['function balanceOf(address) view returns (uint256)', 'function decimals() view returns (uint8)'];

      const tokenContract = new ethers.Contract(tokenAddress, tokenAbi, provider);
      const rsfBalance = await tokenContract.balanceOf(wallet);
      const rsfDecimals = await tokenContract.decimals();
      const rsfBalanceFormatted = ethers.formatUnits(rsfBalance, rsfDecimals);

      const balanceNum = parseFloat(rsfBalanceFormatted);
      setBalance(balanceNum);
      addLog(`RSF balance: ${rsfBalanceFormatted} RSF`);

      setSteps(prev => prev.map(step => (step.id === 3 ? { ...step, status: 'complete' } : step)));
      setSteps(prev => prev.map(step => (step.id === 4 ? { ...step, status: 'pending' } : step)));
    } catch (error: any) {
      addLog(`❌ Failed to read balance: ${error.message}`);
      setError(`Failed to read balance: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testSwap = async () => {
    if (!wallet) return;

    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      addLog('🔄 Simulating token swap...');
      await new Promise(resolve => setTimeout(resolve, 2000));

      addLog('✅ Swap simulation successful!');
      addLog('💡 In production, this would:');
      addLog('   1. Approve Uniswap router to spend 10 RSF');
      addLog('   2. Execute swap through Uniswap pool');
      addLog('   3. Receive USDC tokens in return');
      addLog('   4. Update both RSF and USDC balances');

      setSwapCompleted(true);

      setSteps(prev => prev.map(step => (step.id === 6 ? { ...step, status: 'complete' } : step)));

      setSuccessMessage('Swap test completed! (Simulated - requires actual contracts and liquidity)');
    } catch (error: any) {
      addLog(`❌ Simulation error: ${error.message}`);
      setError(`Simulation error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCrossmintSuccess = () => {
    addLog('💳 Crossmint payment successful - simulating USDC minting...');

    setOnrampCompleted(true);
    setUsdcBalance(50);

    setSteps(prev => prev.map(step => (step.id === 4 ? { ...step, status: 'complete' } : step)));

    addLog('✅ USDC purchased! You now have 50 USDC.');
    setSuccessMessage('USDC purchase completed! You can now add liquidity to the pool.');
  };

  const runDiagnostics = async () => {
    setLoading(true);
    setError(null);

    try {
      addLog('\n=== 🔍 RUNNING SYSTEM DIAGNOSTICS ===');

      const results: Diagnostics = {
        nodeRunning: false,
        contractsDeployed: false,
        tokenConfigured: false,
        accountFunded: false,
        allGood: false,
      };

      addLog('📡 Testing blockchain node connectivity...');
      const nodeRunning = await checkHardhatNode();
      results.nodeRunning = nodeRunning;

      if (nodeRunning) {
        const blockNumber = await provider!.getBlockNumber();
        addLog(`✅ Blockchain node reachable, block #${blockNumber}`);
      } else {
        addLog('❌ Cannot reach blockchain node');
        addLog('💡 Fix: Run "cd resourceful-contracts && npx hardhat node" in a new terminal');
      }

      addLog('💰 Checking token configuration...');
      const tokenAddress = process.env.NEXT_PUBLIC_RESOURCEFUL_TOKEN_ADDRESS;
      if (tokenAddress) {
        results.tokenConfigured = true;
        addLog(`✅ Token address configured: ${tokenAddress}`);

        try {
          const code = await provider!.getCode(tokenAddress);
          if (code !== '0x') {
            results.contractsDeployed = true;
            addLog(`✅ Token contract exists on blockchain`);
          } else {
            addLog(`❌ Token contract NOT found at ${tokenAddress}`);
            addLog(`💡 Fix: Run "cd resourceful-contracts && npx hardhat run scripts/deploy.ts --network localhost"`);
          }
        } catch (error: any) {
          addLog(`❌ Token contract check failed: ${error.message}`);
        }
      } else {
        addLog(`❌ NEXT_PUBLIC_RESOURCEFUL_TOKEN_ADDRESS not configured`);
        addLog(`💡 Fix: Check .env.local file has NEXT_PUBLIC_RESOURCEFUL_TOKEN_ADDRESS set`);
      }

      addLog('💵 Checking test account funding...');
      const testAccount = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266';
      try {
        const balance = await provider!.getBalance(testAccount);
        const balanceFormatted = ethers.formatEther(balance);
        if (balance > 0) {
          results.accountFunded = true;
          addLog(`✅ Test account has ${balanceFormatted} ETH`);
        } else {
          addLog(`❌ Test account has no ETH (minting will fail)`);
          addLog(`💡 Fix: Ensure Hardhat node is running with funded accounts`);
        }
      } catch (error: any) {
        addLog(`❌ Account check failed: ${error.message}`);
      }

      results.allGood = results.nodeRunning && results.contractsDeployed && results.tokenConfigured && results.accountFunded;
      setDiagnostics(results);
      setSuccessMessage(results.allGood ? 'All systems operational!' : 'Some issues detected. Check logs for fixes.');

      addLog('=== 📊 DIAGNOSTICS COMPLETE ===\n');
    } catch (error: any) {
      addLog(`❌ Diagnostics failed: ${error.message}`);
      setError(`Diagnostics failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    addLog('📋 Command copied to clipboard');
  };

  const getStatusIcon = (status: StepStatus) => {
    switch (status) {
      case 'complete':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'loading':
        return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />;
      default:
        return <div className="w-5 h-5 rounded-full border-2 border-gray-300" />;
    }
  };

  const getStepButton = (step: Step) => {
    const isStepEnabled = () => {
      switch (step.id) {
        case 1:
          return true;
        case 2:
          return steps[0].status === 'complete';
        case 3:
          return steps[1].status === 'complete';
        case 4:
          return steps[2].status === 'complete' && balance > 0;
        case 5:
          return onrampCompleted;
        case 6:
          return liquidityAdded;
        case 7:
          return liquidityAdded;
        case 8:
          return usdcBalance > 0;
        default:
          return false;
      }
    };

    const isDisabled = step.status === 'loading' || !isStepEnabled();

    const handleClick = () => {
      switch (step.id) {
        case 1:
          generateWallet();
          break;
        case 2:
          claimTokens();
          break;
        case 3:
          updateBalance();
          break;
        case 4:
          handleCrossmintSuccess();
          break;
        case 5:
          setLiquidityAdded(true);
          setLiquidityAmount(25);
          setSteps(prev => prev.map(s => (s.id === 5 ? { ...s, status: 'complete' } : s)));
          break;
        case 6:
          testSwap();
          break;
        case 7:
          setLiquidityAdded(false);
          setSteps(prev => prev.map(s => (s.id === 7 ? { ...s, status: 'complete' } : s)));
          break;
        case 8:
          setOfframpCompleted(true);
          setUsdcBalance(0);
          setSteps(prev => prev.map(s => (s.id === 8 ? { ...s, status: 'complete' } : s)));
          break;
      }
    };

    return (
      <Button
        onClick={handleClick}
        disabled={isDisabled || loading}
        className={`
          w-full gap-3 h-12 text-base font-semibold
          ${step.status === 'complete' ? 'bg-green-600 hover:bg-green-700 text-white border-green-500/30' : step.status === 'loading' ? 'bg-blue-600 hover:bg-blue-700 text-white border-blue-500/30' : isStepEnabled() ? 'bg-blue-600 hover:bg-blue-700 text-white border-blue-500/30' : 'bg-gray-600 text-gray-400 border-gray-500/30 cursor-not-allowed'}
          ${isDisabled ? 'opacity-50' : 'shadow-lg hover:shadow-xl'}
          transition-all duration-200 transform hover:scale-105
        `}
      >
        {loading && step.id === 2 ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            {loadingMessage || 'Setting up your wallet...'}
          </>
        ) : step.status === 'loading' ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Processing...
          </>
        ) : step.status === 'complete' ? (
          <>
            <CheckCircle className="h-5 w-5" />
            Complete
          </>
        ) : (
          <>
            <Zap className="h-5 w-5" />
            {step.action}
          </>
        )}
      </Button>
    );
  };

  const UserOnboardingFlow = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-[#E8EDF2] mb-2">Welcome to Resourceful</h2>
        <p className="text-[#8B98A5]">Complete these steps to get started with your blockchain journey</p>
      </div>

      {wallet && (
        <div className="mt-6 p-6 bg-gradient-to-br from-blue-600/20 to-cyan-600/20 rounded-xl border border-blue-500/40 shadow-lg">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <Wallet className="h-4 w-4 text-white" />
            </div>
            <div>
              <h4 className="text-sm font-medium text-blue-300">Your Wallet</h4>
              <p className="text-xs text-blue-200">Securely generated for this session</p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <div className="text-xs text-blue-200 mb-1">Address:</div>
              <div className="text-sm font-mono text-white bg-black/30 px-3 py-2 rounded-lg border border-blue-500/30 break-all">{wallet}</div>
            </div>

            {privateKey && (
              <div>
                <div className="text-xs text-blue-200 mb-1">Private Key:</div>
                <div className="text-xs font-mono text-blue-100 bg-black/30 px-3 py-2 rounded-lg border border-blue-500/30">
                  {privateKey.substring(0, 6)}...{privateKey.slice(-4)}
                </div>
                <div className="text-xs text-blue-300 mt-1">🔒 Keep this secure - never share with anyone</div>
              </div>
            )}
          </div>
        </div>
      )}

      {wallet && !firstTimeSetup && (
        <div className="p-6 bg-gradient-to-br from-yellow-600/20 to-orange-600/20 rounded-xl border border-yellow-500/40 shadow-lg">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-2xl">⚠️</span>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-yellow-300 mb-2">First-Time Setup Required</h3>
              <p className="text-yellow-200 mb-4">
                This is your first time claiming tokens. The system will automatically set up:
              </p>
              <ul className="text-yellow-200 space-y-1 text-sm">
                <li>• Blockchain node (if not running)</li>
                <li>• Smart contracts (if not deployed)</li>
                <li>• Your token allocation</li>
              </ul>
              <p className="text-yellow-200 mt-3 text-sm">This process takes about 30 seconds and only needs to be done once.</p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {steps.map(step => (
          <div key={step.id} className="p-6 rounded-lg bg-white/[0.03] border border-white/10 hover:border-white/20 transition-colors">
            <div className="flex items-center gap-4 mb-6">
              <div
                className={`
                  w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg
                  ${step.status === 'complete' ? 'bg-green-500 text-white shadow-lg shadow-green-500/50' : 'bg-blue-500/20 border-2 border-blue-500 text-blue-400'}
                `}
              >
                {step.status === 'complete' ? '✓' : step.id}
              </div>

              <div className="flex-1">
                <h3 className="text-xl font-semibold text-white mb-1">{step.title}</h3>
                <p className="text-sm text-slate-300">{step.description}</p>
              </div>

              {step.status === 'complete' && (
                <div className="px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-full">
                  <span className="text-xs font-medium text-green-400">Complete</span>
                </div>
              )}
            </div>

            {step.id === 3 && wallet && (
              <div className="p-6 bg-gradient-to-br from-blue-600/20 to-cyan-600/20 border border-blue-500/30 rounded-xl mb-6">
                <div className="text-center">
                  <p className="text-sm text-slate-400 mb-2">Your Balance</p>
                  <div className="text-5xl font-bold text-white mb-2">
                    {balance.toFixed(2)}
                    <span className="text-2xl text-blue-400 ml-2">RSF</span>
                  </div>
                  <p className="text-lg text-slate-400">≈ £{(balance * 0.01).toFixed(2)}</p>

                  <button onClick={updateBalance} className="mt-4 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-sm text-white transition-colors">
                    🔄 Refresh Balance
                  </button>
                </div>
              </div>
            )}

            {!wallet && step.id === 3 && <p className="text-sm text-slate-400 mb-6">Complete Step 1 and Step 2 first</p>}

            {step.id === 4 && balance > 0 && !onrampCompleted && (
              <div className="space-y-4">
                <p className="text-sm text-slate-400">Purchase USDC using Crossmint onramp to get started with trading.</p>

                <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                  <p className="text-sm text-purple-400 mb-2">
                    💳 <strong>Crossmint Onramp</strong>
                  </p>
                  <p className="text-xs text-slate-400">Convert fiat to USDC using our integrated Crossmint service.</p>
                </div>

                <CrossmintEmbeddedCheckout onSuccess={handleCrossmintSuccess} />

                {onrampCompleted && (
                  <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <p className="text-sm text-green-400">✅ USDC purchased! You now have {usdcBalance} USDC.</p>
                  </div>
                )}
              </div>
            )}

            {step.id === 5 && onrampCompleted && !liquidityAdded && (
              <div className="space-y-4">
                <p className="text-sm text-slate-400">Add RSF and USDC to the liquidity pool to enable trading.</p>

                <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                  <p className="text-sm text-orange-400 mb-2">
                    🌊 <strong>Liquidity Pool</strong>
                  </p>
                  <p className="text-xs text-slate-400">Provide liquidity to the RSF/USDC pool and earn trading fees.</p>
                </div>

                <button
                  onClick={() => {
                    setLiquidityAdded(true);
                    setLiquidityAmount(25);
                    setSteps(prev => prev.map(s => (s.id === 5 ? { ...s, status: 'complete' } : s)));
                  }}
                  className="w-full px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors"
                >
                  🌊 Add Liquidity to Pool
                </button>

                {liquidityAdded && (
                  <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <p className="text-sm text-green-400">✅ Liquidity added! Pool is now ready for trading.</p>
                  </div>
                )}
              </div>
            )}

            {step.id === 6 && liquidityAdded && !swapCompleted && (
              <div className="space-y-4">
                <p className="text-sm text-slate-400">Swap RSF for USDC using the liquidity pool you just created.</p>

                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <p className="text-sm text-blue-400 mb-2">
                    🔄 <strong>Token Swap</strong>
                  </p>
                  <p className="text-xs text-slate-400">Now that liquidity is available, you can swap tokens successfully!</p>
                </div>

                <button
                  onClick={testSwap}
                  disabled={loading || balance < 10}
                  className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 border border-blue-500 text-white font-medium rounded-lg transition-colors disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      Swapping tokens...
                    </span>
                  ) : (
                    '🔄 Swap RSF for USDC'
                  )}
                </button>

                {swapCompleted && (
                  <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <p className="text-sm text-green-400">✅ Swap completed! You've successfully traded RSF for USDC.</p>
                  </div>
                )}
              </div>
            )}

            {step.id === 7 && liquidityAdded && (
              <div className="space-y-4">
                <p className="text-sm text-slate-400">Remove your liquidity from the pool and receive your tokens back.</p>

                <div className="p-4 bg-pink-500/10 border border-pink-500/20 rounded-lg">
                  <p className="text-sm text-pink-400 mb-2">
                    🏊 <strong>Remove Liquidity</strong>
                  </p>
                  <p className="text-xs text-slate-400">Withdraw your share of the liquidity pool and collect any fees earned.</p>
                </div>

                <button
                  onClick={() => {
                    setLiquidityAdded(false);
                    setSteps(prev => prev.map(s => (s.id === 7 ? { ...s, status: 'complete' } : s)));
                  }}
                  className="w-full px-6 py-3 bg-pink-600 hover:bg-pink-700 text-white font-medium rounded-lg transition-colors"
                >
                  🏊 Remove Liquidity
                </button>
              </div>
            )}

            {step.id === 8 && usdcBalance > 0 && !offrampCompleted && (
              <div className="space-y-4">
                <p className="text-sm text-slate-400">Convert your USDC back to fiat using Crossmint offramp.</p>

                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <p className="text-sm text-red-400 mb-2">
                    💰 <strong>Crossmint Offramp</strong>
                  </p>
                  <p className="text-xs text-slate-400">Convert your USDC back to fiat currency and withdraw to your bank account.</p>
                </div>

                <button
                  onClick={() => {
                    setOfframpCompleted(true);
                    setUsdcBalance(0);
                    setSteps(prev => prev.map(s => (s.id === 8 ? { ...s, status: 'complete' } : s)));
                  }}
                  className="w-full px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
                >
                  💰 Cash Out USDC
                </button>

                {offrampCompleted && (
                  <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <p className="text-sm text-green-400">✅ Cash out completed! Your USDC has been converted to fiat.</p>
                  </div>
                )}
              </div>
            )}

            {step.id === 2 && isStep2InProgress && (
              <div className="mt-6 border-t border-white/10 pt-6">
                <Step2Progress
                  isRunning={isStep2InProgress}
                  onProgressComplete={() => {
                    setIsStep2InProgress(false);
                    setSteps(prev => prev.map(s => (s.id === 2 ? { ...s, status: 'complete' } : s)));
                  }}
                />
              </div>
            )}

            <div className="flex gap-4">
              {getStepButton(step)}

              <div className="flex items-center gap-2 text-sm">
                {getStatusIcon(step.status)}
                <span
                  className={`
                    font-medium
                    ${step.status === 'complete' ? 'text-green-400' : step.status === 'loading' ? 'text-blue-400' : step.status === 'error' ? 'text-red-400' : 'text-slate-400'}
                  `}
                >
                  {step.status === 'complete' ? 'Complete' : step.status === 'loading' ? 'Processing...' : step.status === 'error' ? 'Error' : 'Pending'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {balance > 0 && (
        <div className="mt-6 p-6 bg-gradient-to-br from-green-600/20 to-emerald-600/20 rounded-xl border border-green-500/40 shadow-lg">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
              <Coins className="h-6 w-6 text-white" />
            </div>
            <div>
              <h4 className="text-sm font-medium text-green-300">Your Balance</h4>
              <p className="text-xs text-green-200">RSF tokens in your wallet</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="text-4xl font-bold text-white">
              {balance.toFixed(2)} RSF
            </div>
            <div className="text-sm text-green-200">≈ £{(balance * 0.01).toFixed(2)}</div>

            <div className="flex gap-3">
              <button
                onClick={updateBalance}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg border border-green-500/30 transition-colors shadow-md hover:shadow-lg"
              >
                <RefreshCw className="h-4 w-4 inline mr-2" />
                Refresh Balance
              </button>

              <button
                onClick={testSwap}
                disabled={balance < 10}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg border border-blue-500/30 transition-colors shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowRight className="h-4 w-4 inline mr-2" />
                Try Swap (10 RSF)
              </button>
            </div>
          </div>
        </div>
      )}

      {firstTimeSetup && (
        <div className="p-6 bg-gradient-to-br from-green-600/20 to-emerald-600/20 rounded-xl border border-green-500/40 shadow-lg">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-2xl">✅</span>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-green-300 mb-2">Setup Complete!</h3>
              <p className="text-green-200 mb-3">
                Your first-time setup has been completed successfully. The system has automatically:
              </p>
              <ul className="text-green-200 space-y-1 text-sm">
                <li>• Started the blockchain node</li>
                <li>• Deployed smart contracts</li>
                <li>• Minted your 100 RSF tokens</li>
              </ul>
              <p className="text-green-200 mt-3 text-sm">Future token claims will be much faster since the infrastructure is now ready.</p>
            </div>
          </div>
        </div>
      )}

      {balance > 0 && (
        <div className="mt-8 space-y-6">
          <div className="p-8 bg-gradient-to-br from-green-600/20 to-emerald-600/20 rounded-2xl border border-green-500/40 shadow-xl text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-4xl">🎉</span>
              </div>
            </div>

            <h3 className="text-2xl font-bold text-white mb-2">Congratulations!</h3>
            <p className="text-lg text-green-200 mb-6 max-w-2xl mx-auto">
              Your wallet is ready and you have {balance.toFixed(2)} RSF tokens. You can now use Resourceful!
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 bg-white/[0.03] rounded-xl border border-white/10 hover:border-white/20 transition-all duration-300 hover:transform hover:scale-105">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl">📚</span>
                </div>
                <div className="text-lg font-semibold text-white mb-2">Learn More</div>
                <p className="text-sm text-slate-300">Explore blockchain concepts, tokenomics, and how Resourceful works</p>
              </div>

              <div className="p-6 bg-white/[0.03] rounded-xl border border-white/10 hover:border-white/20 transition-all duration-300 hover:transform hover:scale-105">
                <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl">🔗</span>
                </div>
                <div className="text-lg font-semibold text-white mb-2">Connect</div>
                <p className="text-sm text-slate-300">Connect your wallet to dApps and start using your RSF tokens</p>
              </div>

              <div className="p-6 bg-white/[0.03] rounded-xl border border-white/10 hover:border-white/20 transition-all duration-300 hover:transform hover:scale-105">
                <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl">🚀</span>
                </div>
                <div className="text-lg font-semibold text-white mb-2">Build</div>
                <p className="text-sm text-slate-300">Start building your own blockchain applications with Resourceful</p>
              </div>
            </div>
          </div>

          <div className="p-6 bg-gradient-to-br from-blue-600/20 to-indigo-600/20 rounded-xl border border-blue-500/40">
            <h4 className="text-lg font-semibold text-blue-300 mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
              What You've Learned
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-white/[0.03] rounded-lg border border-white/10">
                <div className="font-semibold text-white mb-1">Wallet Creation</div>
                <p className="text-sm text-slate-300">How to generate a secure wallet address and private key</p>
              </div>
              <div className="p-4 bg-white/[0.03] rounded-lg border border-white/10">
                <div className="font-semibold text-white mb-1">Token Minting</div>
                <p className="text-sm text-slate-300">How to claim and manage your RSF tokens</p>
              </div>
              <div className="p-4 bg-white/[0.03] rounded-lg border border-white/10">
                <div className="font-semibold text-white mb-1">Balance Checking</div>
                <p className="text-sm text-slate-300">How to read your token balance on the blockchain</p>
              </div>
              <div className="p-4 bg-white/[0.03] rounded-lg border border-white/10">
                <div className="font-semibold text-white mb-1">Swap Simulation</div>
                <p className="text-sm text-slate-300">Understanding how decentralized exchanges work</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="bg-green-500/10 border border-green-500/50 rounded-lg p-4">
          <p className="text-green-400">{successMessage}</p>
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      <div className="mt-8 p-6 bg-white/[0.03] rounded-xl border border-white/10">
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm font-medium text-[#8B98A5]">Overall Progress</div>
          <div className="text-sm text-[#8B98A5]">
            {steps.filter(s => s.status === 'complete').length}/8 complete
          </div>
        </div>

        <div className="flex space-x-2">
          {steps.map((step, index) => (
            <div key={index} className="flex-1">
              <div className="flex items-center justify-between text-xs text-[#8B98A5] mb-1">
                <span>{step.title}</span>
                <span
                  className={`
                    px-2 py-1 rounded-full text-xs font-medium
                    ${step.status === 'complete' ? 'bg-green-500/20 text-green-400' : step.status === 'loading' ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-500/20 text-gray-400'}
                  `}
                >
                  {step.status === 'complete' ? 'Done' : step.status === 'loading' ? 'In Progress' : 'Pending'}
                </span>
              </div>
              <div className="w-full bg-gray-600 rounded-full h-2">
                <div
                  className={`
                    h-2 rounded-full transition-all duration-300
                    ${step.status === 'complete' ? 'w-full bg-green-500' : step.status === 'loading' ? 'w-1/2 bg-blue-500' : 'w-0 bg-gray-500'}
                  `}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const DevDiagnostics = () => (
    <div className="space-y-6">
      <div className="mb-6 p-4 rounded-lg bg-white/[0.03] border border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white mb-1">System Status</h3>
            <p className="text-sm text-slate-400">
              {diagnostics.allGood ? 'All systems operational' : `${Object.values(diagnostics).filter(Boolean).length - 1} / 4 checks passed`}
            </p>
          </div>
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl ${
              diagnostics.allGood ? 'bg-green-500/20 border-2 border-green-500' : 'bg-red-500/20 border-2 border-red-500'
            }`}
          >
            {diagnostics.allGood ? '✅' : '⚠️'}
          </div>
        </div>
      </div>

      {(!diagnostics.nodeRunning || !diagnostics.contractsDeployed) && (
        <div className="p-8 rounded-xl bg-gradient-to-br from-yellow-600/20 to-orange-600/20 border-2 border-yellow-500/50">
          <div className="text-center mb-6">
            <div className="text-5xl mb-4">⚠️</div>
            <h3 className="text-2xl font-bold text-white mb-2">Setup Required</h3>
            <p className="text-slate-300 text-lg">Run these commands in order to get started:</p>
          </div>

          <div className="space-y-4 max-w-2xl mx-auto">
            <div className="p-4 bg-black/30 rounded-lg border border-white/20">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold flex-shrink-0">1</div>
                <div className="flex-1">
                  <p className="text-sm text-slate-300 mb-2">Start Hardhat node (in a new terminal):</p>
                  <div className="p-2 bg-black/50 rounded font-mono text-xs text-green-400">
                    cd resourceful-contracts && npx hardhat node
                  </div>
                </div>
                <button
                  onClick={() => {
                    copyToClipboard('cd resourceful-contracts && npx hardhat node');
                  }}
                  className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded text-xs text-white"
                >
                  Copy
                </button>
              </div>
            </div>

            <div className="p-4 bg-black/30 rounded-lg border border-white/20">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold flex-shrink-0">2</div>
                <div className="flex-1">
                  <p className="text-sm text-slate-300 mb-2">Deploy contracts (in another terminal):</p>
                  <div className="p-2 bg-black/50 rounded font-mono text-xs text-green-400">
                    cd resourceful-contracts && npx hardhat run scripts/deploy.ts --network localhost
                  </div>
                </div>
                <button
                  onClick={() => {
                    copyToClipboard('cd resourceful-contracts && npx hardhat run scripts/deploy.ts --network localhost');
                  }}
                  className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded text-xs text-white"
                >
                  Copy
                </button>
              </div>
            </div>

            <div className="p-4 bg-black/30 rounded-lg border border-white/20">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold flex-shrink-0">3</div>
                <div className="flex-1">
                  <p className="text-sm text-slate-300">Refresh this page and try again</p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-6">
            <button onClick={runDiagnostics} className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg shadow-blue-500/20">
              Check Status Again
            </button>
          </div>
        </div>
      )}

      {diagnostics.nodeRunning && diagnostics.contractsDeployed && (
        <div className="p-8 rounded-xl bg-gradient-to-br from-green-600/20 to-emerald-600/20 border-2 border-green-500/50 text-center">
          <div className="text-6xl mb-4">✅</div>
          <h3 className="text-2xl font-bold text-white mb-2">System Ready!</h3>
          <p className="text-slate-300 text-lg mb-6">All systems are operational. You can now test the flow.</p>
          <button
            onClick={() => setViewMode('user')}
            className="px-8 py-3 bg-white text-slate-900 rounded-lg font-semibold hover:bg-slate-100 transition-colors"
          >
            Switch to User View →
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-6 rounded-lg bg-white/[0.03] border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Hardhat Node</h3>
            {diagnostics.nodeRunning ? <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div> : <div className="w-3 h-3 bg-red-500 rounded-full"></div>}
          </div>

          <p className={`text-sm mb-4 ${diagnostics.nodeRunning ? 'text-green-400' : 'text-red-400'}`}>
            {diagnostics.nodeRunning ? '✅ Running' : '❌ Not running or unreachable'}
          </p>

          {!diagnostics.nodeRunning && (
            <div className="space-y-2">
              <p className="text-xs text-slate-400">In terminal, run:</p>
              <div className="p-3 bg-black/30 rounded border border-white/10 font-mono text-xs text-slate-300">
                cd resourceful-contracts && npx hardhat node
              </div>
              <button
                onClick={() => {
                  copyToClipboard('cd resourceful-contracts && npx hardhat node');
                }}
                className="text-xs text-blue-400 hover:text-blue-300"
              >
                📋 Copy command
              </button>
            </div>
          )}
        </div>

        <div className="p-6 rounded-lg bg-white/[0.03] border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Contracts</h3>
            {diagnostics.contractsDeployed ? <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div> : <div className="w-3 h-3 bg-red-500 rounded-full"></div>}
          </div>

          <p className={`text-sm mb-4 ${diagnostics.contractsDeployed ? 'text-green-400' : 'text-red-400'}`}>
            {diagnostics.contractsDeployed ? '✅ Deployed' : '❌ Not deployed or missing'}
          </p>

          {!diagnostics.contractsDeployed && (
            <div className="space-y-2">
              <p className="text-xs text-slate-400">In terminal, run:</p>
              <div className="p-3 bg-black/30 rounded border border-white/10 font-mono text-xs text-slate-300">
                cd resourceful-contracts && npx hardhat run scripts/deploy.ts --network localhost
              </div>
              <button
                onClick={() => {
                  copyToClipboard('cd resourceful-contracts && npx hardhat run scripts/deploy.ts --network localhost');
                }}
                className="text-xs text-blue-400 hover:text-blue-300"
              >
                📋 Copy command
              </button>
            </div>
          )}
        </div>

        <div className="p-6 rounded-lg bg-white/[0.03] border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Token Configuration</h3>
            {diagnostics.tokenConfigured ? <div className="w-3 h-3 bg-green-500 rounded-full"></div> : <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>}
          </div>

          <p className={`text-sm mb-4 ${diagnostics.tokenConfigured ? 'text-green-400' : 'text-yellow-400'}`}>
            {diagnostics.tokenConfigured ? '✅ Configured correctly' : '⚠️ Missing or invalid'}
          </p>

          <div className="space-y-2">
            <p className="text-xs text-slate-400">Token Address:</p>
            <div className="p-3 bg-black/30 rounded border border-white/10 font-mono text-xs text-slate-300">
              {process.env.NEXT_PUBLIC_RESOURCEFUL_TOKEN_ADDRESS || 'Not configured'}
            </div>
          </div>
        </div>

        <div className="p-6 rounded-lg bg-white/[0.03] border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Test Account</h3>
            {diagnostics.accountFunded ? <div className="w-3 h-3 bg-green-500 rounded-full"></div> : <div className="w-3 h-3 bg-red-500 rounded-full"></div>}
          </div>

          <p className={`text-sm mb-4 ${diagnostics.accountFunded ? 'text-green-400' : 'text-red-400'}`}>
            {diagnostics.accountFunded ? '✅ Funded and ready' : '❌ No ETH (minting will fail)'}
          </p>

          <div className="space-y-2">
            <p className="text-xs text-slate-400">Account:</p>
            <div className="p-3 bg-black/30 rounded border border-white/10 font-mono text-xs text-slate-300">
              0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 rounded-lg bg-black/40 border border-white/10">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-white uppercase tracking-wide">Console Logs</h3>
          <button onClick={() => setLogs([])} className="text-xs text-slate-400 hover:text-white">
            Clear
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto space-y-1 font-mono text-xs">
          {logs.length === 0 ? (
            <p className="text-slate-500 text-center py-8">No logs yet...</p>
          ) : (
            logs.map((log, i) => (
              <div
                key={i}
                className={`
                  py-1
                  ${log.includes('✅') ? 'text-green-400' : log.includes('❌') ? 'text-red-400' : log.includes('💡') ? 'text-yellow-400' : log.includes('🎯') ? 'text-blue-400' : 'text-slate-400'}
                `}
              >
                {log}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[#E8EDF2]">Resourceful Flow Test</h1>
            <p className="text-sm text-[#8B98A5]">
              {viewMode === 'user' ? 'Complete the onboarding steps to get started' : 'Monitor and troubleshoot your Resourceful setup'}
            </p>
          </div>

          <div className="flex gap-2 p-1 bg-white/[0.02] rounded-lg border border-white/5">
            <button
              onClick={() => setViewMode('user')}
              className={`px-4 py-2 rounded text-sm transition-colors ${
                viewMode === 'user' ? 'bg-blue-500/20 text-blue-400' : 'text-[#8B98A5] hover:text-[#E8EDF2]'
              }`}
            >
              User View
            </button>
            <button
              onClick={() => setViewMode('dev')}
              className={`px-4 py-2 rounded text-sm transition-colors ${
                viewMode === 'dev' ? 'bg-blue-500/20 text-blue-400' : 'text-[#8B98A5] hover:text-[#E8EDF2]'
              }`}
            >
              Dev View
            </button>
          </div>
        </div>

        {viewMode === 'user' ? <UserOnboardingFlow /> : <DevDiagnostics />}
      </div>
    </div>
  );
}
