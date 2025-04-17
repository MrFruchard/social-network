'use client';

import { VercelV0Chat } from '@/components/v0-ai-chat';
import { MainLayout } from '@/components/MainLayout';

export default function IAPage() {
  return (
    <MainLayout>
      <div className='h-screen'>
        <VercelV0Chat />
      </div>
    </MainLayout>
  );
}
