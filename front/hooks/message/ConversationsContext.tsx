import React, { createContext, useContext } from 'react';
import { useConversations as useConversationsHook } from './useConversations';

const ConversationsContext = createContext<any>(null);

export function ConversationsProvider({ children }: { children: React.ReactNode }) {
  const value = useConversationsHook();
  return <ConversationsContext.Provider value={value}>{children}</ConversationsContext.Provider>;
}

export function useConversations() {
  return useContext(ConversationsContext);
}
