"use client"

import { useWebSocket } from "@/contexts/websocket-context";

export function NotificationIndicator() {
    const { isConnected, messages } = useWebSocket();

    return (
        <div>
            {isConnected ? (
                <span className="text-green-500">●</span>
            ) : (
                <span className="text-red-500">●</span>
            )}
            <span className="ml-2">Notifications: {messages.length}</span>
        </div>
    );
}