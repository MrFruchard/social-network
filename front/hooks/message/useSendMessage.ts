import { useState } from 'react';
import { sendMessage } from '@/api/message/sendMessage';

export function useSendMessage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<null | string>(null);

  const send = async (messageData: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await sendMessage(messageData);
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
