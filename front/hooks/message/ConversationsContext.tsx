import React, { createContext, useContext, useState, useCallback } from 'react';
import { Conversation, ConversationState } from './types';

const ConversationsContext = createContext<any>(null);

export function ConversationsProvider({ children }: { children: React.ReactNode }) {
  const value = useConversationsInternal();
  return <ConversationsContext.Provider value={value}>{children}</ConversationsContext.Provider>;
}

// Hook interne pour la logique, utilisé par le provider et exporté pour usage direct si besoin
function useConversationsInternal() {
  const [state, setState] = useState<ConversationState>({
    conversations: [],
    currentConversation: null,
    loading: false,
    error: null,
  });

  const fetchConversations = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true }));
    try {
      const res = await fetch('/api/conversation');
      const data = await res.json();

      const safeData = Array.isArray(data) ? data : [];
      const mapped: Conversation[] = safeData.map((conv: any) => ({
        id: conv.conv,
        participants: Array.isArray(conv.user)
          ? conv.user.map((u: any) => ({
              id: u.id,
              username: u.username,
              avatar: u.image || '/default-avatar.png',
            }))
          : [],
        lastMessage: conv.last_Message
          ? {
              id: conv.last_Message.id,
              content: conv.last_Message.content,
              sender: conv.last_Message.user_id?.id,
              created_at: conv.last_Message.date,
            }
          : null,
      }));

      setState((prev) => {
        // On garde les conversations temporaires (id qui commence par temp-)
        const tempConvs = Array.isArray(prev.conversations) ? prev.conversations.filter((c: any) => String(c.id).startsWith('temp-')) : [];
        return {
          ...prev,
          conversations: [...mapped, ...tempConvs],
          error: null,
        };
      });
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: 'Failed to fetch conversations',
      }));
    } finally {
      setState((prev) => ({ ...prev, loading: false }));
    }
  }, []);

  // Ajoute une conversation temporaire (ou locale)
  const addConversation = useCallback((newConversation: Conversation) => {
    setState((prev) => {
      const conversations = Array.isArray(prev.conversations) ? prev.conversations : [];
      const updated = {
        ...prev,
        conversations: [...conversations, newConversation],
        currentConversation: newConversation,
      };
      return updated;
    });
  }, []);

  return {
    ...state,
    fetchConversations,
    addConversation,
  };
}

// Hook à utiliser dans les composants pour accéder au contexte
export function useConversations() {
  return useContext(ConversationsContext);
}
