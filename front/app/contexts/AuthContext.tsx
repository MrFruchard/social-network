// front/app/contexts/AuthContext.tsx
"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { loginUser, logoutUser } from "@/app/lib/auth";

type AuthContextType = {
    user: any | null;
    isAuthenticated: boolean;
    loading: boolean;
    login: (credentials: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    error: string | null;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Vérifier si l'utilisateur est déjà connecté
        // Cette fonction pourrait être implémentée plus tard
        setLoading(false);
    }, []);

    const login = async (credentials: string, password: string) => {
        try {
            setError(null);
            setLoading(true);
            const data = await loginUser(credentials, password);
            setUser({ isLoggedIn: true }); // À adapter selon la réponse de votre API

            // Connexion WebSocket après login réussi
            const ws = new WebSocket("ws://localhost:80/api/ws");

            ws.onopen = () => {
                console.log("✅ WebSocket connection opened");
            };

            ws.onerror = (error) => {
                console.error("❌ WebSocket error:", error);
            };

            ws.onclose = (event) => {
                console.warn("⚠️ WebSocket closed:", event);
            };

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            await logoutUser();
            setUser(null);
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                loading,
                login,
                logout,
                error
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}