'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { ImageIcon, FileUp, Figma, MonitorIcon, CircleUserRound, ArrowUpIcon, Paperclip, PlusIcon } from 'lucide-react';

interface UseAutoResizeTextareaProps {
  minHeight: number;
  maxHeight?: number;
}

function useAutoResizeTextarea({ minHeight, maxHeight }: UseAutoResizeTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = useCallback(
    (reset?: boolean) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      if (reset) {
        textarea.style.height = `${minHeight}px`;
        return;
      }

      // Temporarily shrink to get the right scrollHeight
      textarea.style.height = `${minHeight}px`;

      // Calculate new height
      const newHeight = Math.max(minHeight, Math.min(textarea.scrollHeight, maxHeight ?? Number.POSITIVE_INFINITY));

      textarea.style.height = `${newHeight}px`;
    },
    [minHeight, maxHeight]
  );

  useEffect(() => {
    // Set initial height
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = `${minHeight}px`;
    }
  }, [minHeight]);

  // Adjust height on window resize
  useEffect(() => {
    const handleResize = () => adjustHeight();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [adjustHeight]);

  return { textareaRef, adjustHeight };
}

export function VercelV0Chat() {
  const [value, setValue] = useState('');
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: 60,
    maxHeight: 200,
  });

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (value.trim()) {
        setValue('');
        adjustHeight(true);
      }
    }
  };

  return (
    <div className='flex flex-col items-center w-full max-w-4xl mx-auto p-4 space-y-8'>
      <h1 className='text-4xl font-bold text-black'>What can I help you ship?</h1>

      <div className='w-full'>
        <div className='relative bg-white rounded-xl border border-gray-200'>
          <div className='overflow-y-auto'>
            <Textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                adjustHeight();
              }}
              onKeyDown={handleKeyDown}
              placeholder='Ask v0 a question...'
              className={cn('w-full px-4 py-3', 'resize-none', 'bg-transparent', 'border-none', 'text-gray-900 text-sm', 'focus:outline-none', 'focus-visible:ring-0 focus-visible:ring-offset-0', 'placeholder:text-gray-500 placeholder:text-sm', 'min-h-[60px]')}
              style={{
                overflow: 'hidden',
              }}
            />
          </div>

          <div className='flex items-center justify-between p-3'>
            <div className='flex items-center gap-2'>
              <button type='button' className='group p-2 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-1'>
                <Paperclip className='w-4 h-4 text-gray-700' />
                <span className='text-xs text-gray-600 hidden group-hover:inline transition-opacity'>Attach</span>
              </button>
            </div>
            <div className='flex items-center gap-2'>
              <button type='button' className='px-2 py-1 rounded-lg text-sm text-gray-600 transition-colors border border-dashed border-gray-300 hover:border-gray-400 hover:bg-gray-50 flex items-center justify-between gap-1'>
                <PlusIcon className='w-4 h-4' />
                Project
              </button>
              <button type='button' className={cn('px-1.5 py-1.5 rounded-lg text-sm transition-colors border border-gray-300 hover:border-gray-400 hover:bg-gray-50 flex items-center justify-between gap-1', value.trim() ? 'bg-black text-white' : 'text-gray-600')}>
                <ArrowUpIcon className={cn('w-4 h-4', value.trim() ? 'text-white' : 'text-gray-600')} />
                <span className='sr-only'>Send</span>
              </button>
            </div>
          </div>
        </div>

        <div className='flex items-center justify-center gap-3 mt-4'>
          <ActionButton icon={<ImageIcon className='w-4 h-4' />} label='Clone a Screenshot' />
          <ActionButton icon={<Figma className='w-4 h-4' />} label='Import from Figma' />
          <ActionButton icon={<FileUp className='w-4 h-4' />} label='Upload a Project' />
          <ActionButton icon={<MonitorIcon className='w-4 h-4' />} label='Landing Page' />
          <ActionButton icon={<CircleUserRound className='w-4 h-4' />} label='Sign Up Form' />
        </div>
      </div>
    </div>
  );
}

interface ActionButtonProps {
  icon: React.ReactNode;
  label: string;
}

function ActionButton({ icon, label }: ActionButtonProps) {
  return (
    <button type='button' className='flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 rounded-full border border-gray-200 text-gray-600 hover:text-gray-900 transition-colors'>
      {icon}
      <span className='text-xs'>{label}</span>
    </button>
  );
}
