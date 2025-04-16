'use client';

import { useAuth } from '@/hooks/user/checkAuth';
import { LoginForm } from '@/components/login-form';

export function LoginPage() {
  const { isLoading } = useAuth({
    redirectIfAuthenticated: '/home',
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return <LoginForm />;
}
