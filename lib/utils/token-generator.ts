// Token Generation Utilities - Sovereign Identity Layer
// Generates secure, random tokens for meeting invites and other purposes

/**
 * Generates a random alphanumeric token of specified length
 * Uses crypto.getRandomValues for cryptographically secure randomness
 */
export function generateRandomToken(length: number = 8): string {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const array = new Uint8Array(length)
  
  // Use crypto.getRandomValues for cryptographically secure randomness
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(array)
  } else {
    // Fallback for environments without crypto.getRandomValues
    for (let i = 0; i < length; i++) {
      array[i] = Math.floor(Math.random() * charset.length)
    }
  }
  
  return Array.from(array)
    .map(num => charset[num % charset.length])
    .join('')
}

/**
 * Generates a meeting invite token with optional prefix
 * Format: [prefix-]random8chars
 */
export function generateInviteToken(prefix?: string): string {
  const token = generateRandomToken(8)
  return prefix ? `${prefix}-${token}` : token
}

/**
 * Generates a participant ID token
 * Format: participant-random8chars
 */
export function generateParticipantToken(): string {
  return `participant-${generateRandomToken(8)}`
}

/**
 * Generates a wallet secret token
 * Format: wallet-random12chars
 */
export function generateWalletSecretToken(): string {
  return `wallet-${generateRandomToken(12)}`
}

/**
 * Validates that a token matches expected format
 * Returns true if token is valid, false otherwise
 */
export function validateToken(token: string, expectedPrefix?: string): boolean {
  if (!token || typeof token !== 'string') {
    return false
  }
  
  // Basic length check
  if (token.length < 6 || token.length > 32) {
    return false
  }
  
  // Check for expected prefix if provided
  if (expectedPrefix && !token.startsWith(`${expectedPrefix}-`)) {
    return false
  }
  
  // Check that token only contains valid characters (alphanumeric and hyphens)
  const validChars = /^[A-Za-z0-9-]+$/
  if (!validChars.test(token)) {
    return false
  }
  
  return true
}

/**
 * Generates a unique token ensuring it doesn't already exist
 * Useful for database operations where uniqueness is required
 */
export async function generateUniqueToken(
  length: number = 8,
  checkExists: (token: string) => Promise<boolean>
): Promise<string> {
  let attempts = 0
  const maxAttempts = 100
  
  while (attempts < maxAttempts) {
    const token = generateRandomToken(length)
    const exists = await checkExists(token)
    
    if (!exists) {
      return token
    }
    
    attempts++
  }
  
  throw new Error('Unable to generate unique token after maximum attempts')
}

/**
 * Token type constants for consistent usage
 */
export const TOKEN_TYPES = {
  MEETING_INVITE: 'meeting',
  PARTICIPANT: 'participant',
  WALLET_SECRET: 'wallet',
  USER_CONTEXT: 'context'
} as const

/**
 * Generates a token with type-specific formatting
 */
export function generateTypedToken(type: keyof typeof TOKEN_TYPES): string {
  switch (type) {
    case 'MEETING_INVITE':
      return generateInviteToken(TOKEN_TYPES.MEETING_INVITE)
    case 'PARTICIPANT':
      return generateParticipantToken()
    case 'WALLET_SECRET':
      return generateWalletSecretToken()
    case 'USER_CONTEXT':
      return generateRandomToken(10)
    default:
      return generateRandomToken(8)
  }
}