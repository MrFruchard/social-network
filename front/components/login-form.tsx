'use client';

import React, { useState } from 'react';
import { useLogin } from '@/hooks/user/useLogin';

export function LoginForm() {
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const { login, loading, error } = useLogin();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await login({ identifier, password });
        } catch (err) {
            // Erreur déjà gérée
        }
    };

    return (
        <form onSubmit={handleSubmit} className="w-full max-w-sm  p-6 mb-2">

            {error && (
                <div className="text-red-500 text-sm mb-4 text-center">
                    {error}
                </div>
            )}

            <div className="mb-4">
                <label htmlFor="identifier" className="block mb-1 text-sm font-medium">Email ou nom d'utilisateur</label>
                <input
                    id="identifier"
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
            </div>

            <div className="mb-6">
                <label htmlFor="password" className="block mb-1 text-sm font-medium">Mot de passe</label>
                <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
            </div>

            <button
                type="submit"
                disabled={loading}
                className="py-3 px-6 bg-black text-white font-semibold rounded-full text-center transition hover:bg-gray-800 w-full cursor-pointer"
            >
                {loading ? 'Connexion en cours...' : 'Se connecter'}
            </button>
        </form>
    );
}