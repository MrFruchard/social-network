import {useEffect, useState} from "react";
import {useRouter} from "next/navigation";

export default function CheckAuth() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Vérification de l'authentification
        fetch('http://localhost:80/api/checkAuth', {
            credentials: 'include', // Important pour envoyer les cookies
        })
            .then(res => {
                if (res.ok) {
                    return res.json();
                }
                // Si la réponse n'est pas ok, l'utilisateur n'est pas authentifié
                throw new Error('Not authenticated');
            })
            .then(data => {
                console.log("Authentication successful:", data);
                setIsAuthenticated(true);
                setIsLoading(false);
            })
            .catch(error => {
                console.error("Authentication error:", error);
                setIsAuthenticated(false);
                setIsLoading(false);
                // Rediriger vers la page de connexion
                router.push('/');
            });
    }, [router]);
    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (!isAuthenticated) {
        return null; // Ne rien afficher si l'utilisateur n'est pas authentifié (sera redirigé)
    }
}