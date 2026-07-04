import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

// Reference repositories configuration
const REFERENCE_REPOS_DIR = path.join(process.env.HOME || '', 'reference-repos');

export interface ReferenceRepo {
  name: string;
  path: string;
  description: string;
  keyFiles: string[];
}

// Colony repos we've cloned
export const COLONY_REPOS: ReferenceRepo[] = [
  {
    name: 'colonyNetwork',
    path: path.join(REFERENCE_REPOS_DIR, 'colonyNetwork'),
    description: 'Colony Network smart contracts (Solidity)',
    keyFiles: [
      'contracts/colony/Colony.sol',
      'contracts/colony/ColonyAuthority.sol',
      'contracts/colony/IColony.sol',
      'contracts/colonyNetwork/ColonyNetwork.sol',
      'README.md',
    ],
  },
  {
    name: 'colonySDK',
    path: path.join(REFERENCE_REPOS_DIR, 'colonySDK'),
    description: 'Colony SDK for easy integration',
    keyFiles: [
      '@/Colony.ts',
      '@/ColonyNetwork.ts',
      '@/utils.ts',
      'README.md',
    ],
  },
  {
    name: 'colonyJS',
    path: path.join(REFERENCE_REPOS_DIR, 'colonyJS'),
    description: 'Colony TypeScript libraries',
    keyFiles: [
      'packages/colonyjs/src/ColonyClient.ts',
      'packages/colonyjs/src/ColonyNetworkClient.ts',
      'README.md',
    ],
  },
];

// Uniswap repos we've cloned
export const UNISWAP_REPOS: ReferenceRepo[] = [
  {
    name: 'uniswap-v3-core',
    path: path.join(REFERENCE_REPOS_DIR, 'uniswap-v3-core'),
    description: 'Uniswap V3 core smart contracts (Solidity) - AMM core logic',
    keyFiles: [
      'contracts/UniswapV3Factory.sol',
      'contracts/UniswapV3Pool.sol',
      'contracts/interfaces/IUniswapV3Factory.sol',
      'contracts/interfaces/IUniswapV3Pool.sol',
      'README.md',
    ],
  },
  {
    name: 'uniswap-v3-periphery',
    path: path.join(REFERENCE_REPOS_DIR, 'uniswap-v3-periphery'),
    description: 'Uniswap V3 periphery contracts (Solidity) - Swaps, pools, NFT positions',
    keyFiles: [
      'contracts/NonfungiblePositionManager.sol',
      'contracts/SwapRouter.sol',
      'contracts/base/PeripheryPayments.sol',
      'README.md',
    ],
  },
  {
    name: 'uniswap-interface',
    path: path.join(REFERENCE_REPOS_DIR, 'uniswap-interface'),
    description: 'Uniswap web interface (TypeScript/React) - Trading UI',
    keyFiles: [
      '@/pages/Swap.tsx',
      '@/pages/Pool.tsx',
      '@/components/swap/SwapForm.tsx',
      '@/state/swap/atom.ts',
      'README.md',
    ],
  },
  {
    name: 'sdk',
    path: path.join(REFERENCE_REPOS_DIR, 'sdk'),
    description: 'Uniswap JavaScript SDK - API for integrating with Uniswap',
    keyFiles: [
      '@/entities/pool.ts',
      '@/entities/route.ts',
      '@/entities/trade.ts',
      '@/utils/computePoolAddress.ts',
      'README.md',
    ],
  },
];

// Keywords that trigger Colony context
export const COLONY_KEYWORDS = [
  'colony',
  'dao',
  'governance',
  'reputation',
  'domain',
  'task',
  'reward',
  'token',
  'voting',
  'proposal',
  'treasury',
  'smart contract',
  'solidity',
  'on-chain',
];

// Keywords that trigger Uniswap context
export const UNISWAP_KEYWORDS = [
  'uniswap',
  'dex',
  'decentralized exchange',
  'swap',
  'token swap',
  'liquidity',
  'liquidity pool',
  'amm',
  'automated market maker',
  'v3',
  'pool',
  'tick',
  'token trading',
  'liquidity provider',
  'lp',
  'yield',
  'impermanent loss',
];

/**
 * Check if a message contains Colony-related keywords
 */
export function shouldIncludeColonyContext(message: string): boolean {
  const lowerMessage = message.toLowerCase();
  return COLONY_KEYWORDS.some(keyword => lowerMessage.includes(keyword));
}

