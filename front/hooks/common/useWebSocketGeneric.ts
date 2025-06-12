import { useState, useEffect, useCallback, useRef } from 'react';
import { useWebSocket } from '@/contexts/websocket-context';

export interface WebSocketMessage {
  id: string;
  type: string;
  content: string;
  conversationId: string;
  senderId?: string;
  timestamp?: string | Date;
  [key: string]: any;
}

export interface WebSocketFilterOptions {
  type?: string | string[];
  conversationId?: string;
  senderId?: string;
  customFilter?: (message: WebSocketMessage) => boolean;
}

export interface WebSocketGenericState<T> {
  messages: T[];
  loading: boolean;
  error: string | null;
  isConnected: boolean;
}

export interface WebSocketGenericOptions<T> {
  // Transformer pour convertir le message WebSocket en type personnalisé
  messageTransformer?: (wsMessage: WebSocketMessage) => T;
  // Options de filtrage des messages
  filterOptions?: WebSocketFilterOptions;
  // Callback appelé lors de la réception d'un nouveau message
  onNewMessage?: (message: T) => void;
  // Callback appelé lors du changement de statut de connexion
  onConnectionChange?: (isConnected: boolean) => void;
  // Auto-fetch lors de l'initialisation
  autoFetch?: boolean;
  // URL de l'API pour récupérer l'historique
  fetchUrl?: string;
  // Headers pour les requêtes API
  fetchHeaders?: HeadersInit;
}

/**
 * Hook générique pour gérer les communications WebSocket avec filtrage et transformation
 */
