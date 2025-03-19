// app/login/page.tsx
import { LoginForm } from '@/components/auth/LoginForm';
import Link from 'next/link';

export default function LoginPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <div className="max-w-md w-full">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold">SN</h1>
                    <p className="text-muted-foreground mt-2">
                        Connectez-vous pour accéder à votre réseau social
                    </p>
                </div>

                <LoginForm />
            </div>
        </div>
    );
}