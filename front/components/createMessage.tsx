'use client';

import { useState, useEffect } from 'react';
import { X, Search } from 'lucide-react';
import { useListFollow } from '@/hooks/follow/useListFollow';
import { useConversations } from '../hooks/message/ConversationsContext';
import { ChatLayout } from './Message-Form';

interface User {
  id: string;
  username: string;
  avatar?: string | null;
}

export default function CreateMessage({
  isOpen,
  onClose,
  onSelectConversation, // Ajoute cette prop
}: {
  isOpen: boolean;
  onClose: () => void;
  onSelectConversation?: (conversation: any) => void; // Typage à adapter selon ton modèle
}) {
  const [search, setSearch] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const { follows, loading, error, fetchFollows } = useListFollow();
  const { addConversation } = useConversations();
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);
  const [showMessageForm, setShowMessageForm] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchFollows();
    }
  }, [isOpen, fetchFollows]);

  const filteredUsers =
    follows?.follow
      ?.filter((follow) => follow.username.toLowerCase().includes(search.toLowerCase()))
      .map((follow) => ({
        id: follow.user_id,
        username: follow.username,
        avatar: follow.image || null,
      })) || [];

  const toggleUserSelection = (user: User) => {
    setSelectedUsers((prev) => (prev.find((u) => u.id === user.id) ? prev.filter((u) => u.id !== user.id) : [...prev, user]));
  };

  const handleNext = async () => {
    try {
      setIsCreatingConversation(true);

      const newConversation = {
        id: `temp-${Date.now()}`,
        participants: selectedUsers.map((user) => ({
          id: user.id,
          username: user.username,
          avatar: user.avatar,
        })),
        lastMessage: null,
      };

      addConversation(newConversation);

      // Ajoute cette ligne pour sélectionner la conversation dans la colonne chat
      if (onSelectConversation) {
        onSelectConversation(newConversation);
      }

      setShowMessageForm(true);
    } catch (error) {
      console.error('Error creating conversation:', error);
    } finally {
      setIsCreatingConversation(false);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50'>
      <div className='fixed inset-0 bg-black/20' onClick={onClose} />
      <div className='fixed inset-0 flex items-center justify-center p-4'>
        <div className='w-full max-w-md rounded-2xl bg-white shadow-xl'>
          <div className='p-4'>
            {selectedUsers.length > 0 && (
              <div className='flex flex-wrap gap-2 mb-3'>
                {selectedUsers.map((user) => (
                  <div key={user.id} className='flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm'>
                    <span>{user.username}</span>
                    <button onClick={() => toggleUserSelection(user)} className='hover:text-blue-600'>
                      <X className='h-4 w-4' />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className='relative'>
              <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400' />
              <input type='text' placeholder='Rechercher des personnes' value={search} onChange={(e) => setSearch(e.target.value)} className='w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500' />
            </div>

            <div className='mt-4 max-h-[300px] overflow-y-auto'>
              {loading && <div className='text-center py-4'>Chargement...</div>}
              {error && <div className='text-center py-4 text-red-500'>{error}</div>}
              {!loading &&
                !error &&
                filteredUsers.map((user) => (
                  <button key={user.id} onClick={() => toggleUserSelection(user)} className={`w-full text-left p-3 rounded-lg transition-colors ${selectedUsers.find((u) => u.id === user.id) ? 'bg-blue-50' : 'hover:bg-gray-50'}`}>
                    <div className='flex items-center gap-3'>
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.username} className='w-8 h-8 rounded-full object-cover' />
                      ) : (
                        <div className='w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center'>
                          <span className='text-gray-500 text-sm'>{user.username[0]}</span>
                        </div>
                      )}
                      <div className='font-medium'>{user.username}</div>
                    </div>
                  </button>
                ))}
            </div>
          </div>

          <div className='flex justify-end gap-2 p-4 border-t'>
            <button onClick={onClose} className='px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg'>
              Fermer
            </button>
            <button onClick={handleNext} disabled={selectedUsers.length === 0 || isCreatingConversation} className='px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed'>
              {isCreatingConversation ? 'Création...' : 'Suivant'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
