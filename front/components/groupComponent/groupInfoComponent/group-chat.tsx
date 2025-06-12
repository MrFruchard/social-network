import React, { useState, useRef, useEffect } from 'react';
import { useGroupMessages } from "@/hooks/group/useGroupMessage";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Image, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface GroupChatProps {
  groupId: string;
  isAdmin: boolean;
  isMember: boolean;
}

export function GroupChat({ groupId, isAdmin, isMember }: GroupChatProps) {
  const [message, setMessage] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [sending, setSending] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, loading, error, sendGroupMessage, refreshMessages } = useGroupMessages(groupId);

  // Auto-scroll vers le bas
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Gérer l'envoi de message
  const handleSendMessage = async () => {
    if ((!message.trim() && !imageFile) || sending) return;

    setSending(true);
    try {
      await sendGroupMessage({
        groupId,
        content: message.trim() || undefined,
        imageFile: imageFile || undefined,
      });

      setMessage('');
      setImageFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  // Gérer le fichier image
  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
    }
  };

  if (!isMember) {
    return (
        <div className="flex items-center justify-center p-8 text-muted-foreground">
          Vous devez être membre du groupe pour voir les messages
        </div>
    );
  }

  return (
      <div className="flex flex-col h-96 border rounded-lg">
        {/* En-tête */}
        <div className="flex items-center p-4 border-b">
          <h3 className="font-semibold">Chat du groupe</h3>
          {loading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          {error && (
              <div className="text-red-500 text-sm mb-4">
                Erreur: {error}
              </div>
          )}

          <div className="space-y-4">
            {messages.map((msg) => (
                <div key={msg.id} className="flex items-start space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                        src={msg.sender.profilePic ? `/api/avatars/${msg.sender.profilePic}` : undefined}
                        alt={msg.sender.username}
                    />
                    <AvatarFallback>
                      {msg.sender.firstname?.[0]}{msg.sender.lastname?.[0]}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                  <span className="font-medium text-sm">
                    {msg.sender.firstname} {msg.sender.lastname}
                  </span>
                      <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(msg.created_at), {
                      addSuffix: true,
                      locale: fr
                    })}
                  </span>
                    </div>

                    {msg.type === 1 ? (
                        <img
                            src={`/api/messageImages/${msg.content}`}
                            alt="Message image"
                            className="mt-1 max-w-xs rounded-lg"
                        />
                    ) : (
                        <p className="mt-1 text-sm">{msg.content}</p>
                    )}
                  </div>
                </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Zone de saisie */}
        <div className="p-4 border-t">
          {imageFile && (
              <div className="mb-2 p-2 bg-muted rounded-lg flex items-center justify-between">
                <span className="text-sm">Image: {imageFile.name}</span>
                <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setImageFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                >
                  ×
                </Button>
              </div>
          )}

          <div className="flex space-x-2">
            <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tapez votre message..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                disabled={sending}
            />

            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
            />

            <Button
                size="icon"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={sending}
            >
              <Image className="h-4 w-4" />
            </Button>

            <Button
                size="icon"
                onClick={handleSendMessage}
                disabled={sending || (!message.trim() && !imageFile)}
            >
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>
  );
}