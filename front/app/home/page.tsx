'use client';
import { useAuth } from '@/hooks/user/checkAuth';
import { useUserData } from '@/hooks/user/useUserData';
import TwitterLikeFeed from '@/components/feed';
import { useState } from 'react';
import { Plus } from 'lucide-react';

export default function HomePage() {
  const { userData, loading: userDataLoading } = useUserData();
  const { isLoading: authLoading, isAuthenticated } = useAuth({
    required: true,
    redirectTo: '/',
  });
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openPostForm = () => setIsModalOpen(true);
  const closePostForm = () => setIsModalOpen(false);

  if (authLoading || userDataLoading) return <div>Loading...</div>;
  if (!userData) return <div>Impossible de charger les données utilisateur</div>;

  return (
    <div className='relative'>
      <h1 className='text-xl font-bold mb-4'>{`Bienvenue, ${userData.username} !`}</h1>
      <div className={`overflow-y-auto border rounded p-4 transition ${isModalOpen ? 'opacity-50 pointer-events-none' : ''}`} id='main_container'>
        <TwitterLikeFeed />
      </div>

      <button className='fixed bottom-6 right-6 bg-blue-500 text-white px-4 py-2 rounded-full shadow-lg hover:bg-blue-600 transition' onClick={openPostForm}>
        <Plus className='w-6 h-6' />
      </button>

      {isModalOpen && (
        <div
          className='fixed inset-0 flex items-center justify-center bg-black/60 px-4 py-2 rounded shadow transition'
          id='modal'
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              closePostForm();
            }
          }}
        >
          <div className='bg-white p-4 rounded shadow-md'>
            <h2 className='text-xl font-bold mb-4'>Create a New Post</h2>
            <form id='post-form' className='flex flex-col gap-4'>
              <textarea placeholder='Content' className='border p-2 rounded' required></textarea>
              <input type='file' accept='image/gif, image/jpeg, image/png' className='border p-2 rounded' />
              <button type='submit' className='bg-blue-500 text-white px-4 py-2 rounded shadow'>
                Submit
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
