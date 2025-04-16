import { useState, useCallback } from 'react';
import { Conversation, ConversationState } from './types';
import { getConversations } from '../../api/message/getConversation';

export function useConversations() {
  const [state, setState] = useState<ConversationState>({
    conversations: [],
    currentConversation: null,
    loading: false,
    error: null,
  });

  const fetchConversations = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true }));
    try {
      const conversations = await getConversations();
      setState((prev) => ({ ...prev, conversations, error: null }));
    } catch (error) {
      setState((prev) => ({ ...prev, error: 'Failed to fetch conversations' }));
    } finally {
      setState((prev) => ({ ...prev, loading: false }));
    }
  }, []);

  return {
    ...state,
    fetchConversations,
  };
}
