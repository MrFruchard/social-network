"use client";

import { useEffect, useState, useRef } from "react";
import { Send, Users, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useWebSocket } from "@/contexts/websocket-context";
import { useAuth } from "@/hooks/user/checkAuth";
import { showToast } from "@/components/ui/toast";

interface GroupMessage {
  id: string;
  content: string;
  sender_id: string;
  sender_name: string;
  sender_username: string;
  image_url?: string;
  created_at: string;
  group_id: string;
}

interface GroupChatProps {
  groupId: string;
  isAdmin: boolean;
  isMember: boolean;
}

export function GroupChat({ groupId, isAdmin, isMember }: GroupChatProps) {
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { user } = useAuth();
  const { messages: wsMessages, sendMessage: wsSendMessage } = useWebSocket();

  // Fetch initial messages
  const fetchMessages = async () => {
    try {
      const response = await fetch(`http://localhost:80/api/group/message?groupId=${groupId}`, {
        credentials: "include"
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch group messages");
      }
      
      const data = await response.json();
      setMessages(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching group messages:", error);
      setMessages([]);
    }
  };

  useEffect(() => {
    if (isMember) {
      fetchMessages();
    }
  }, [groupId, isMember]);

  // Listen to WebSocket messages
  useEffect(() => {
    const groupMessages = wsMessages.filter(
      msg => msg.type === 'group_message' && msg.conversationId === groupId
    );
    
    groupMessages.forEach(wsMsg => {
      const newMessage: GroupMessage = {
        id: wsMsg.id,
        content: wsMsg.content,
        sender_id: wsMsg.senderId || '',
        sender_name: wsMsg.senderId || '',
        sender_username: wsMsg.senderId || '',
        created_at: wsMsg.timestamp as string || new Date().toISOString(),
        group_id: groupId,
        image_url: wsMsg.imageFile
      };
      
      setMessages(prev => {
        const exists = prev.some(msg => msg.id === newMessage.id);
        if (!exists) {
          return [...prev, newMessage];
        }
        return prev;
      });
    });
  }, [wsMessages, groupId]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() && !imageFile) return;
    if (!user?.id) return;

    setLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('groupId', groupId);
      formData.append('content', newMessage);
      
      if (imageFile) {
        formData.append('image', imageFile);
      }

      const response = await fetch('http://localhost:80/api/group/message', {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      // Clear input
      setNewMessage('');
      setImageFile(null);
      
      // Refresh messages
      await fetchMessages();
      
      showToast('Message envoyé !', 'success');
    } catch (error) {
      console.error('Error sending message:', error);
      showToast('Erreur lors de l\'envoi du message', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        showToast('Le fichier est trop volumineux (max 5MB)', 'error');
        return;
      }
      setImageFile(file);
    }
  };

  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString('fr-FR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch {
      return '';
    }
  };

  if (!isMember) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            Vous devez être membre du groupe pour accéder au chat
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Chat du groupe
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Aucun message dans ce groupe</p>
              <p className="text-sm">Soyez le premier à écrire !</p>
            </div>
          ) : (
            messages.map((message) => (
              <div key={message.id} className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-semibold">
                  {message.sender_username?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm">
                      {message.sender_name || message.sender_username}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatTime(message.created_at)}
                    </span>
                  </div>
                  <div className="text-sm">
                    {message.content}
                  </div>
                  {message.image_url && (
                    <div className="mt-2">
                      <img
                        src={`http://localhost:80/api/groupMessages/${message.image_url}`}
                        alt="Message image"
                        className="max-w-xs rounded-lg"
                      />
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input container */}
        <div className="border-t p-4">
          {imageFile && (
            <div className="mb-2 p-2 bg-muted rounded-lg flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              <span className="text-sm">{imageFile.name}</span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setImageFile(null)}
              >
                ×
              </Button>
            </div>
          )}
          
          <div className="flex gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/*"
              className="hidden"
            />
            
            <Button
              variant="outline"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
            >
              <ImageIcon className="h-4 w-4" />
            </Button>
            
            <div className="flex-1 relative">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Tapez votre message... (Emojis supportés! 😊🎉💬)"
                className="w-full resize-none border rounded-lg p-2 pr-10 min-h-[40px] max-h-32"
                disabled={loading}
              />
            </div>
            
            <Button
              onClick={handleSendMessage}
              disabled={(!newMessage.trim() && !imageFile) || loading}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}