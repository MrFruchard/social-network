'use client';

import { useAuth } from '@/hooks/user/checkAuth';
import { useRouter, useSearchParams } from 'next/navigation';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ProfileContent } from '@/components/ProfileContent';
import { LogoutButton } from '@/components/logout-button';
import { ProfileMenuItem } from '@/components/ProfileMenuItem';
import { useUserData } from '@/hooks/user/useUserData';
import Link from 'next/link';

export default function ProfilePage() {
  const router = useRouter();
  const { isLoading: authLoading, isAuthenticated } = useAuth({
    required: true,
    redirectTo: '/',
  });

  const { userData, loading: userDataLoading } = useUserData();
  const searchParams = useSearchParams();
  const userId = searchParams.get('id');

  if (authLoading || userDataLoading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full'></div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className='container mx-auto py-8'>
        <Alert>
          <AlertDescription>Impossible de charger les données utilisateur</AlertDescription>
        </Alert>
      </div>
    );
  }

  const navigateTo = (path: string) => {
    router.push(path);
  };

  return <>{isAuthenticated && <ProfileContent userId={userId || undefined} />}</>;
}
