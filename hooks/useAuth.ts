'use client';

import { useState, useEffect } from 'react';
import { ory } from '../lib/ory';
import { Session } from '@ory/client';

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  useEffect(() => {
    checkSession();
  }, []);

  async function checkSession() {
    try {
      const { data } = await ory.toSession();
      setSession(data);
      
      // Get wallet address
      if (data.identity?.id) {
        const response = await fetch(`/api/auth/wallet/${data.identity.id}`);
        if (response.ok) {
          const wallet = await response.json();
          setWalletAddress(wallet.walletAddress);
        }
      }
    } catch (error: any) {
      // Handle different types of errors gracefully
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        // No active session (this is normal if not logged in)
        console.log('No active session (this is normal if not logged in)');
      } else if (error?.message?.includes('fetch')) {
        // Network error - Ory not running
        console.log('Ory not available (network error - is Ory running on localhost:4433?)');
      } else {
        // Other errors
        console.error('Session check failed:', error);
      }
      setSession(null);
      setWalletAddress(null);
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    try {
      const { data } = await ory.createBrowserLogoutFlow();
      await ory.updateLogoutFlow({ token: data.logout_token });
      setSession(null);
      setWalletAddress(null);
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  return {
    session,
    user: session?.identity,
    authenticated: !!session,
    loading,
    walletAddress,
    logout,
  };
}
