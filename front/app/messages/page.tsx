'use client';

import { useAuth } from '@/hooks/user/checkAuth';
import { ChatLayout } from '@/components/Message-Form';
import { MainLayout } from '@/components/MainLayout';
import { ConversationsProvider } from '@/hooks/message/ConversationsContext'; // <-- Ajoute cet import

export default function MessagesPage() {
  const { isLoading: authLoading, isAuthenticated } = useAuth({
    required: true,
    redirectTo: '/',
  });

  if (authLoading) {
    return (
      <div className='flex items-center justify-center h-full'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900'></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <MainLayout>
      <ConversationsProvider>
        {' '}
        {/* <-- Ajoute le provider ici */}
        <div className='h-full'>
          <ChatLayout />
        </div>
      </ConversationsProvider>
    </MainLayout>
  );
}
