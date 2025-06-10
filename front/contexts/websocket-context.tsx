'use client';

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useAuth } from '../hooks/user/checkAuth';

export type MessageType = {
  type: string;
  id: string;
  content: string;
  conversationId: string;
  senderId?: string;
  imageFile?: string;
  timestamp?: string | Date;
};

type WebSocketContextType = {
  isConnected: boolean;
  sendMessage: (data: any) => void;
  messages: MessageType[];
};

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const maxReconnectAttempts = 5;
  const [reconnectAttempts, setReconnectAttempts] = useState(0);

  const connectWebSocket = () => {
    if (wsRef.current && (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)) {
      return;
    }

    const ws = new WebSocket('ws://localhost:80/api/ws');
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('WebSocket connecté');
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const rawData = event.data;
        const receivedMessage = JSON.parse(rawData);

        const formattedData: MessageType = {
          type: receivedMessage.type,
          id: receivedMessage.id || `ws-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
          content: receivedMessage.content,
          conversationId: receivedMessage.convId,
          senderId: receivedMessage.sender?.id || receivedMessage.senderId,
          timestamp: receivedMessage.timestamp || new Date().toISOString(),
        };

        if (!formattedData.id || !formattedData.senderId || !formattedData.conversationId) {
          return;
        }

        if (formattedData.type === 'private_message' || formattedData.type === 'group_message') {
          setMessages((prevMessages) => [...prevMessages, formattedData]);
        }
      } catch (error) {
        console.error('Erreur de parsing/formatting des données WebSocket dans le contexte:', error, 'Raw data:', event.data);
      }
    };

    ws.onclose = () => {
      console.log('WebSocket déconnecté');
      setIsConnected(false);
      setReconnectAttempts(prev => prev + 1);
      
      // Auto-reconnect logic
      if (reconnectAttempts < maxReconnectAttempts) {
        const timeout = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000); // Exponential backoff, max 30s
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log(`Tentative de reconnexion ${reconnectAttempts + 1}/${maxReconnectAttempts}`);
          connectWebSocket();
        }, timeout);
      }
    };

    ws.onerror = (error) => {
      console.error('Erreur WebSocket:', error);
      setIsConnected(false);
    };
    
    // Reset reconnect attempts on successful connection
    setReconnectAttempts(0);
  };

  const disconnectWebSocket = () => {
    // Clear any pending reconnection
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
      setIsConnected(false);
    }
  };

  const sendMessage = (data: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    } else {
      console.error('WebSocket non connecté');
    }
  };

  // Nettoyer à la fermeture du composant
  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      disconnectWebSocket();
    };
  }, []);

  return (
    <WebSocketContext.Provider
      value={{
        isConnected,
        sendMessage,
        messages,
      }}
    >
      <WebSocketControls connect={connectWebSocket} disconnect={disconnectWebSocket} />
      {children}
    </WebSocketContext.Provider>
  );
}

// Composant caché qui s'abonne aux événements de connexion/déconnexion
function WebSocketControls({ connect, disconnect }: { connect: () => void; disconnect: () => void }) {
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      connect();
    } else {
      disconnect();
    }

    // Écouter les événements de changement d'état de connexion
    window.addEventListener('login', connect);
    window.addEventListener('logout', disconnect);

    return () => {
      window.removeEventListener('login', connect);
      window.removeEventListener('logout', disconnect);
    };
  }, [isAuthenticated, connect, disconnect]);

  return null;
}

// Hook personnalisé pour utiliser le contexte WebSocket
export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error("useWebSocket doit être utilisé à l'intérieur d'un WebSocketProvider");
  }
  return context;
}
