// hooks/use-auth.ts
"use client";

import { useState, useEffect, createContext, useContext } from 'react';

// Définissez le type User selon votre API
type User = {
    id: string;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    // autres champs...
};

type AuthContextType = {
    user: User | null;
    loading: boolean;
    error: string | null;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    checkAuth: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Vérifier l'état d'authentification au chargement
    useEffect(() => {
        checkAuth();
    }, []);

    async function checkAuth() {
        try {
            setLoading(true);
            const response = await fetch('https://api-sn.mtliche.com/me', {
                method: 'GET',
                credentials: 'include', // Important pour les cookies
            });

            if (response.ok) {
                const userData = await response.json();
                setUser(userData);
            } else {
                setUser(null);
            }
        } catch (error) {
            console.error('Erreur de vérification d\'authentification:', error);
            setUser(null);
        } finally {
            setLoading(false);
        }
    }

    async function login(email: string, password: string) {
        setLoading(true);
        setError(null);

        try {
            const myHeaders = new Headers();
            myHeaders.append("Content-Type", "application/json");

            const raw = JSON.stringify({
                "credentials": email,
                "password": password
            });

            const requestOptions = {
                method: 'POST',
                headers: myHeaders,
                body: raw,
                credentials: 'include' as RequestCredentials
            };

            const response = await fetch("https://api-sn.mtliche.com/login", requestOptions);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Échec de la connexion');
            }

            // Récupérer les informations de l'utilisateur après connexion
            await checkAuth();
        } catch (error) {
            console.error('Erreur de connexion:', error);
            setError(error instanceof Error ? error.message : 'Une erreur est survenue');
            throw error;
        } finally {
            setLoading(false);
        }
    }

    async function logout() {
        setLoading(true);
        try {
            await fetch('https://api-sn.mtliche.com/logout', {
                method: 'POST',
                credentials: 'include',
            });
            setUser(null);
        } catch (error) {
            console.error('Erreur de déconnexion:', error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <AuthContext.Provider value={{ user, loading, error, login, logout, checkAuth }}>
    {children}
    </AuthContext.Provider>
);
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

export default useAuth;