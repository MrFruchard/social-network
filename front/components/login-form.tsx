'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { useLogin } from '@/hooks/user/useLogin';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function LoginForm({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading, error } = useLogin();

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();

    try {
      await login({ identifier, password });
    } catch (err) {
      // L'erreur est déjà gérée par le hook useLogin
    }
  };
  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className='text-2xl'>Login</CardTitle>
          <CardDescription>Enter your email or username to login to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            {error && (
              <Alert variant='destructive' className='mb-4'>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className='flex flex-col gap-6'>
              <div className='grid gap-2'>
                <Label htmlFor='identifier'>Email or Username</Label>
                <Input id='identifier' type='text' placeholder='example@mail.com or username' required value={identifier} onChange={(e) => setIdentifier(e.target.value)} />
              </div>
              <div className='grid gap-2'>
                <div className='flex items-center'>
                  <Label htmlFor='password'>Password</Label>
                  <a href='#' className='ml-auto inline-block text-sm underline-offset-4 hover:underline'>
                    Forgot your password ?
                  </a>
                </div>
                <Input id='password' type='password' required value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              <Button type='submit' className='w-full' disabled={loading}>
                {loading ? 'Connexion en cours...' : 'Login'}
              </Button>

              <Button variant='outline' className='w-full' disabled={loading}>
                Login with Google
              </Button>
            </div>
            <div className='mt-4 text-center text-sm'>
              Don&apos;t have an account?{' '}
              <a href='/signup' className='underline underline-offset-4'>
                Sign up
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
