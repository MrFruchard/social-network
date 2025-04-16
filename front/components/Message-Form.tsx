import React, { useEffect, useState } from 'react';
import { useConversations } from '../hooks/message/useConversations';
import { useMessages } from '../hooks/message/useMessages';
import { MailPlus } from 'lucide-react';
// import CreateChat from './createMessage';

interface Conversation {
  id: string;
  participants: string[];
  lastMessage?: {
    content: string;
  };
}

export function ChatLayout() {
  const { conversations = [], loading: conversationsLoading, fetchConversations } = useConversations();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const { messages = [], loading: messagesLoading, fetchMessages } = useMessages(selectedConversationId || undefined);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    if (selectedConversationId) {
      fetchMessages();
    }
  }, [selectedConversationId, fetchMessages]);

  console.log('Conversations:', conversations);
  return (
    <div className='flex h-screen'>
      <div className='w-1/3 flex flex-col border-r '>
        <div className='flex justify-between items-center p-4 border-b '>
          <h1 className='text-xl font-bold text-white'>Messages</h1>
          <button
            className='text-white hover:text-blue-500 transition-colors'
            onClick={() => {
              // setIsCreateMessageOpen(true);
            }}
          >
            <MailPlus className='w-6 h-6' />
          </button>
        </div>

        {/* Liste des conversations */}
        <div className='flex-1 overflow-y-auto'>
          {conversationsLoading ? (
            <div className='p-4'>Loading conversations...</div>
          ) : Array.isArray(conversations) && conversations.length > 0 ? (
            conversations.map((conversation: Conversation) => (
              <div key={conversation.id} className={`p-4 cursor-pointer hover:bg-gray-100 ${selectedConversationId === conversation.id ? 'bg-blue-50' : ''}`} onClick={() => setSelectedConversationId(conversation.id)}>
                <div className='font-medium'>{conversation.participants?.join(', ') || 'No participants'}</div>
                {conversation.lastMessage && <div className='text-sm text-gray-500 truncate'>{conversation.lastMessage.content}</div>}
              </div>
            ))
          ) : (
            <div className='p-8 text-left'>
              <h2 className='font-bold text-xl mb-3 text-white'>Bienvenue dans votre boîte de réception !</h2>
              <p className='text-gray-600 text-sm leading-relaxed mb-6'>Écrivez un mot, et partagez des posts et plus encore dans des conversations privées entre vous et d'autres utilisateurs de SN.</p>
              <button
                onClick={() => {
                  // setIsCreateMessageOpen(true);
                }}
                className='flex items-center justify-center gap-2 w-full py-4 px-6 bg-blue-500 text-white rounded-2xl hover:bg-blue-600 transition-colors duration-200 font-medium shadow-md hover:shadow-lg'
              >
                <MailPlus className='w-6 h-6' />
                <span>Écrire un message</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Colonne des messages */}
      <div className='w-2/3 flex flex-col'>
        {selectedConversationId ? (
          <>
            <div className='flex-1 overflow-y-auto p-4'>
              {messagesLoading ? (
                <div>Loading messages...</div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`mb-4 ${
                      message.sender === 'currentUser' // Remplacer par votre logique
                        ? 'text-right'
                        : 'text-left'
                    }`}
                  >
                    <div className={`inline-block p-2 rounded-lg ${message.sender === 'currentUser' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>{message.content}</div>
                    <div className='text-xs text-gray-500 mt-1'>{new Date(message.created_at).toLocaleString()}</div>
                  </div>
                ))
              )}
            </div>

            {/* Input pour envoyer un message */}
            <div className='p-4 border-t border-gray-200'>
              <form className='flex gap-2'>
                <input type='text' className='flex-1 px-4 py-2 border rounded-lg' placeholder='Type a message...' />
                <button type='submit' className='px-4 py-2 bg-blue-500 text-white rounded-lg'>
                  Send
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className='flex items-center justify-center h-full text-gray-500'>Select a conversation to start messaging</div>
        )}
      </div>
    </div>
  );
}
