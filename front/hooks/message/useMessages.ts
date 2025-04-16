import { useState, useCallback } from 'react';
import { Message, MessageState } from './types';
import { getMessages } from '../../api/message/getMess';
// import { sendMessage } from '../../api/message/sendMessage';

export function useMessages(conversationId?: string) {
  const [state, setState] = useState<MessageState>({
    messages: [],
    loading: false,
    error: null,
  });

  const fetchMessages = useCallback(async () => {
    if (!conversationId) return;

    setState((prev) => ({ ...prev, loading: true }));
    try {
      const messages = await getMessages(conversationId);
      setState((prev) => ({ ...prev, messages, error: null }));
    } catch (error) {
      setState((prev) => ({ ...prev, error: 'Failed to fetch messages' }));
    } finally {
      setState((prev) => ({ ...prev, loading: false }));
    }
  }, [conversationId]);

  return {
    ...state,
    fetchMessages,
  };
}