export function useWebSocketGeneric<T = WebSocketMessage>(
  options: WebSocketGenericOptions<T> = {}
) {
  const {
    messageTransformer,
    filterOptions = {},
    onNewMessage,
    onConnectionChange,
    autoFetch = false,
    fetchUrl,
    fetchHeaders = { credentials: 'include' as RequestCredentials }
  } = options;

  const [state, setState] = useState<WebSocketGenericState<T>>({
    messages: [],
    loading: false,
    error: null,
    isConnected: false
  });

  const { isConnected, messages: wsMessages, sendMessage } = useWebSocket();
  const processedMessageIds = useRef<Set<string>>(new Set());

  // Fonction pour filtrer les messages WebSocket
  const filterMessage = useCallback((message: WebSocketMessage): boolean => {
    const { type, conversationId, senderId, customFilter } = filterOptions;

    // Filtre par type
    if (type) {
      const types = Array.isArray(type) ? type : [type];
      if (!types.includes(message.type)) return false;
    }

    // Filtre par conversationId
    if (conversationId && message.conversationId !== conversationId) {
      return false;
    }

    // Filtre par senderId
    if (senderId && message.senderId !== senderId) {
      return false;
    }

    // Filtre personnalisé
    if (customFilter && !customFilter(message)) {
      return false;
    }

    return true;
  }, [filterOptions]);

  // Transformer par défaut (identité)
  const defaultTransformer = useCallback((message: WebSocketMessage): T => {
    return message as unknown as T;
  }, []);

  const transformer = messageTransformer || defaultTransformer;

  // Fonction pour récupérer l'historique des messages
  const fetchMessages = useCallback(async () => {
    if (!fetchUrl) return;

    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await fetch(fetchUrl, {
        method: 'GET',
        headers: fetchHeaders,
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch messages: ${response.status}`);
      }

      const data = await response.json();
      const messages = Array.isArray(data) ? data : [];

      // Transformer les messages si nécessaire
      const transformedMessages = messages.map(transformer);

      setState(prev => ({
        ...prev,
        messages: transformedMessages,
        loading: false,
        error: null
      }));

      // Marquer tous les messages comme traités
      messages.forEach(msg => {
        if (msg.id) processedMessageIds.current.add(msg.id);
      });

    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Error fetching messages'
      }));
    }
  }, [fetchUrl, fetchHeaders, transformer]);

  // Ajouter un message à la liste
  const addMessage = useCallback((message: T) => {
    setState(prev => ({
      ...prev,
      messages: [...prev.messages, message]
    }));
  }, []);

  // Supprimer un message de la liste
  const removeMessage = useCallback((messageId: string) => {
    setState(prev => ({
      ...prev,
      messages: prev.messages.filter((msg: any) => msg.id !== messageId)
    }));
  }, []);

  // Mettre à jour un message
  const updateMessage = useCallback((messageId: string, updater: (message: T) => T) => {
    setState(prev => ({
      ...prev,
      messages: prev.messages.map((msg: any) => 
        msg.id === messageId ? updater(msg) : msg
      )
    }));
  }, []);

  // Effacer tous les messages
  const clearMessages = useCallback(() => {
    setState(prev => ({ ...prev, messages: [] }));
    processedMessageIds.current.clear();
  }, []);

  // Envoyer un message via WebSocket
  const sendWebSocketMessage = useCallback((data: any) => {
    sendMessage(data);
  }, [sendMessage]);

  // Écouter les nouveaux messages WebSocket
  useEffect(() => {
    if (wsMessages.length === 0) return;

    const latestMessage = wsMessages[wsMessages.length - 1];
    
    // Éviter de traiter le même message plusieurs fois
    if (processedMessageIds.current.has(latestMessage.id)) {
      return;
    }

    // Filtrer le message
    if (!filterMessage(latestMessage)) {
      return;
    }

    // Marquer comme traité
    processedMessageIds.current.add(latestMessage.id);

    // Transformer le message
    const transformedMessage = transformer(latestMessage);

    // Ajouter à la liste
    addMessage(transformedMessage);

    // Callback optionnel
    onNewMessage?.(transformedMessage);

  }, [wsMessages, filterMessage, transformer, addMessage, onNewMessage]);

  // Surveiller les changements de connexion
  useEffect(() => {
    setState(prev => ({ ...prev, isConnected }));
    onConnectionChange?.(isConnected);
  }, [isConnected, onConnectionChange]);

  // Auto-fetch si activé
  useEffect(() => {
    if (autoFetch && fetchUrl && isConnected) {
      fetchMessages();
    }
  }, [autoFetch, fetchUrl, isConnected, fetchMessages]);

  return {
    // État
    ...state,
    
    // Actions
    fetchMessages,
    addMessage,
    removeMessage,
    updateMessage,
    clearMessages,
    sendWebSocketMessage,
    
    // Utilitaires
    filterMessage,
    transformer,
  };
}

// Hook spécialisé pour les notifications
export function useWebSocketNotifications() {
  return useWebSocketGeneric({
    filterOptions: {
      type: ['notification', 'LIKE', 'DISLIKE', 'COMMENT', 'ASK_FOLLOW', 'INVITE_GROUP']
    },
    fetchUrl: 'http://localhost:80/api/notification',
    autoFetch: true
  });
}

// Hook spécialisé pour les messages de groupe
export function useWebSocketGroupMessages(groupId: string) {
  return useWebSocketGeneric({
    filterOptions: {
      type: 'group_message',
      conversationId: groupId
    },
    messageTransformer: (wsMessage) => ({
      id: wsMessage.id,
      group_id: wsMessage.conversationId,
      sender_id: wsMessage.senderId || '',
      content: wsMessage.content,
      type: wsMessage.imageFile ? 1 : 0,
      created_at: new Date().toISOString(),
      sender: {
        id: wsMessage.senderId || '',
        username: 'unknown',
        firstname: 'User',
        lastname: '',
      }
    }),
    fetchUrl: `/api/group/message?groupID=${groupId}`,
    autoFetch: true
  });
}

// Hook spécialisé pour les messages privés
export function useWebSocketPrivateMessages(conversationId: string) {
  return useWebSocketGeneric({
    filterOptions: {
      type: 'private_message',
      conversationId
    },
    fetchUrl: `/api/message?conversationId=${conversationId}`,
    autoFetch: true
  });
}