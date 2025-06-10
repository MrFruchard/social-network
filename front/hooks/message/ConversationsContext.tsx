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
        const conversations = Array.isArray(prev.conversations) ? prev.conversations : [];
        
        // Merge server conversations with temporary ones
        const mergedConversations = [...mapped];
        
        // Add temporary conversations that don't have a server match
        const tempConvs = conversations.filter((tempConv: any) => {
          if (!String(tempConv.id).startsWith('temp-')) return false;
          
          // Check if this temp conversation matches any server conversation by participants
          return !mapped.some(serverConv => {
            if (!Array.isArray(tempConv.participants) || !Array.isArray(serverConv.participants)) return false;
            if (tempConv.participants.length !== serverConv.participants.length) return false;
            
            const tempIds = tempConv.participants.map((p: any) => p.id).sort();
            const serverIds = serverConv.participants.map((p: any) => p.id).sort();
            return tempIds.every((id: string, idx: number) => id === serverIds[idx]);
          });
        });
        
        return {
          ...prev,
          conversations: [...mergedConversations, ...tempConvs],
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

  // Met à jour l'ID d'une conversation temporaire avec l'ID du serveur
  const updateConversationId = useCallback((tempId: string, realId: string) => {
    setState(prev => ({
      ...prev,
      conversations: prev.conversations.map(conv => 
        conv.id === tempId ? { ...conv, id: realId } : conv
      ),
      currentConversation: prev.currentConversation?.id === tempId 
        ? { ...prev.currentConversation, id: realId }
        : prev.currentConversation
    }));
  }, []);

  // Ajoute une conversation temporaire (ou locale)
  const addConversation = useCallback((newConversation: Conversation) => {
    setState((prev) => {
      const conversations = Array.isArray(prev.conversations) ? prev.conversations : [];
      
      // Vérifions si cette conversation existe déjà (éviter les doublons)
      const conversationExists = conversations.some(conv => 
        conv.id === newConversation.id || 
        (Array.isArray(conv.participants) && 
         Array.isArray(newConversation.participants) &&
         conv.participants.length === newConversation.participants.length &&
         conv.participants.every(p1 => 
           newConversation.participants.some(p2 => p1.id === p2.id)
         )
        )
      );
      
      // Si elle existe déjà, ne pas la rajouter
      if (conversationExists) {
        return {
          ...prev,
          currentConversation: conversations.find(conv => 
            conv.id === newConversation.id || 
            (Array.isArray(conv.participants) && 
             Array.isArray(newConversation.participants) &&
             conv.participants.length === newConversation.participants.length &&
             conv.participants.every(p1 => 
               newConversation.participants.some(p2 => p1.id === p2.id)
             )
            )
          ) || newConversation
        };
      }
      
      // Sinon, l'ajouter à la liste
      return {
        ...prev,
        conversations: [...conversations, newConversation],
        currentConversation: newConversation,
      };
    });
  }, []);

  return {
    ...state,
    fetchConversations,
    addConversation,
    updateConversationId,
  };
}

// Hook à utiliser dans les composants pour accéder au contexte
export function useConversations() {
  return useContext(ConversationsContext);
}
