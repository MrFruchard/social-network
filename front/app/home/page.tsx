'use client';

import { useAuth } from '@/hooks/user/checkAuth';
import { useUserData } from '@/hooks/user/useUserData';
import TwitterLikeFeed from '@/components/feed';
import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/MainLayout';
import { PostModal, PostDetail } from '@/components/post';

export default function HomePage() {
  const { userData, loading: userDataLoading } = useUserData();
  const { isLoading: authLoading } = useAuth({
    required: true,
    redirectTo: '/login',
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [postDetailOpen, setPostDetailOpen] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const openPostForm = () => {
    setIsModalOpen(true);
  };

  const closePostForm = () => {
    setIsModalOpen(false);
  };

  const handlePostCreated = () => {
    setRefreshTrigger(prev => prev + 1);
  };
  
  // Vérifier si un ID de post est stocké dans sessionStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedPostId = sessionStorage.getItem('openPostId');
      if (storedPostId) {
        setSelectedPostId(storedPostId);
        setPostDetailOpen(true);
        // Nettoyer sessionStorage après avoir récupéré l'ID
        sessionStorage.removeItem('openPostId');
      }
    }
  }, []);

  if (authLoading || userDataLoading) {
    return <div className='flex items-center justify-center h-screen'>Loading...</div>;
  }

  if (!userData) {
    return <div className='flex items-center justify-center h-screen'>Impossible de charger les données utilisateur</div>;
  }

  return (
    <MainLayout>
      <div className='p-4'>
        <div className='border-b border-border pb-4 mb-4'>
          <button className='w-full bg-muted hover:bg-muted/80 rounded-lg p-4 text-left text-muted-foreground cursor-pointer transition-colors' onClick={openPostForm}>
            What&apos;s happening????
          </button>
        </div>

        <TwitterLikeFeed key={refreshTrigger} />
      </div>

      {isModalOpen && <PostModal isOpen={isModalOpen} onClose={closePostForm} onPostCreated={handlePostCreated} />}
      
      {/* PostDetail Dialog */}
      {selectedPostId && (
        <PostDetail
          postId={selectedPostId}
          isOpen={postDetailOpen}
          onClose={() => {
            setPostDetailOpen(false);
            // Laisser un petit délai avant de réinitialiser l'ID pour éviter des flashs
            setTimeout(() => setSelectedPostId(null), 200);
          }}
        />
      )}
    </MainLayout>
  );
}
