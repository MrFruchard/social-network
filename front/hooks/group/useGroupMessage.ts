import { useState, useEffect, useCallback } from 'react';
import { useWebSocket } from '@/contexts/websocket-context';
import { GroupMessage, GroupMessageState, SendGroupMessageParams } from '@/types/group-messages';

export function useGroupMessages(groupId: string) {
    const [state, setState] = useState<GroupMessageState>({
        messages: [],
        loading: false,
        error: null,
    });

    const { messages: wsMessages, sendMessage } = useWebSocket();

    // Charger les messages du groupe
    const fetchMessages = useCallback(async () => {
        if (!groupId) return;

        setState(prev => ({ ...prev, loading: true }));
        try {
            const response = await fetch(`/api/group/message?groupID=${groupId}`, {
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error('Failed to fetch group messages');
            }

            const data = await response.json();
            const messages = Array.isArray(data) ? data : [];

            setState(prev => ({
                ...prev,
                messages,
                error: null,
            }));
        } catch (error) {
            setState(prev => ({
                ...prev,
                error: error instanceof Error ? error.message : 'Error fetching messages',
            }));
        } finally {
            setState(prev => ({ ...prev, loading: false }));
        }
    }, [groupId]);

    // Envoyer un message au groupe
    const sendGroupMessage = useCallback(async ({ groupId, content, imageFile }: SendGroupMessageParams) => {
        try {
            const formData = new FormData();
            formData.append('groupID', groupId);

            if (imageFile) {
                formData.append('image', imageFile);
            } else if (content) {
                formData.append('content', content);
            } else {
                throw new Error('Content or image is required');
            }

            const response = await fetch('/api/group/message', {
                method: 'POST',
                body: formData,
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error('Failed to send message');
            }

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Error sending group message:', error);
            throw error;
        }
    }, []);

    // Écouter les nouveaux messages WebSocket
    useEffect(() => {
        const newGroupMessages = wsMessages.filter(
            msg => msg.type === 'group_message' && msg.conversationId === groupId
        );

        if (newGroupMessages.length > 0) {
            const latestMessage = newGroupMessages[newGroupMessages.length - 1];

            // Convertir le message WebSocket en GroupMessage
            const groupMessage: GroupMessage = {
                id: latestMessage.id,
                group_id: groupId,
                sender_id: latestMessage.senderId || '',
                content: latestMessage.content,
                type: latestMessage.imageFile ? 1 : 0,
                created_at: new Date().toISOString(),
                sender: {
                    id: latestMessage.senderId || '',
                    username: 'unknown',
                    firstname: 'User',
                    lastname: '',
                }
            };

            setState(prev => ({
                ...prev,
                messages: [...prev.messages, groupMessage],
            }));
        }
    }, [wsMessages, groupId]);

    // Charger les messages au montage
    useEffect(() => {
        fetchMessages();
    }, [fetchMessages]);

    return {
        ...state,
        sendGroupMessage,
        refreshMessages: fetchMessages,
    };
}