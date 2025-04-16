export interface Message {
  id: string;
  content: string;
  sender: string;
  receiver: string;
  created_at: string;
  image?: string;
}

export interface Conversation {
  id: string;
  participants: string[];
  lastMessage?: Message;
  created_at: string;
}

export interface MessageState {
  messages: Message[];
  loading: boolean;
  error: string | null;
}

export interface ConversationState {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  loading: boolean;
  error: string | null;
}
