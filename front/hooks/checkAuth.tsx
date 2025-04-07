"use client"

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// Options pour personnaliser le comportement du hook
interface UseAuthOptions {
    redirectTo?: string; // URL de redirection si non authentifié
    redirectIfAuthenticated?: string; // URL de redirection si authentifié
    required?: boolean; // Si true, redirige automatiquement si non authentifié
}

export function useAuth(options: UseAuthOptions = {}) {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState(null);
    const router = useRouter();

    const {
        redirectTo = '/',
        redirectIfAuthenticated = null,
        required = false
    } = options;

    useEffect(() => {
        // Vérification de l'authentification
        const checkAuth = async () => {
            try {
                const res = await fetch('http://localhost:80/api/checkAuth', {
                    credentials: 'include',
                });

                if (!res.ok) {
                    throw new Error('Not authenticated');
                }

                const data = await res.json();
                setUser(data);
                setIsAuthenticated(true);

                // Rediriger si l'utilisateur est déjà authentifié et qu'une redirection est spécifiée
                if (redirectIfAuthenticated) {
                    router.push(redirectIfAuthenticated);
                }
            } catch (error) {
                console.error("Authentication error:", error);
                setIsAuthenticated(false);

                // Rediriger si l'authentification est requise
                if (required && redirectTo) {
                    router.push(redirectTo);
                }
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();
    }, [router, redirectTo, redirectIfAuthenticated, required]);

    return { isAuthenticated, isLoading, user };
}