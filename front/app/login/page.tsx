'use client';

import { useAuth } from '@/hooks/user/checkAuth';
import { LoginForm } from '@/components/login-form';

export default function LoginPage() {
  const { isLoading } = useAuth({
    redirectIfAuthenticated: '/home',
  });

  if (isLoading) {
    return <div className='flex items-center justify-center min-h-screen'>Loading...</div>;
  }

  return (
    <div className='flex items-center justify-center min-h-screen bg-background'>
      <div className='w-full max-w-md p-8 space-y-8 bg-card rounded-lg shadow-lg'>
        <div className='text-center'>
          <h1 className='text-2xl font-bold'>Login to Social Network</h1>
          <p className='mt-2 text-sm text-muted-foreground'>Enter your credentials to access your account</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
