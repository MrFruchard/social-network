import { useState, useCallback } from 'react';
import { getFollow } from '../../api/follow/getListFollow.js';

interface FollowState {
  follows: Follow[];
  loading: boolean;
  error: string | null;
}

interface Follow {
  id: number;
  username: string;
  avatar: string | null;
}

export function useListFollow() {
  const [state, setState] = useState<FollowState>({
    follows: [],
    loading: false,
    error: null,
  });

  const fetchFollows = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true }));
    try {
      const follows = await getFollow();
      setState((prev) => ({ ...prev, follows, error: null }));
    } catch (error) {
      setState((prev) => ({ ...prev, error: 'Failed to fetch follows' }));
    } finally {
      setState((prev) => ({ ...prev, loading: false }));
    }
  }, []);

  return {
    ...state,
    fetchFollows,
  };
}
