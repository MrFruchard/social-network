"use client";

import React, { createContext, useContext, useEffect, useRef, useState } from "react";

type WebSocketContextType = {
    isConnected: boolean;
    sendMessage: (data: any) => void;
    messages: any[];
};

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
    const [isConnected, setIsConnected] = useState(false);
    const [messages, setMessages] = useState<any[]>([]);
    const wsRef = useRef<WebSocket | null>(null);

    const connectWebSocket = () => {
        if (wsRef.current && (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)) {
            return;
        }

        const ws = new WebSocket("ws://localhost:80/api/ws");
        wsRef.current = ws;

        ws.onopen = () => {
            console.log("WebSocket connecté");
            setIsConnected(true);
        };

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                setMessages((prev) => [...prev, data]);
                // Tu peux ajouter une logique de gestion des notifications ici
            } catch (error) {
                console.error("Erreur de parsing des données WebSocket:", error);
            }
        };

        ws.onclose = () => {
            console.log("WebSocket déconnecté");
            setIsConnected(false);
        };

        ws.onerror = (error) => {
            console.error("Erreur WebSocket:", error);
            setIsConnected(false);
        };
    };

    const disconnectWebSocket = () => {
        if (wsRef.current) {
            wsRef.current.close();
            wsRef.current = null;
            setIsConnected(false);
        }
    };

    const sendMessage = (data: any) => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify(data));
        } else {
            console.error("WebSocket non connecté");
        }
    };

    // Nettoyer à la fermeture du composant
    useEffect(() => {
        return () => {
            disconnectWebSocket();
        };
    }, []);

    return (
        <WebSocketContext.Provider
            value={{
                isConnected,
                sendMessage,
                messages
            }}
        >
            <WebSocketControls
                connect={connectWebSocket}
                disconnect={disconnectWebSocket}
            />
            {children}
        </WebSocketContext.Provider>
    );
}

// Composant caché qui s'abonne aux événements de connexion/déconnexion
function WebSocketControls({
                               connect,
                               disconnect
                           }: {
    connect: () => void;
    disconnect: () => void
}) {
    useEffect(() => {
        // Vérifier si l'utilisateur est connecté (via localStorage ou cookie)
        const checkUserStatus = () => {
            const isLoggedIn = localStorage.getItem("userId") !== null;
            if (isLoggedIn) {
                connect();
            } else {
                disconnect();
            }
        };

        // Vérifier à l'initialisation
        checkUserStatus();

        // Écouter les événements de changement d'état de connexion
        window.addEventListener("login", connect);
        window.addEventListener("logout", disconnect);

        return () => {
            window.removeEventListener("login", connect);
            window.removeEventListener("logout", disconnect);
        };
    }, [connect, disconnect]);

    return null;
}

// Hook personnalisé pour utiliser le contexte WebSocket
export function useWebSocket() {
    const context = useContext(WebSocketContext);
    if (context === undefined) {
        throw new Error("useWebSocket doit être utilisé à l'intérieur d'un WebSocketProvider");
    }
    return context;
}