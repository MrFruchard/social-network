// components/ui/chat-card.tsx
'use client';

import { SmilePlus, Check, CheckCheck, MoreHorizontal, Send } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useEffect, useRef, useState } from 'react';
import { useSendMessage } from '@/hooks/message/useSendMessage';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AIInputWithFile } from '@/components/ui/ai-input-with-file';

export interface Message {
  id: string;
  content: string;
  imageUrl?: string;
  sender: {
    name: string;
    avatar: string;
    isOnline: boolean;
    isCurrentUser?: boolean;
  };
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
  reactions?: Array<{
    emoji: string;
    count: number;
    reacted: boolean;
  }>;
}

interface ChatCardProps {
  chatName?: string;
  membersCount?: number;
  initialMessages?: Message[];
  currentUser?: {
    name: string;
    avatar: string;
  };
  onSendMessage?: (message: string, imageFile?: File) => void;
  onReaction?: (messageId: string, emoji: string) => void;
  onMoreClick?: () => void;
  className?: string;
  theme?: 'light' | 'dark';
}

export function ChatCard({
  chatName = 'Team Chat',
  membersCount = 3,
  initialMessages = [],
  currentUser = {
    name: 'You',
    avatar: 'https://ferf1mheo22r9ira.public.blob.vercel-storage.com/avatar-03-n0x8HFv8EUetf9z6ht0wScJKoTHqf8.png',
  },
  onSendMessage,
  onReaction,
  onMoreClick,
  className,
  theme = 'dark',
}: ChatCardProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [hasLocalMessage, setHasLocalMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!hasLocalMessage) {
      setMessages(initialMessages);
    }
  }, [initialMessages]);

  const [inputValue, setInputValue] = useState('');
  const [imageFile, setImageFile] = useState<File | undefined>(undefined);
  const [fileInputKey, setFileInputKey] = useState(Date.now());

  const handleSendMessage = () => {
    // Autorise l'envoi si texte OU image
    if (!inputValue.trim() && !imageFile) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: {
        name: currentUser.name,
        avatar: currentUser.avatar,
        isOnline: true,
        isCurrentUser: true,
      },
      timestamp: new Date().toLocaleTimeString([], {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }),
      status: 'sent',
      imageUrl: imageFile ? URL.createObjectURL(imageFile) : undefined,
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputValue('');
    onSendMessage?.(inputValue, imageFile);
    setImageFile(undefined);
    setFileInputKey(Date.now());

    setTimeout(() => {
      setMessages((prev) => prev.map((msg) => (msg.id === newMessage.id ? { ...msg, status: 'delivered' } : msg)));
    }, 1000);

    setTimeout(() => {
      setMessages((prev) => prev.map((msg) => (msg.id === newMessage.id ? { ...msg, status: 'read' } : msg)));
    }, 2000);
  };

  const isLightTheme = theme === 'light';

  return (
    <div
      className={cn(
        'w-full h-full flex flex-col overflow-hidden', // retiré 'rounded-2xl'
        isLightTheme ? 'bg-white text-zinc-900 border border-zinc-200' : 'bg-zinc-900 text-zinc-100',
        className
      )}
    >
      {' '}
      <div className='flex flex-col flex-1 min-h-0'>
        {' '}
        {/* Header */}
        <div className={cn('px-4 py-3 flex items-center justify-between border-b', isLightTheme ? 'border-zinc-200' : 'border-zinc-800')}>
          <div className='flex items-center gap-3'>
            <div className='relative'>
              <div className='w-10 h-10 rounded-full bg-violet-500 flex items-center justify-center text-lg font-medium text-white'>{chatName.charAt(0).toLocaleUpperCase()}</div>
              <div className={cn('absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 ring-2', isLightTheme ? 'ring-white' : 'ring-zinc-900')} />
            </div>
            <div>
              <h3 className={cn('font-medium', isLightTheme ? 'text-zinc-900' : 'text-zinc-100')}>{chatName}</h3>
              <p className={cn('text-sm', isLightTheme ? 'text-zinc-500' : 'text-zinc-400')}>{membersCount > 1 ? `${membersCount} membres` : ''}</p>{' '}
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button type='button' className={cn('p-2 rounded-full', isLightTheme ? 'hover:bg-zinc-100 text-zinc-500' : 'hover:bg-zinc-800 text-zinc-400', 'focus:outline-none focus:ring-0')}>
                <MoreHorizontal className='w-5 h-5' />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuLabel>Options</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onMoreClick}>{membersCount > 1 ? 'Voir les membres' : 'Voir le profil'}</DropdownMenuItem>
              <DropdownMenuItem>Ajouter aux favoris</DropdownMenuItem>
              {membersCount > 1 && (
                <DropdownMenuItem
                  onClick={() => {
                    /* ouvrir modale rename ici */
                  }}
                >
                  Renommer le groupe
                </DropdownMenuItem>
              )}
              <DropdownMenuItem className='text-red-500'>Supprimer la conversation</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {/* Messages */}
        <div className='flex-1 overflow-y-auto p-4 space-y-4 min-h-0'>
          {messages.map((message, idx) => {
            const isCurrentUser = message.sender.isCurrentUser;
            const isLast = idx === messages.length - 1 && isCurrentUser;
            return (
              <div key={message.id} className={cn('flex items-end', isCurrentUser ? 'justify-end' : 'justify-start', isLast ? 'animate-pop' : '')}>
                <div className={cn('max-w-xs break-words px-4 py-2', isCurrentUser ? 'bg-blue-500 text-white rounded-2xl rounded-br-md' : 'bg-zinc-200 text-zinc-900 rounded-2xl rounded-bl-md')} style={{ minWidth: '40px' }}>
                  {membersCount > 2 ? (
                    <>
                      <div className='flex items-center gap-2 mb-1'>
                        <span className={cn('font-medium', isCurrentUser ? 'text-white' : 'text-zinc-900')}>{message.sender.name}</span>
                        <span className={cn('text-sm', isCurrentUser ? 'text-blue-200' : 'text-zinc-500')}>{message.timestamp}</span>
                      </div>
                      <div>{message.content}</div>
                    </>
                  ) : (
                    <span>
                      {message.content}
                      <span className={cn('ml-2 text-xs align-middle', isCurrentUser ? 'text-blue-200' : 'text-zinc-500')}>{message.timestamp}</span>
                    </span>
                  )}
                  {message.imageUrl && <img src={message.imageUrl.startsWith('blob:') ? message.imageUrl : `http://localhost:80/${message.content}`} alt='Image envoyée' className='max-w-xs max-h-60 rounded-lg mt-2' style={{ objectFit: 'cover' }} />}
                </div>
                {}
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
        {/* Input  */}
        <div className={cn('p-0', isLightTheme ? 'bg-white' : 'bg-zinc-900')}>
          {' '}
          <div className='flex items-center gap-2'>
            <div className='relative flex-1 flex flex-col'>
              <AIInputWithFile
                key={fileInputKey}
                placeholder='Écris un message ou ajoute une image'
                onSubmit={(message, file) => {
                  if (onSendMessage) onSendMessage(message, file);
                  setFileInputKey(Date.now());
                }}
                imageFile={imageFile}
                setImageFile={setImageFile}
                className='w-full'
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
