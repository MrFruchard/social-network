import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface LoginCredentials {
  identifier: string; // Peut-être email ou username
  password: string;
}

export function useLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const login = async ({ identifier, password }: LoginCredentials) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("http://localhost:80/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credentials: identifier, password }),
        credentials: "include", // Important pour que les cookies soient stockés
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      const data = await response.json();
      
      // Déclencher l'événement de connexion WebSocket
      window.dispatchEvent(new Event("login"));
      
      // Redirection vers la page d'accueil
      router.push("/home");
      
      return data;
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue lors de la connexion');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { login, loading, error };
}