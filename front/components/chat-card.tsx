// components/ui/chat-card.tsx
'use client';

import { SmilePlus, Check, CheckCheck, MoreHorizontal, Send } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { useSendMessage } from '@/hooks/message/useSendMessage';

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

  const handleReaction = (messageId: string, emoji: string) => {
    setMessages((prev) =>
      prev.map((message) => {
        if (message.id === messageId) {
          const existingReaction = message.reactions?.find((r) => r.emoji === emoji);
          const newReactions = message.reactions || [];

          if (existingReaction) {
            return {
              ...message,
              reactions: newReactions.map((r) =>
                r.emoji === emoji
                  ? {
                      ...r,
                      count: r.reacted ? r.count - 1 : r.count + 1,
                      reacted: !r.reacted,
                    }
                  : r
              ),
            };
          } else {
            return {
              ...message,
              reactions: [...newReactions, { emoji, count: 1, reacted: true }],
            };
          }
        }
        return message;
      })
    );
    onReaction?.(messageId, emoji);
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
              <div className='w-10 h-10 rounded-full bg-violet-500 flex items-center justify-center text-lg font-medium text-white'>{chatName.charAt(0)}</div>
              <div className={cn('absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 ring-2', isLightTheme ? 'ring-white' : 'ring-zinc-900')} />
            </div>
            <div>
              <h3 className={cn('font-medium', isLightTheme ? 'text-zinc-900' : 'text-zinc-100')}>{chatName}</h3>
              <p className={cn('text-sm', isLightTheme ? 'text-zinc-500' : 'text-zinc-400')}>{membersCount} members •</p>
            </div>
          </div>
          <button type='button' onClick={onMoreClick} className={cn('p-2 rounded-full', isLightTheme ? 'hover:bg-zinc-100 text-zinc-500' : 'hover:bg-zinc-800 text-zinc-400')}>
            <MoreHorizontal className='w-5 h-5' />
          </button>
        </div>
        {/* Messages */}
        <div className='flex-1 overflow-y-auto p-4 space-y-4 min-h-0'>
          {messages.map((message) => {
            const isCurrentUser = message.sender.isCurrentUser;
            return (
              <div key={message.id} className={cn('flex items-start gap-3', isCurrentUser ? 'justify-end' : 'justify-start')}>
                {!isCurrentUser && <Image src={message.sender.avatar} alt={message.sender.name} width={36} height={36} className='rounded-full' />}
                <div className={cn('flex-1 min-w-0 max-w-xs', isCurrentUser ? 'bg-blue-500 text-white rounded-tl-2xl rounded-bl-2xl rounded-br-md ml-auto' : 'bg-zinc-200 text-zinc-900 rounded-tr-2xl rounded-br-2xl rounded-bl-md mr-auto')} style={{ padding: '12px 16px' }}>
                  <div className='flex items-center gap-2 mb-1'>
                    <span className={cn('font-medium', isCurrentUser ? 'text-white' : 'text-zinc-900')}>{message.sender.name}</span>
                    <span className={cn('text-sm', isCurrentUser ? 'text-blue-200' : 'text-zinc-500')}>{message.timestamp}</span>
                  </div>
                  <p className={cn('break-words', isCurrentUser ? 'text-white' : 'text-zinc-700')}>{message.content}</p>
                  {message.imageUrl && <img src={message.imageUrl.startsWith('blob:') ? message.imageUrl : `http://localhost:80/${message.content}`} alt='Image envoyée' className='max-w-xs max-h-60 rounded-lg mt-2' style={{ objectFit: 'cover' }} />}
                </div>
                {isCurrentUser && (
                  <div className='flex items-center self-end mb-1 ml-2'>
                    {message.status === 'read' && <CheckCheck className='w-4 h-4 text-blue-200' />}
                    {message.status === 'delivered' && <Check className='w-4 h-4 text-blue-200' />}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {/* Input */}
        <div className={cn('p-4', isLightTheme ? 'bg-white' : 'bg-zinc-900')}>
          <div className='flex items-center gap-2'>
            <div className='relative flex-1 flex flex-col'>
              <div className='flex items-center'>
                <label className={cn('mr-2 cursor-pointer', isLightTheme ? 'text-zinc-500' : 'text-zinc-400')}>
                  <input
                    key={fileInputKey}
                    type='file'
                    accept='image/*'
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setImageFile(e.target.files[0]);
                      }
                    }}
                  />
                  <span className='inline-block p-1.5 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700'>
                    <svg className='w-5 h-5' fill='none' stroke='currentColor' strokeWidth={2} viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' d='M15.172 7l-6.586 6.586a2 2 0 002.828 2.828L18 9.828M7 7h.01M21 21H3V3h18v18z' />
                    </svg>
                  </span>
                </label>
                <input
                  type='text'
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder='Write a message...'
                  className={cn('w-full px-4 py-2.5 rounded-lg border-none', 'focus:outline-none focus:ring-1', isLightTheme ? 'bg-zinc-100 text-zinc-900 placeholder-zinc-500 focus:ring-zinc-300' : 'bg-zinc-800 text-zinc-100 placeholder-zinc-500 focus:ring-zinc-600')}
                />
                <button type='button' className={cn('absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full', isLightTheme ? 'hover:bg-zinc-200 text-zinc-500' : 'hover:bg-zinc-700 text-zinc-400')}>
                  <SmilePlus className='w-5 h-5' />
                </button>
              </div>
              {/* Affichage du nom de l'image sélectionnée */}
              {imageFile && (
                <div className='mt-2 text-sm text-blue-500 flex items-center gap-2'>
                  <span>📎 {imageFile.name}</span>
                  <button
                    type='button'
                    onClick={() => {
                      setImageFile(undefined);
                      setInputValue('');
                      setFileInputKey(Date.now()); // force le reset de l'input file
                    }}
                    className='ml-2 text-xs text-red-500 hover:underline'
                  >
                    Retirer
                  </button>
                </div>
              )}
            </div>
            <button onClick={handleSendMessage} className={cn('p-2.5 rounded-lg transition-colors', isLightTheme ? 'bg-zinc-100 hover:bg-zinc-200 text-zinc-500 hover:text-zinc-600' : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-300')}>
              <Send className='w-5 h-5' />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
