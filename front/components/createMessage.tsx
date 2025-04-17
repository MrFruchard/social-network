'use client';

import { useState } from 'react';
import { X, Search } from 'lucide-react';

interface User {
  id: string;
  username: string;
  email: string;
}

// Mock data for testing
const MOCK_USERS = [
  { id: '1', username: 'John Doe', email: 'john@example.com' },
  { id: '2', username: 'Jane Smith', email: 'jane@example.com' },
  { id: '3', username: 'Alice Johnson', email: 'alice@example.com' },
];

export default function CreateMessage({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [search, setSearch] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);

  // Filter users based on search
  const filteredUsers = MOCK_USERS.filter((user) => user.username.toLowerCase().includes(search.toLowerCase()) || user.email.toLowerCase().includes(search.toLowerCase()));

  const toggleUserSelection = (user: User) => {
    setSelectedUsers((prev) => (prev.find((u) => u.id === user.id) ? prev.filter((u) => u.id !== user.id) : [...prev, user]));
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50'>
      <div className='fixed inset-0 bg-black/20' onClick={onClose} />
      <div className='fixed inset-0 flex items-center justify-center p-4'>
        <div className='w-full max-w-md rounded-2xl bg-white shadow-xl'>
          <div className='flex items-center justify-between p-4 border-b'>
            <h2 className='text-lg font-semibold'>Nouveau message </h2>
            <button onClick={onClose} className='text-gray-500 hover:text-gray-700'>
              <X className='h-5 w-5' />
            </button>
          </div>

          <div className='p-4'>
            {/* Selected users */}
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

            {/* Search input */}
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400' />
              <input type='text' placeholder='Recherher des personnes' value={search} onChange={(e) => setSearch(e.target.value)} className='w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500' />
            </div>

            {/* User list */}
            <div className='mt-4 max-h-[300px] overflow-y-auto'>
              {filteredUsers.map((user) => (
                <button key={user.id} onClick={() => toggleUserSelection(user)} className={`w-full text-left p-3 rounded-lg transition-colors ${selectedUsers.find((u) => u.id === user.id) ? 'bg-blue-50' : 'hover:bg-gray-50'}`}>
                  <div className='font-medium'>{user.username}</div>
                  <div className='text-sm text-gray-500'>{user.email}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className='flex justify-end gap-2 p-4 border-t'>
            <button onClick={onClose} className='px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg'>
              Fermer
            </button>
            <button disabled={selectedUsers.length === 0} className='px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed'>
              Suivant
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
