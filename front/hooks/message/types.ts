export interface ConversationState {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  loading: boolean;
  error: string | null;
}

export interface MessageState {
  messages: Message[];
  loading: boolean;
  error: string | null;
}

export interface Conversation {
  id: string;
  participants: {
    id: string;
    username: string;
    avatar?: string | null;
  }[];
  lastMessage?: {
    content: string;
    createdAt: string;
  } | null;
}

export interface Message {
  id: string;
  content: string;
  sender: string;
  createdAt: string;
}
