import React, { useEffect, useState } from 'react';
import { useConversations } from '../hooks/message/ConversationsContext';
import { useMessages } from '../hooks/message/useMessages';
import { MailPlus } from 'lucide-react';
import CreateMessage from './createMessage';
import { useAuth } from '../hooks/user/checkAuth';
import { useSendMessage } from '../hooks/message/useSendMessage';
import { ChatCard, Message as ChatCardMessage } from '@/components/chat-card';

export function ChatLayout({ recipients = [], onClose }: { recipients?: { id: string; username: string; avatar: string | null }[]; onClose: () => void }) {
  const { user } = useAuth();
  const { send } = useSendMessage();
  const { conversations = [], loading: conversationsLoading, fetchConversations } = useConversations();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const { messages = [], loading: messagesLoading, fetchMessages } = useMessages(selectedConversationId || undefined);
  const [isCreateMessageOpen, setIsCreateMessageOpen] = useState(false);

  const safeMessages = Array.isArray(messages) ? messages : Array.isArray(messages?.messages) ? messages.messages : [];

  const [conversationsLoaded, setConversationsLoaded] = useState(false);

  useEffect(() => {
    fetchConversations().then(() => setConversationsLoaded(true));
  }, [fetchConversations]);

  useEffect(() => {
    if (conversationsLoaded) {
      const savedId = localStorage.getItem('selectedConversationId');
      if (savedId) {
        setSelectedConversationId(savedId);
      }
    }
  }, [conversationsLoaded]);

  useEffect(() => {
    if (selectedConversationId) {
      fetchMessages(selectedConversationId);
    }
  }, [selectedConversationId, fetchMessages]);

  useEffect(() => {
    if (selectedConversationId && Array.isArray(conversations)) {
      const conv = conversations.find((c) => c.id === selectedConversationId);
      if (!conv || !conv.participants?.some((p) => p.id === user?.id)) {
        setSelectedConversationId(null);
      }
    }
  }, [selectedConversationId, conversations, user?.id]);

  useEffect(() => {
    if (selectedConversationId) {
      localStorage.setItem('selectedConversationId', selectedConversationId);
    } else {
      localStorage.removeItem('selectedConversationId');
    }
  }, [selectedConversationId]);

  const selectedConversation = Array.isArray(conversations) ? conversations.find((conv) => conv.id === selectedConversationId) : undefined;

  // Utilise les participants de la conversation sélectionnée si elle existe
  const chatCardMessages: ChatCardMessage[] = safeMessages.map((message) => {
    const isCurrentUser = message.sender === user?.id || message.sender === 'currentUser';
    const senderData = selectedConversation?.participants?.find((u) => u.id === message.sender);
    const sender = isCurrentUser
      ? {
          name: user?.username || 'You',
          avatar: user?.avatar || '/default-avatar.png',
          isOnline: true,
          isCurrentUser: true,
        }
      : {
          name: senderData?.username || 'Unknown',
          avatar: senderData?.avatar || '/default-avatar.png',
          isOnline: true,
        };
    return {
      id: message.id,
      content: message.content,
      sender,
      timestamp: new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'delivered',
      reactions: [],
      imageUrl: message.imageUrl || message.image || undefined, // adapte selon ton backend
    };
  });
  const others = selectedConversation?.participants ? selectedConversation.participants.filter((p) => p.id !== user?.id) : recipients.filter((p) => p.id !== user?.id);

  const chatName = others.length > 1 ? 'Groupe' : others.length === 1 ? others[0].username : 'Conversation';

  // console.log('others:', others);
  return (
    <div className='flex h-screen bg-white'>
      <div className='w-1/3 flex flex-col border-r border-gray-200'>
        <div className='flex justify-between items-center p-4 border-b border-gray-200'>
          <h1 className='text-xl font-bold text-gray-900'>Messages</h1>
          <button
            className='text-gray-600 hover:text-blue-500 transition-colors'
            onClick={() => {
              setIsCreateMessageOpen(true);
            }}
          >
            <MailPlus className='w-6 h-6' />
          </button>
        </div>
        {/* Liste des conversations */}
        <div className='flex-1 overflow-y-auto'>
          {conversationsLoading ? (
            <div className='p-4 text-gray-600'>Chargement des conversations...</div>
          ) : Array.isArray(conversations) && conversations.length > 0 ? (
            conversations.map((conversation) => {
              const currentUserId = user?.id;
              // Récupère tous les autres participants sauf l'utilisateur courant
              console.log('conversation:', conversation);
              const others = Array.isArray(conversation.participants) ? conversation.participants.filter((p) => p.id !== currentUserId) : [];
              const isSelected = selectedConversationId === conversation.id;

              return (
                <div key={conversation.id} className={`relative flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 transition-colors ${isSelected ? 'bg-blue-50' : ''}`} onClick={() => setSelectedConversationId(conversation.id)}>
                  {/* Trait bleu vertical à gauche si sélectionné */}
                  {isSelected && <div className='absolute left-0 top-0 h-full w-1 bg-blue-500 rounded-r-lg' />}
                  <div className='flex items-center ml-2'>
                    <img src={others[0]?.avatar || '/default-avatar.png'} alt={others[0]?.username || 'Avatar'} className='w-10 h-10 rounded-full object-cover border' />
                  </div>
                  <div className='flex-1 min-w-0'>
                    {/* Affiche tous les noms séparés par une virgule */}
                    <div className='font-semibold text-gray-900 truncate'>{others.map((u) => u.username).join(', ')}</div>
                    <div className='text-sm text-gray-500 truncate'>{conversation.lastMessage ? conversation.lastMessage.content : <span className='italic text-gray-400'>Aucun message</span>}</div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className='p-8 text-left'>
              <h2 className='font-bold text-xl mb-3 text-gray-900'>Bienvenue dans votre boîte de réception !</h2>
              <p className='text-gray-600 text-sm leading-relaxed mb-6'>Écrivez un mot, et partagez des posts et plus encore dans des conversations privées entre vous et d'autres utilisateurs de SN.</p>
              <button
                onClick={() => {
                  setIsCreateMessageOpen(true);
                }}
                className='flex items-center justify-center gap-2 w-full py-4 px-6 bg-blue-500 text-white rounded-2xl hover:bg-blue-600 transition-colors duration-200 font-medium shadow-md hover:shadow-lg'
              >
                <MailPlus className='w-6 h-6' />
                <span>Écrire un message</span>
              </button>
            </div>
          )}
        </div>
        {isCreateMessageOpen && (
          <CreateMessage
            isOpen={isCreateMessageOpen}
            onClose={() => setIsCreateMessageOpen(false)}
            onSelectConversation={(conversation) => {
              setSelectedConversationId(conversation.id); // Ouvre le chat de la nouvelle conversation
              setIsCreateMessageOpen(false); // Ferme la modal
            }}
          />
        )}{' '}
      </div>

      {/* Colonne des messages */}
      <div className='w-2/3 flex flex-col bg-white h-full'>
        {selectedConversationId ? (
          <div className='flex-1 flex flex-col min-h-0'>
            <ChatCard
              chatName={chatName}
              membersCount={others.length}
              // onlineCount={0}
              initialMessages={chatCardMessages}
              currentUser={{
                name: 'Moi',
                avatar: user?.avatar || '/default-avatar.png',
              }}
              theme='light'
              className='border border-zinc-200 flex-1 min-h-0'
              onSendMessage={async (msg, imageFile) => {
                if (selectedConversationId) {
                  const receiverId = others.length === 1 ? others[0].id : undefined;
                  const result = await send({ content: msg, conversationId: selectedConversationId, receiverId, imageFile });
                  await fetchMessages(selectedConversationId);

                  // Sécurité : si la conversation n'existe plus ou tu n'es plus membre, reset
                  const conv = conversations.find((c) => c.id === selectedConversationId);
                  if (!conv || !conv.participants?.some((p) => p.id === user?.id)) {
                    setSelectedConversationId(null);
                  }
                }
              }}
              onReaction={(messageId, emoji) => console.log('Reaction:', messageId, emoji)}
              onMoreClick={() => console.log('More clicked')}
            />
          </div>
        ) : (
          <div className='flex flex-col items-center justify-center flex-1 px-8 space-y-6 min-h-0'>
            <h2 className='text-3xl font-bold text-gray-900'>Sélectionnez un message</h2>
            <p className='text-base text-gray-500 text-center max-w-md'>Faites un choix dans vos conversations existantes, commencez-en une nouvelle ou ne changez rien.</p>
            <button
              onClick={() => {
                setIsCreateMessageOpen(true);
              }}
              className='flex items-center justify-center gap-2 py-4 px-6 bg-blue-500 text-white rounded-2xl hover:bg-blue-600 transition-colors duration-200 font-medium shadow-md hover:shadow-lg w-64'
            >
              <MailPlus className='w-6 h-6' />
              <span>Nouveau message</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
