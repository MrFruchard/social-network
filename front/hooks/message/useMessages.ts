import { useState, useCallback } from 'react';
import { Message, MessageState } from './types';
import { getMessages } from '../../api/message/getMess';

export function useMessages(initialConversationId?: string) {
  const [state, setState] = useState<MessageState>({
    messages: [],
    loading: false,
    error: null,
  });
  const [conversationId, setConversationId] = useState<string | undefined>(initialConversationId);

  const fetchMessages = useCallback(
    async (convId?: string) => {
      const idToFetch = convId || conversationId;
      if (!idToFetch) return;

      setState((prev) => ({ ...prev, loading: true }));
      try {
        const messages = await getMessages(idToFetch);
        setState((prev) => ({ ...prev, messages, error: null }));
      } catch (error) {
        setState((prev) => ({ ...prev, error: 'Failed to fetch messages' }));
      } finally {
        setState((prev) => ({ ...prev, loading: false }));
      }
    },
    [conversationId]
  );

  return {
    ...state,
    fetchMessages,
    setConversationId,
    conversationId,
  };
}
