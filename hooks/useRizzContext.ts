import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

// Mock RizzContext interface for now
export interface RizzContext {
  user: {
    id: string;
    name: string;
    tier: string;
    memberSince: Date;
    hasWallet: boolean;
    tokenBalance: number;
    permissions?: string[]  };
  page: {
    path: string;
    type: 'hub' | 'domain' | 'project' | 'network' | 'meeting' | 'call';
    entityId?: string;
  };
  call?: {
    phase: 'pre-call' | 'in-call' | 'post-call' | 'follow-up';
    meetingId: string;
    participants: Array<{ id: string; name: string }>;
    agenda?: string;
    context?: string;
    currentNotes?: string[];
    keyPoints?: string[];
    decisions?: string[];
    actions?: string[];
  };
  recentActivity: {
    lastMeeting?: Date;
    projectsMatched: number;
    bountiesClaimed: number;
    tokensEarned: number;
  };
}

// Mock buildRizzContext function
const buildRizzContext = async (
  userId: string,
  pagePath: string,
  entityId?: string,
  meetingId?: string,
  callPhase?: 'pre-call' | 'in-call' | 'post-call' | 'follow-up'
): Promise<RizzContext> => {
  // Mock implementation - replace with actual API call
  return {
    user: {
      id: userId,
      name: 'User',
      tier: 'gold',
      memberSince: new Date(),
      hasWallet: false,
      tokenBalance: 0
    },
    page: {
      path: pagePath,
      type: 'hub',
      entityId
    },
    call: meetingId && callPhase ? {
      phase: callPhase,
      meetingId,
      participants: [],
      agenda: '',
      context: '',
      currentNotes: [],
      keyPoints: [],
      decisions: [],
      actions: []
    } : undefined,
    recentActivity: {
      lastMeeting: new Date(),
      projectsMatched: 0,
      bountiesClaimed: 0,
      tokensEarned: 0
    }
  };
};

export function useRizzContext(
  pagePath: string,
  entityId?: string,
  meetingId?: string,
  callPhase?: 'pre-call' | 'in-call' | 'post-call' | 'follow-up'
): RizzContext | null {
  const { user } = useAuth();
  const [context, setContext] = useState<RizzContext | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      buildRizzContext(
        user.id,
        pagePath,
        entityId,
        meetingId,
        callPhase
      )
        .then(setContext)
        .catch((err: Error) => {
          console.error('Failed to build Rizz context:', err);
          setError('Failed to load context');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [user, pagePath, entityId, meetingId, callPhase]);

  return context;
}

export function useRizzContextEnhanced(
  pagePath: string,
  entityId?: string,
  meetingId?: string,
  callPhase?: 'pre-call' | 'in-call' | 'post-call' | 'follow-up'
) {
  const context = useRizzContext(pagePath, entityId, meetingId, callPhase);
  
  // Auto-refresh context periodically
  useEffect(() => {
    if (context) {
      const interval = setInterval(() => {
        // Re-fetch context to get latest data
        // This would trigger the useEffect in useRizzContext
      }, 30000); // Refresh every 30 seconds
      
      return () => clearInterval(interval);
    }
  }, [context]);

  return {
    context,
    loading: !context,
    error: null,
    refresh: () => {
      // Trigger context refresh
    }
  };
}
