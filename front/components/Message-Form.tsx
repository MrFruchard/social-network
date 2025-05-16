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
  const [localMessages, setLocalMessages] = useState<ChatCardMessage[]>([]);
  const [userCache, setUserCache] = useState<{ [id: string]: { firstName: string; lastName: string } }>({});

  const sortedConversations = Array.isArray(conversations)
    ? [...conversations].sort((a, b) => {
        const aDate = a.lastMessage?.created_at ? new Date(a.lastMessage.created_at).getTime() : 0;
        const bDate = b.lastMessage?.created_at ? new Date(b.lastMessage.created_at).getTime() : 0;
        return bDate - aDate;
      })
    : [];
  const selectedConversation = Array.isArray(conversations) ? conversations.find((conv) => conv.id === selectedConversationId) : undefined;

  const others = selectedConversation?.participants ? selectedConversation.participants.filter((p) => p.id !== user?.id) : recipients.filter((p) => p.id !== user?.id);
  const chatName = others.length > 1 ? 'Groupe' : others.length === 1 ? others[0].username : 'Conversation';

  useEffect(() => {
    fetchConversations().then(() => setConversationsLoaded(true));
  }, [fetchConversations]);

  useEffect(() => {
    if (selectedConversationId) {
      fetchMessages(selectedConversationId);
    }
  }, [selectedConversationId, fetchMessages]);

  useEffect(() => {
    setLocalMessages([]);
  }, [selectedConversationId, messages]);

  useEffect(() => {
    if (conversationsLoaded && Array.isArray(sortedConversations) && sortedConversations.length > 0 && !selectedConversationId) {
      setSelectedConversationId(sortedConversations[0].id);
    }
  }, [conversationsLoaded, sortedConversations, selectedConversationId]);

  useEffect(() => {
    const idsToFetch = [];
    for (const conv of sortedConversations) {
      const currentUserId = user?.id;
      const others = Array.isArray(conv.participants) ? conv.participants.filter((p) => p.id !== currentUserId) : [];
      for (const u of others) {
        if (u.id && !userCache[u.id]) {
          idsToFetch.push(u.id);
        }
      }
    }
    // Supprime les doublons
    const uniqueIds = [...new Set(idsToFetch)];
    // Fetch pour chaque id manquant
    uniqueIds.forEach((id) => {
      fetchUserInfo(id);
    });
  }, [sortedConversations, userCache, user]);

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
      timestamp: new Date(new Date(message.createdAt).getTime() + 2 * 60 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'delivered',
      reactions: [],
      imageUrl: message.imageUrl || message.image || undefined, // adapte selon ton backend
    };
  });

  const fetchUserInfo = async (id: string) => {
    if (!userCache[id]) {
      const res = await fetch(`/api/user/${id}`);
      if (res.ok) {
        const data = await res.json();
        setUserCache((prev) => ({ ...prev, [id]: data }));
      }
    }
  };

  function formatRelativeTime(dateString: string) {
    const now = new Date();
    const date = new Date(new Date(dateString).getTime() + 2 * 60 * 60 * 1000); // Décalage si besoin
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diff < 60) return 'maintenant';
    if (diff < 3600) return `il y a ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `il y a ${Math.floor(diff / 3600)} h`;
    if (diff < 172800) return 'hier';
    if (diff < 604800) return `il y a ${Math.floor(diff / 86400)} j`;
    if (diff < 2592000) return `il y a ${Math.floor(diff / 604800)} sem.`;
    return date.toLocaleDateString();
  }

  const handleSendMessage = async (msg: string, imageFile?: File) => {
    if (!selectedConversationId) return;
    const receiverId = others.length === 1 ? others[0].id : others.length > 1 ? others.map((u) => u.id) : undefined;

    const newMessage: ChatCardMessage = {
      id: Date.now().toString(),
      content: msg,
      sender: {
        name: user?.username || 'You',
        avatar: user?.avatar || '/default-avatar.png',
        isOnline: true,
        isCurrentUser: true,
      },
      timestamp: new Date(Date.now() + 2 * 60 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sent',
      reactions: [],
      imageUrl: imageFile ? URL.createObjectURL(imageFile) : undefined,
    };
    setLocalMessages((prev) => [...prev, newMessage]);
    await send({
      content: msg,
      conversationId: selectedConversationId,
      receiverId,
      imageFile,
    });
  };

  // console.log('others:', others);
  return (
    <div className='flex h-screen bg-white overflow-hidden'>
      {/* Colonne des conversations */}
      <div className='flex flex-col border-r border-gray-200 w-[400px] min-w-[400px] max-w-[400px] h-full'>
        <div className='flex justify-between items-center p-4 border-b border-gray-200'>
          <h1 className='text-xl font-bold text-gray-900'>Messages</h1>
          <button className='text-gray-600 hover:text-blue-500 transition-colors' onClick={() => setIsCreateMessageOpen(true)}>
            <MailPlus className='w-6 h-6' />
          </button>
        </div>
        {/* Liste des conversations */}
        <div className='flex-1 flex flex-col overflow-y-auto'>
          {conversationsLoading ? (
            <div className='p-4 text-gray-600'>Chargement des conversations...</div>
          ) : Array.isArray(conversations) && conversations.length > 0 ? (
            sortedConversations.map((conversation) => {
              const currentUserId = user?.id;
              const others = Array.isArray(conversation.participants) ? conversation.participants.filter((p) => p.id !== currentUserId) : [];
              const isSelected = selectedConversationId === conversation.id;
              const userId = others[0]?.id;
              // others.forEach((u) => {
              //   console.log('User:', {
              //     id: u.id,
              //     username: u.username,
              //     firstName: userCache[u.id]?.first_name,
              //     lastName: userCache[u.id]?.last_name,
              //   });
              // });
              //console.log('conversation:', conversation);
              // console.log('selectedConversationId:', selectedConversationId);
              // console.log('others:', others);
              // console.log('currentUserId:', currentUserId);
              // console.log('isSelected:', isSelected);
              //console.log('userId:', userId);
              //console.log('avatar:', others[0]?.avatar);

              const userInfo = userId ? userCache[userId] : null;

              return (
                <div key={conversation.id} className={`relative flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 transition-colors ${isSelected ? 'bg-blue-50' : ''}`} onClick={() => setSelectedConversationId(conversation.id)}>
                  {isSelected && <div className='absolute left-0 top-0 h-full w-1 bg-blue-500 rounded-r-lg' />}
                  <div className='flex items-center ml-2'>
                    {others.length > 1 ? (
                      <div className='w-10 h-10 rounded-full bg-blue-200 flex items-center justify-center border'>
                        <span className='text-blue-700 text-lg font-bold'>G</span>
                      </div>
                    ) : others[0]?.avatar && others[0]?.avatar !== '/default-avatar.png' ? (
                      <img src={others[0].avatar} alt={others[0]?.username || 'Avatar'} className='w-10 h-10 rounded-full object-cover border' />
                    ) : (
                      <div className='w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center border'>
                        <span className='text-gray-500 text-lg font-bold'>{others[0]?.username ? others[0].username[0].toUpperCase() : '?'}</span>
                      </div>
                    )}
                  </div>
                  <div className='flex-1 min-w-0'>
                    <div className='flex-1 min-w-0'>
                      {others.length === 1 && userCache[others[0]?.id] ? (
                        <span className='text-gray-900 font-semibold'>
                          {userCache[others[0].id].first_name} {userCache[others[0].id].last_name}
                          <span className='text-gray-500 font-normal'> @{others[0].username}</span>
                          {conversation.lastMessage?.created_at && <span className='text-gray-400 font-normal'> · {formatRelativeTime(conversation.lastMessage.created_at)}</span>}{' '}
                        </span>
                      ) : (
                        <span className='text-gray-900 font-semibold'>
                          {others.map((u, idx) => (
                            <span key={u.id}>
                              {u.username}
                              {idx < others.length - 1 && ', '}
                              {idx === others.length - 1 && conversation.lastMessage?.created_at && <span className='text-gray-400 font-normal'> · {formatRelativeTime(conversation.lastMessage.created_at)}</span>}{' '}
                            </span>
                          ))}
                        </span>
                      )}
                    </div>
                    <div className='text-sm text-gray-500 truncate'>{conversation.lastMessage ? conversation.lastMessage.content : <span className='italic text-gray-400'>Aucun message</span>}</div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className='p-8 text-left'>
              <h2 className='font-bold text-xl mb-3 text-gray-900'>Bienvenue dans votre boîte de réception !</h2>
              <p className='text-gray-600 text-sm leading-relaxed mb-6'>Écrivez un mot, et partagez des posts et plus encore dans des conversations privées entre vous et d'autres utilisateurs de SN.</p>
              <button onClick={() => setIsCreateMessageOpen(true)} className='flex items-center justify-center gap-2 w-full py-4 px-6 bg-blue-500 text-white rounded-2xl hover:bg-blue-600 transition-colors duration-200 font-medium shadow-md hover:shadow-lg'>
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
              setSelectedConversationId(conversation.id);
              setIsCreateMessageOpen(false);
            }}
          />
        )}
      </div>

      {/* Colonne des messages */}
      <div className='flex flex-col bg-white flex-1 h-full min-w-0'>
        {selectedConversationId ? (
          <div className='flex-1 flex flex-col min-h-0'>
            <ChatCard
              chatName={chatName}
              membersCount={others.length}
              initialMessages={[...chatCardMessages, ...localMessages]}
              currentUser={{
                name: 'Moi',
                avatar: user?.avatar || '/default-avatar.png',
              }}
              theme='light'
              className='border border-zinc-200 flex-1 min-h-0'
              onSendMessage={handleSendMessage}
              onReaction={(messageId, emoji) => console.log('Reaction:', messageId, emoji)}
              onMoreClick={() => console.log('More clicked')}
            />
          </div>
        ) : (
          <div className='flex flex-col items-center justify-center flex-1 px-8 space-y-6 min-h-0'>
            <h2 className='text-3xl font-bold text-gray-900'>Sélectionnez un message</h2>
            <p className='text-base text-gray-500 text-center max-w-md'>Faites un choix dans vos conversations existantes, commencez-en une nouvelle ou ne changez rien.</p>
            <button onClick={() => setIsCreateMessageOpen(true)} className='flex items-center justify-center gap-2 py-4 px-6 bg-blue-500 text-white rounded-2xl hover:bg-blue-600 transition-colors duration-200 font-medium shadow-md hover:shadow-lg w-64'>
              <MailPlus className='w-6 h-6' />
              <span>Nouveau message</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
