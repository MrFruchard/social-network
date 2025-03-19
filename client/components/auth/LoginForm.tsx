// components/auth/LoginForm.tsx
"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from 'next/navigation';
import useAuth from "@/hooks/use-auth";

export function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { login, error } = useAuth();

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);

        try {
            await login(email, password);
            // Rediriger vers le feed après connexion réussie
            router.push('/');
        } catch (error) {
            // L'erreur est déjà gérée dans le hook useAuth
            console.error('Erreur dans le formulaire:', error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="w-full max-w-md mx-auto p-6 bg-card rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6 text-center">Connexion</h2>

            {error && (
                <div className="bg-destructive/10 text-destructive p-3 rounded-md mb-4">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium">
                        Email
                    </label>
                    <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="votre@email.com"
                        required
                        disabled={loading}
                    />
                </div>

                <div className="space-y-2">
                    <label htmlFor="password" className="text-sm font-medium">
                        Mot de passe
                    </label>
                    <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={loading}
                    />
                </div>

                <Button
                    type="submit"
                    className="w-full"
                    disabled={loading}
                >
                    {loading ? 'Connexion en cours...' : 'Se connecter'}
                </Button>
            </form>

            <div className="mt-4 text-center text-sm">
                <a href="#" className="text-primary hover:underline">
                    Mot de passe oublié?
                </a>
            </div>

            <div className="mt-6 text-center text-sm">
                Pas encore de compte?{' '}
                <a href="/register" className="text-primary hover:underline">
                    S'inscrire
                </a>
            </div>
        </div>
    );
}