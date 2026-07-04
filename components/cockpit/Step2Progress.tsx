"use client";

import { useState, useEffect } from 'react';
import { Loader2, CheckCircle, XCircle, Settings, Terminal, Zap, Clock, Cpu, Database, Code, ChevronRight } from 'lucide-react';

interface Step2ProgressProps {
  isRunning: boolean;
  onProgressComplete: () => void;
}

type SetupPhase = 'checking' | 'starting_node' | 'deploying_contracts' | 'minting_tokens' | 'complete' | 'error';

interface PhaseConfig {
  title: string;
  description: string;
  icon: React.ReactNode;
  duration?: number;
}

export default function Step2Progress({ isRunning, onProgressComplete }: Step2ProgressProps) {
  const [currentPhase, setCurrentPhase] = useState<SetupPhase>('checking');
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const phases: Record<SetupPhase, PhaseConfig> = {
    checking: {
      title: "System Check",
      description: "Verifying blockchain connectivity and configuration",
      icon: <Settings className="h-6 w-6" />,
      duration: 2000
    },
    starting_node: {
      title: "Starting Blockchain",
      description: "Initializing local blockchain node (first time setup)",
      icon: <Cpu className="h-6 w-6" />,
      duration: 8000
    },
    deploying_contracts: {
      title: "Deploying Contracts",
      description: "Setting up smart contracts on the blockchain",
      icon: <Code className="h-6 w-6" />,
      duration: 3000
    },
    minting_tokens: {
      title: "Minting Tokens",
      description: "Creating your 100 RSF tokens",
      icon: <Database className="h-6 w-6" />,
      duration: 2000
    },
    complete: {
      title: "Setup Complete",
      description: "Your wallet is ready with tokens",
      icon: <CheckCircle className="h-6 w-6" />
    },
    error: {
      title: "Setup Failed",
      description: "Please try again or contact support",
      icon: <XCircle className="h-6 w-6" />
    }
  };

  useEffect(() => {
    if (!isRunning) {
      setCurrentPhase('checking');
      setProgress(0);
      setIsComplete(false);
      setError(null);
      return;
    }

    let phaseIndex = 0;
    const phaseOrder: SetupPhase[] = ['checking', 'starting_node', 'deploying_contracts', 'minting_tokens'];

    const runPhase = async (phase: SetupPhase) => {
      setCurrentPhase(phase);
      const config = phases[phase];
      
      if (config.duration) {
        const startTime = Date.now();
        const endTime = startTime + config.duration;
        
        const updateProgress = () => {
          const now = Date.now();
          const elapsed = now - startTime;
          const total = config.duration!;
          const currentProgress = Math.min((elapsed / total) * 100, 100);
          
          setProgress(currentProgress);
          
          if (now < endTime) {
            requestAnimationFrame(updateProgress);
          }
        };
        
        updateProgress();
        await new Promise(resolve => setTimeout(resolve, config.duration));
      }
    };

    const executeSetup = async () => {
      try {
        // Simulate the setup process
        for (const phase of phaseOrder) {
          await runPhase(phase);
          phaseIndex++;
        }
        
        // Final completion
        setCurrentPhase('complete');
        setProgress(100);
        setIsComplete(true);
        onProgressComplete();
      } catch (err) {
        setCurrentPhase('error');
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
      }
    };

    executeSetup();
  }, [isRunning, onProgressComplete]);

  const currentConfig = phases[currentPhase];

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="w-12 h-12 bg-blue-500/20 border border-blue-500/30 rounded-full flex items-center justify-center">
            {currentConfig.icon}
          </div>
          <div className="text-left">
            <h3 className="text-lg font-semibold text-white">{currentConfig.title}</h3>
            <p className="text-sm text-slate-400">{currentConfig.description}</p>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-600 rounded-full h-3 mb-4">
          <div 
            className={`h-3 rounded-full transition-all duration-300 ${
              currentPhase === 'error' ? 'bg-red-500' :
              currentPhase === 'complete' ? 'bg-green-500' :
              'bg-blue-500'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
        
        <p className="text-sm text-slate-400">
          {currentPhase === 'checking' && "Verifying system status..."}
          {currentPhase === 'starting_node' && "Starting blockchain node... (this may take up to 30 seconds)"}
          {currentPhase === 'deploying_contracts' && "Deploying smart contracts..."}
          {currentPhase === 'minting_tokens' && "Minting your tokens..."}
          {currentPhase === 'complete' && "Setup completed successfully!"}
          {currentPhase === 'error' && "Setup encountered an issue"}
        </p>
      </div>

      {/* Phase Details */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Object.entries(phases).slice(0, 4).map(([phase, config]) => {
          const phaseIndex = ['checking', 'starting_node', 'deploying_contracts', 'minting_tokens'].indexOf(phase as SetupPhase);
          const isCurrent = currentPhase === phase;
          const isCompleted = progress === 100 && phaseIndex < 3;
          const isUpcoming = phaseIndex > ['checking', 'starting_node', 'deploying_contracts', 'minting_tokens'].indexOf(currentPhase as SetupPhase);
          
          return (
            <div
              key={phase}
              className={`p-4 rounded-lg border transition-all duration-300 ${
                isCurrent 
                  ? 'bg-blue-500/20 border-blue-500/40 ring-2 ring-blue-500/30' 
                  : isCompleted
                  ? 'bg-green-500/20 border-green-500/40'
                  : isUpcoming
                  ? 'bg-white/[0.02] border-white/10 opacity-50'
                  : 'bg-white/[0.02] border-white/10'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  isCurrent ? 'bg-blue-500 text-white' :
                  isCompleted ? 'bg-green-500 text-white' :
                  'bg-gray-500 text-white'
                }`}>
                  {config.icon}
                </div>
                <div>
                  <h4 className="font-medium text-white">{config.title}</h4>
                  <p className="text-xs text-slate-400">{config.description}</p>
                </div>
              </div>
              
              {isCurrent && (
                <div className="flex items-center gap-2 text-blue-400 text-sm">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  In Progress
                </div>
              )}
              
              {isCompleted && (
                <div className="flex items-center gap-2 text-green-400 text-sm">
                  <CheckCircle className="h-4 w-4" />
                  Complete
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Status Messages */}
      <div className="space-y-4">
        {currentPhase === 'checking' && (
          <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <div className="flex items-start gap-3">
              <Terminal className="h-5 w-5 text-blue-400 mt-0.5" />
              <div>
                <p className="text-sm text-blue-400 font-medium">System Diagnostics</p>
                <p className="text-xs text-slate-400 mt-1">
                  Checking blockchain connectivity, contract deployment status, and wallet configuration.
                </p>
              </div>
            </div>
          </div>
        )}

        {currentPhase === 'starting_node' && (
          <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-yellow-400 mt-0.5" />
              <div>
                <p className="text-sm text-yellow-400 font-medium">Blockchain Initialization</p>
                <p className="text-xs text-slate-400 mt-1">
                  Starting the local blockchain node. This is only required the first time and may take up to 30 seconds.
                </p>
                <p className="text-xs text-slate-400 mt-2">
                  <strong>Tips:</strong> Keep this page open and avoid refreshing during setup.
                </p>
              </div>
            </div>
          </div>
        )}

        {currentPhase === 'deploying_contracts' && (
          <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
            <div className="flex items-start gap-3">
              <Code className="h-5 w-5 text-purple-400 mt-0.5" />
              <div>
                <p className="text-sm text-purple-400 font-medium">Smart Contract Deployment</p>
                <p className="text-xs text-slate-400 mt-1">
                  Deploying the Resourceful Token contract to the blockchain. This creates the foundation for your token economy.
                </p>
              </div>
            </div>
          </div>
        )}

        {currentPhase === 'minting_tokens' && (
          <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
            <div className="flex items-start gap-3">
              <Database className="h-5 w-5 text-green-400 mt-0.5" />
              <div>
                <p className="text-sm text-green-400 font-medium">Token Minting</p>
                <p className="text-xs text-slate-400 mt-1">
                  Creating your 100 RSF tokens and assigning them to your wallet address. This transaction is being processed on the blockchain.
                </p>
              </div>
            </div>
          </div>
        )}

        {currentPhase === 'complete' && (
          <div className="p-6 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/40 rounded-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Setup Complete! 🎉</h3>
                  <p className="text-sm text-green-200">
                    Your wallet is now ready with 100 RSF tokens. You can proceed to the next steps.
                  </p>
                </div>
              </div>
              <button
                onClick={onProgressComplete}
                className="px-6 py-2 bg-white text-slate-900 rounded-lg font-semibold hover:bg-slate-100 transition-colors"
              >
                Continue →
              </button>
            </div>
          </div>
        )}

        {currentPhase === 'error' && error && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <div className="flex items-start gap-3">
              <XCircle className="h-5 w-5 text-red-400 mt-0.5" />
              <div>
                <p className="text-sm text-red-400 font-medium">Setup Error</p>
                <p className="text-xs text-slate-400 mt-1">
                  {error}
                </p>
                <p className="text-xs text-slate-400 mt-2">
                  Please try running the setup again, or check the console for more details.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Notes */}
      <div className="p-4 bg-white/[0.02] border border-white/10 rounded-lg">
        <p className="text-xs text-slate-400">
          <strong>Note:</strong> This setup process only needs to run once. Future token claims will be much faster since the blockchain infrastructure will already be running.
        </p>
      </div>
    </div>
  );
}