/**
 * Check if a message contains Uniswap-related keywords
 */
export function shouldIncludeUniswapContext(message: string): boolean {
  const lowerMessage = message.toLowerCase();
  return UNISWAP_KEYWORDS.some(keyword => lowerMessage.includes(keyword));
}

/**
 * Get directory structure for a reference repo
 */
export function getRepoStructure(repoPath: string, maxDepth: number = 3): string {
  try {
    if (!fs.existsSync(repoPath)) {
      return `Repo not found at: ${repoPath}`;
    }

    // Get top-level directories
    const entries = fs.readdirSync(repoPath, { withFileTypes: true });
    const dirs = entries.filter(e => e.isDirectory() && !e.name.startsWith('.')).map(e => e.name);
    const files = entries.filter(e => e.isFile() && !e.name.startsWith('.')).map(e => e.name);

    let structure = `Directories: ${dirs.slice(0, 15).join(', ')}${dirs.length > 15 ? '...' : ''}\n`;
    structure += `Files: ${files.slice(0, 10).join(', ')}${files.length > 10 ? '...' : ''}\n`;
    
    return structure;
  } catch (error) {
    return `Error reading repo structure: ${error}`;
  }
}

/**
 * Get content of a key file (with line limit)
 */
export function getFileContent(filePath: string, maxLines: number = 100): string {
  try {
    if (!fs.existsSync(filePath)) {
      return `File not found: ${filePath}`;
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n').slice(0, maxLines);
    
    if (content.split('\n').length > maxLines) {
      lines.push(`\n... (truncated, ${content.split('\n').length - maxLines} more lines)`);
    }

    return lines.join('\n');
  } catch (error) {
    return `Error reading file: ${error}`;
  }
}

/**
 * Get context for a specific reference repo
 */
export function getExternalRepoContext(repoName: string): string {
  const repo = COLONY_REPOS.find(r => r.name === repoName);
  if (!repo) {
    return `Unknown repo: ${repoName}`;
  }

  if (!fs.existsSync(repo.path)) {
    return `Repo not cloned: ${repoName}. Run: git clone https://github.com/JoinColony/${repoName}`;
  }

  let context = `[${repo.name.toUpperCase()}]\n`;
  context += `Description: ${repo.description}\n\n`;
  
  // Get repo structure
  context += `Structure:\n${getRepoStructure(repo.path)}\n\n`;

  // Get README summary if exists
  const readmePath = path.join(repo.path, 'README.md');
  if (fs.existsSync(readmePath)) {
    const readme = getFileContent(readmePath, 50);
    context += `README (first 50 lines):\n\`\`\`\n${readme}\n\`\`\`\n\n`;
  }

  return context;
}

/**
 * Get combined context for all Colony repos
 */
export function getAllColonyContext(): string {
  let context = '[COLONY REFERENCE REPOS]\n\n';
  context += 'These are Colony.io reference repositories for DAO/governance patterns.\n\n';

  for (const repo of COLONY_REPOS) {
    if (fs.existsSync(repo.path)) {
      context += `--- ${repo.name} ---\n`;
      context += getRepoStructure(repo.path);
      context += '\n\n';
    }
  }

  return context;
}

/**
 * Search for a term across Colony repos
 */
export function searchColonyRepos(searchTerm: string, maxResults: number = 10): string {
  const results: string[] = [];
  
  for (const repo of COLONY_REPOS) {
    if (!fs.existsSync(repo.path)) continue;

    try {
      // Use grep to find files containing the search term
      const grepCmd = `grep -rl "${searchTerm}" ${repo.path} --include="*.ts" --include="*.sol" --include="*.js" 2>/dev/null | head -${maxResults}`;
      const output = execSync(grepCmd, { encoding: 'utf-8', timeout: 5000 }).trim();
      
      if (output) {
        const files = output.split('\n').filter(Boolean);
        results.push(`${repo.name}: ${files.length} matches`);
        
        for (const file of files.slice(0, 3)) {
          const relativePath = file.replace(repo.path, '');
          results.push(`  - ${relativePath}`);
        }
      }
    } catch {
      // grep returns non-zero if no matches
    }
  }

  if (results.length === 0) {
    return `No matches found for "${searchTerm}" in Colony repos`;
  }

  return `[COLONY SEARCH RESULTS]\n\n${results.join('\n')}`;
}

/**
 * Get concise Colony context for Rizz (optimized for token limit)
 */
export function getColonyContextForRizz(): string {
  // Check if Colony repos exist
  const reposExist = COLONY_REPOS.some(repo => fs.existsSync(repo.path));
  
  if (!reposExist) {
    return `[COLONY: Reference repos not cloned. Clone to ~/reference-repos/ for Colony context.]`;
  }

  let context = '[COLONY CONTEXT]\n';
  context += 'Colony.io is an open-source DAO platform with these key repos:\n\n';

  for (const repo of COLONY_REPOS) {
    if (!fs.existsSync(repo.path)) continue;

    context += `**${repo.name}**: ${repo.description}\n`;
    
    // Get key directories
    const entries = fs.readdirSync(repo.path, { withFileTypes: true });
    const keyDirs = entries
      .filter(e => e.isDirectory() && !e.name.startsWith('.'))
      .slice(0, 5)
      .map(e => e.name);
    
    context += `  Key dirs: ${keyDirs.join(', ')}\n`;
  }

  context += '\nUse searchColonyRepos() to find specific code patterns.\n';
  
  return context;
}

/**
 * Get combined context for all Uniswap repos
 */
export function getAllUniswapContext(): string {
  let context = '[UNISWAP REFERENCE REPOS]\n\n';
  context += 'These are Uniswap reference repositories for DeFi/DEX patterns.\n\n';

  for (const repo of UNISWAP_REPOS) {
    if (fs.existsSync(repo.path)) {
      context += `--- ${repo.name} ---\n`;
      context += getRepoStructure(repo.path);
      context += '\n\n';
    }
  }

  return context;
}

/**
 * Search for a term across Uniswap repos
 */
export function searchUniswapRepos(searchTerm: string, maxResults: number = 10): string {
  const results: string[] = [];
  
  for (const repo of UNISWAP_REPOS) {
    if (!fs.existsSync(repo.path)) continue;

    try {
      // Use grep to find files containing the search term
      const grepCmd = `grep -rl "${searchTerm}" ${repo.path} --include="*.ts" --include="*.tsx" --include="*.sol" --include="*.js" 2>/dev/null | head -${maxResults}`;
      const output = execSync(grepCmd, { encoding: 'utf-8', timeout: 5000 }).trim();
      
      if (output) {
        const files = output.split('\n').filter(Boolean);
        results.push(`${repo.name}: ${files.length} matches`);
        
        for (const file of files.slice(0, 3)) {
          const relativePath = file.replace(repo.path, '');
          results.push(`  - ${relativePath}`);
        }
      }
    } catch {
      // grep returns non-zero if no matches
    }
  }

  if (results.length === 0) {
    return `No matches found for "${searchTerm}" in Uniswap repos`;
  }

  return `[UNISWAP SEARCH RESULTS]\n\n${results.join('\n')}`;
}

/**
 * Get concise Uniswap context for Rizz (optimized for token limit)
 */
export function getUniswapContextForRizz(): string {
  // Check if Uniswap repos exist
  const reposExist = UNISWAP_REPOS.some(repo => fs.existsSync(repo.path));
  
  if (!reposExist) {
    return `[UNISWAP: Reference repos not cloned. Clone to ~/reference-repos/ for Uniswap context.
    
Key repos to clone:
- uniswap-v3-core: https://github.com/Uniswap/uniswap-v3-core
- uniswap-v3-periphery: https://github.com/Uniswap/uniswap-v3-periphery
- uniswap-interface: https://github.com/Uniswap/uniswap-interface
- sdk: https://github.com/Uniswap/sdk]`;
  }

  let context = '[UNISWAP CONTEXT]\n';
  context += 'Uniswap is a leading DEX (decentralized exchange) with these key repos:\n\n';

  for (const repo of UNISWAP_REPOS) {
    if (!fs.existsSync(repo.path)) continue;

    context += `**${repo.name}**: ${repo.description}\n`;
    
    // Get key directories
    const entries = fs.readdirSync(repo.path, { withFileTypes: true });
    const keyDirs = entries
      .filter(e => e.isDirectory() && !e.name.startsWith('.'))
      .slice(0, 5)
      .map(e => e.name);
    
    context += `  Key dirs: ${keyDirs.join(', ')}\n`;
  }

  context += '\nKey concepts: AMM (Automated Market Maker), liquidity pools, ticks, concentrated liquidity, NFT positions.\n';
  context += 'Use searchUniswapRepos() to find specific code patterns.\n';
  
  return context;
}
