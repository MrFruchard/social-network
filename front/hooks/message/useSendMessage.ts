import { useState } from 'react';
import { sendMessage } from '@/api/message/sendMessage';

export function useSendMessage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<null | string>(null);

  // Ajoute receiverId et imageFile si besoin
  const send = async ({ content, conversationId, receiverId, imageFile }: { content: string; conversationId: string; receiverId?: string; imageFile?: File }) => {
    setLoading(true);
    setError(null);
    try {
      const response = await sendMessage(receiverId, content, imageFile, conversationId);
      setLoading(false);
      return response;
    } catch (err: any) {
      setError(err?.message || "Erreur lors de l'envoi du message");
      setLoading(false);
      return null;
    }
  };

  return { send, loading, error };
}
