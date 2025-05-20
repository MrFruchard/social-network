import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useConversations } from '../hooks/message/ConversationsContext';
import { useMessages } from '../hooks/message/useMessages';
import { MailPlus } from 'lucide-react';
import CreateMessage from './createMessage';
import { useAuth } from '../hooks/user/checkAuth';
import { useSendMessage } from '../hooks/message/useSendMessage';
import { ChatCard, Message as ChatCardMessage } from '@/components/chat-card'; // Assurez-vous que Reaction est exporté ou défini
import { useWebSocket, MessageType as WSMessageType } from '@/contexts/websocket-context';

export function ChatLayout({ recipients = [], onClose }: { recipients?: { id: string; username: string; avatar: string | null }[]; onClose: () => void }) {
  const { user } = useAuth();
  const { send } = useSendMessage();
  const { conversations = [], loading: conversationsLoading, fetchConversations } = useConversations();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const { messages: apiFetchedMessagesRoot, loading: messagesLoading, fetchMessages: fetchApiMessages } = useMessages(selectedConversationId || undefined);
  const [isCreateMessageOpen, setIsCreateMessageOpen] = useState(false);

  const safeApiMessages = Array.isArray(apiFetchedMessagesRoot) ? apiFetchedMessagesRoot : apiFetchedMessagesRoot && Array.isArray(apiFetchedMessagesRoot.messages) ? apiFetchedMessagesRoot.messages : [];

  const [conversationsLoaded, setConversationsLoaded] = useState(false);
  const [localMessages, setLocalMessages] = useState<ChatCardMessage[]>([]);
  const [userCache, setUserCache] = useState<{ [id: string]: { firstName: string; lastName: string; username?: string; avatar?: string | null } }>({});

  const { messages: wsReceivedMessages } = useWebSocket();

  const sortedConversations = useMemo(() => {
    return Array.isArray(conversations)
      ? [...conversations].sort((a, b) => {
          const aDate = a.lastMessage?.created_at ? new Date(a.lastMessage.created_at).getTime() : 0;
          const bDate = b.lastMessage?.created_at ? new Date(b.lastMessage.created_at).getTime() : 0;
          return bDate - aDate;
        })
      : [];
  }, [conversations]);

  const selectedConversation = useMemo(() => {
    return Array.isArray(conversations) ? conversations.find((conv) => conv.id === selectedConversationId) : undefined;
  }, [conversations, selectedConversationId]);

  const others = useMemo(() => {
    return selectedConversation?.participants ? selectedConversation.participants.filter((p) => p.id !== user?.id) : recipients.filter((p) => p.id !== user?.id);
  }, [selectedConversation, user?.id, recipients]);

  const chatName = useMemo(() => {
    return others.length > 1 ? 'Groupe' : others.length === 1 && others[0] ? others[0].username : 'Conversation';
  }, [others]);

  const fetchUserInfo = useCallback(
    async (id: string) => {
      if (!userCache[id] || !userCache[id].username) {
        try {
          const res = await fetch(`/api/user/${id}`);
          if (res.ok) {
            const data = await res.json();
            setUserCache((prev) => ({ ...prev, [id]: { firstName: data.firstName, lastName: data.lastName, username: data.username, avatar: data.avatar } }));
          }
        } catch (error) {
          console.error('Failed to fetch user info:', error);
        }
      }
    },
    [userCache]
  );

  // console.log('localMessages', localMessages);
  useEffect(() => {
    fetchConversations().then(() => setConversationsLoaded(true));
  }, [fetchConversations]);

  useEffect(() => {
    if (selectedConversationId) {
      fetchApiMessages(selectedConversationId);
    } else {
      setLocalMessages([]);
    }
  }, [selectedConversationId, fetchApiMessages]);

  useEffect(() => {
    if (selectedConversationId) {
      const transformedApiMessages = safeApiMessages.map((apiMsg) => {
        const isCurrentUser = apiMsg.sender === user?.id;
        let senderDetails = selectedConversation?.participants?.find((p) => p.id === apiMsg.sender);
        if (!senderDetails && apiMsg.sender && userCache[apiMsg.sender]) {
          const cachedUser = userCache[apiMsg.sender];
          senderDetails = { id: apiMsg.sender, username: cachedUser.username || `${cachedUser.firstName} ${cachedUser.lastName}`, avatar: cachedUser.avatar || null };
        }

        // Store the original createdAt for reliable sorting
        const originalCreatedAt = new Date(apiMsg.createdAt).getTime();
        // Adjust time for display if necessary (e.g., timezone offset)
        const displayTimestamp = new Date(originalCreatedAt + 2 * 60 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        return {
          id: apiMsg.id,
          content: apiMsg.content,
          sender: {
            name: isCurrentUser ? user?.username || 'You' : senderDetails?.username || 'Unknown User',
            avatar: isCurrentUser ? user?.avatar || '/default-avatar.png' : senderDetails?.avatar || '/default-avatar.png',
            isCurrentUser: isCurrentUser,
          },
          timestamp: displayTimestamp, // For display
          originalCreatedAt: originalCreatedAt, // For sorting
          status: 'delivered',
          reactions: apiMsg.reactions || [],
          imageUrl: apiMsg.imageUrl || apiMsg.image || undefined,
        } as ChatCardMessage & { originalCreatedAt: number };
      });

      // Sort by the original creation timestamp
      const sortedMessages = transformedApiMessages.sort((a, b) => a.originalCreatedAt - b.originalCreatedAt);

      setLocalMessages(sortedMessages.map(({ originalCreatedAt, ...rest }) => rest));
    } else {
      setLocalMessages([]);
    }
  }, [safeApiMessages, selectedConversationId, user, selectedConversation, userCache]);

  useEffect(() => {
    if (conversationsLoaded && Array.isArray(sortedConversations) && sortedConversations.length > 0 && !selectedConversationId) {
      setSelectedConversationId(sortedConversations[0].id);
    }
  }, [conversationsLoaded, sortedConversations, selectedConversationId]);

  useEffect(() => {
    const idsToFetch: string[] = [];
    const currentCache = userCache;
    for (const conv of sortedConversations) {
      if (Array.isArray(conv.participants)) {
        for (const p of conv.participants) {
          //  avec currentCache au lieu de userCache directement dans la condition
          if (p.id && p.id !== user?.id && (!currentCache[p.id] || !currentCache[p.id].username)) {
            idsToFetch.push(p.id);
          }
        }
      }
    }
    const uniqueIds = [...new Set(idsToFetch)];
    if (uniqueIds.length > 0) {
      uniqueIds.forEach((id) => {
        fetchUserInfo(id);
      });
    }
  }, [sortedConversations, user?.id, fetchUserInfo]);

  useEffect(() => {
    wsReceivedMessages.forEach((wsMessage: WSMessageType) => {
      console.log('WebSocket message received:', wsMessage);
      console.log('Selected conversation ID:', selectedConversationId);
      console.log('User ID:', user?.id);
      console.log('Local messages:', localMessages);
      console.log('Sender ID:', wsMessage.senderId);
      console.log('Message ID:', wsMessage.id);
      console.log('Conversation ID:', wsMessage.conversationId);
      console.log('Message content:', wsMessage.content);
      console.log('Image file:', wsMessage.imageFile);
      console.log('Timestamp:', wsMessage.timestamp);
      console.log(
        'Sender details:',
        selectedConversation?.participants?.find((p) => p.id === wsMessage.senderId)
      );
      console.log('User cache:', userCache);
      console.log('User cache for sender:', userCache[wsMessage.senderId]);

      if (wsMessage.id && wsMessage.conversationId === selectedConversationId && wsMessage.senderId !== user?.id && !localMessages.find((lm) => lm.id === wsMessage.id)) {
        let senderDetails = selectedConversation?.participants?.find((p) => p.id === wsMessage.senderId);
        if (!senderDetails && wsMessage.senderId && userCache[wsMessage.senderId]) {
          const cachedUser = userCache[wsMessage.senderId];
          senderDetails = { id: wsMessage.senderId, username: cachedUser.username || `${cachedUser.firstName} ${cachedUser.lastName}`, avatar: cachedUser.avatar || null };
        } else if (!senderDetails && wsMessage.senderId) {
          fetchUserInfo(wsMessage.senderId);
        }

        const newCardMessage: ChatCardMessage = {
          id: wsMessage.id,
          content: wsMessage.content,
          sender: {
            name: senderDetails?.username || 'Unknown User',
            avatar: senderDetails?.avatar || '/default-avatar.png',
            isCurrentUser: false,
          },
          timestamp: wsMessage.timestamp ? new Date(wsMessage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'delivered',
          reactions: wsMessage.reactions || [],
          imageUrl: wsMessage.imageFile,
        };

        setLocalMessages((prevMessages) => {
          if (prevMessages.find((pm) => pm.id === newCardMessage.id)) {
            return prevMessages;
          }
          // Add and sort messages
          return [...prevMessages, newCardMessage].sort((a, b) => {
            // Helper to parse timestamp string to comparable value
            const parseTime = (ts: string) => {
              const [time, period] = ts.split(' ');
              let [hours, minutes] = time.split(':').map(Number);
              if (period?.toLowerCase() === 'pm' && hours !== 12) hours += 12;
              if (period?.toLowerCase() === 'am' && hours === 12) hours = 0; // Midnight case
              return hours * 60 + minutes;
            };
            return parseTime(a.timestamp) - parseTime(b.timestamp);
          });
        });
      }
    });
  }, [wsReceivedMessages, selectedConversationId, user?.id, localMessages, selectedConversation, userCache, fetchUserInfo]);

  function formatRelativeTime(dateString: string) {
    const now = new Date();
    const date = new Date(new Date(dateString).getTime() + 2 * 60 * 60 * 1000);
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diff < 60) return 'maintenant';
    if (diff < 3600) return `il y a ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `il y a ${Math.floor(diff / 3600)} h`;
    if (diff < 172800) return 'hier';
    if (diff < 604800) return `il y a ${Math.floor(diff / 86400)} j`;
    if (diff < 2592000) return `il y a ${Math.floor(diff / 604800)} sem.`;
    return date.toLocaleDateString();
  }

  const handleSendMessageProp = useCallback(
    async (msg: string, imageFile?: File) => {
      // MODIFICATION: Mémoïsation
      if (!selectedConversationId || !user) return;
      const currentReceiverId = others.length === 1 && others[0] ? others[0].id : others.length > 1 ? others.map((u) => u.id) : undefined;

      const tempId = `optimistic-${Date.now()}`;
      const optimisticMessage: ChatCardMessage = {
        id: tempId,
        content: msg,
        sender: {
          name: user.username || 'You',
          avatar: user.avatar || '/default-avatar.png',
          isOnline: true,
          isCurrentUser: true,
        },
        timestamp: new Date(Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'sent',
        reactions: [],
        imageUrl: imageFile ? URL.createObjectURL(imageFile) : undefined,
      };
      setLocalMessages((prev) =>
        [...prev, optimisticMessage].sort((a, b) => {
          const parseTime = (ts: string) => {
            const [time, period] = ts.split(' ');
            let [hours, minutes] = time.split(':').map(Number);
            if (period?.toLowerCase() === 'pm' && hours !== 12) hours += 12;
            if (period?.toLowerCase() === 'am' && hours === 12) hours = 0;
            return hours * 60 + minutes;
          };
          return parseTime(a.timestamp) - parseTime(b.timestamp);
        })
      );

      try {
        const response = await send({
          content: msg,
          conversationId: selectedConversationId,
          receiverId: currentReceiverId,
          imageFile,
        });

        if (response && response.id && response.id !== tempId) {
          setLocalMessages((prev) => prev.map((m) => (m.id === tempId ? { ...optimisticMessage, id: response.id, status: 'delivered', timestamp: new Date(new Date(response.createdAt).getTime() + 2 * 60 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) } : m)));
        } else if (response && response.id && !response.createdAt) {
          // If createdAt is missing from response
          setLocalMessages((prev) => prev.map((m) => (m.id === tempId ? { ...optimisticMessage, id: response.id, status: 'delivered' } : m)));
        }
      } catch (error) {
        console.error('Failed to send message:', error);
        setLocalMessages((prev) => prev.map((m) => (m.id === tempId ? { ...m, status: 'failed' } : m)));
      }
    },
    [selectedConversationId, user, others, send, setLocalMessages]
  );

  const currentUserForCard = useMemo(
    () => ({
      name: user?.username || 'Moi',
      avatar: user?.avatar || '/default-avatar.png',
    }),
    [user?.username, user?.avatar]
  );

  return (
    <div className='flex h-screen bg-white overflow-hidden'>
      <div className='flex flex-col border-r border-gray-200 w-[400px] min-w-[400px] max-w-[400px] h-full'>
        <div className='flex justify-between items-center p-4 border-b border-gray-200'>
          <h1 className='text-xl font-bold text-gray-900'>Messages</h1>
          <button className='text-gray-600 hover:text-blue-500 transition-colors' onClick={() => setIsCreateMessageOpen(true)}>
            <MailPlus className='w-6 h-6' />
          </button>
        </div>

        {/* conversation */}
        <div className='flex-1 flex flex-col overflow-y-auto'>
          {conversationsLoading ? (
            <div className='p-4 text-gray-600'>Chargement des conversations...</div>
          ) : Array.isArray(conversations) && conversations.length > 0 ? (
            sortedConversations.map((conversation) => {
              const currentUserId = user?.id;
              const othersInConv = Array.isArray(conversation.participants) ? conversation.participants.filter((p) => p.id !== currentUserId) : [];
              const isSelected = selectedConversationId === conversation.id;

              return (
                <div key={conversation.id} className={`relative flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 transition-colors ${isSelected ? 'bg-blue-50' : ''}`} onClick={() => setSelectedConversationId(conversation.id)}>
                  {isSelected && <div className='absolute left-0 top-0 h-full w-1 bg-blue-500 rounded-r-lg' />}
                  <div className='flex items-center ml-2'>
                    {othersInConv.length > 1 ? (
                      <div className='w-10 h-10 rounded-full bg-blue-200 flex items-center justify-center border'>
                        <span className='text-blue-700 text-lg font-bold'>G</span>
                      </div>
                    ) : othersInConv[0]?.avatar && othersInConv[0]?.avatar !== '/default-avatar.png' ? (
                      <img src={othersInConv[0].avatar} alt={othersInConv[0]?.username || 'Avatar'} className='w-10 h-10 rounded-full object-cover border' />
                    ) : (
                      <div className='w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center border'>
                        <span className='text-gray-500 text-lg font-bold'>{othersInConv[0]?.username ? othersInConv[0].username[0].toUpperCase() : '?'}</span>
                      </div>
                    )}
                  </div>
                  <div className='flex-1 min-w-0'>
                    <div className='flex-1 min-w-0'>
                      {othersInConv.length === 1 && othersInConv[0] ? (
                        <span className='text-gray-900 font-semibold'>
                          {userCache[othersInConv[0].id]?.firstName || othersInConv[0].username} {userCache[othersInConv[0].id]?.lastName}
                          {userCache[othersInConv[0].id] && <span className='text-gray-500 font-normal'> @{othersInConv[0].username}</span>}
                          {conversation.lastMessage?.created_at && <span className='text-gray-400 font-normal'> · {formatRelativeTime(conversation.lastMessage.created_at)}</span>}{' '}
                        </span>
                      ) : (
                        <span className='text-gray-900 font-semibold'>
                          {othersInConv.length > 2 ? (
                            <>
                              {othersInConv.slice(0, 2).map((u, idx) => (
                                <span key={u.id}>
                                  {userCache[u.id]?.username || u.username}
                                  {idx === 0 && ', '}
                                </span>
                              ))}
                              <span className='ml-1 text-gray-500 font-normal'>+{othersInConv.length - 2}</span>
                            </>
                          ) : (
                            othersInConv.map((u, idx) => (
                              <span key={u.id}>
                                {userCache[u.id]?.username || u.username}
                                {idx < othersInConv.length - 1 && ', '}
                              </span>
                            ))
                          )}
                          {conversation.lastMessage?.created_at && (
                            <span className='text-gray-400 font-normal'>
                              {' · '}
                              {formatRelativeTime(conversation.lastMessage.created_at)}
                            </span>
                          )}
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

      {/* Chat Card */}
      <div className='flex flex-col bg-white flex-1 h-full min-w-0'>
        {selectedConversationId ? (
          <div className='flex-1 flex flex-col min-h-0'>
            <ChatCard chatName={chatName} membersCount={others.length} initialMessages={localMessages} currentUser={currentUserForCard} theme='light' className='border border-zinc-200 flex-1 min-h-0' onSendMessage={handleSendMessageProp} onReaction={(messageId, emoji) => console.log('Reaction:', messageId, emoji)} onMoreClick={() => console.log('More clicked')} />
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
