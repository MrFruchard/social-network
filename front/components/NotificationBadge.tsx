'use client';

import { useNotifications } from '@/hooks/utils/useNotifications';

interface NotificationBadgeProps {
  children: React.ReactNode;
  className?: string;
}

export function NotificationBadge({ children, className = '' }: NotificationBadgeProps) {
  const { unreadCount } = useNotifications();

  return (
    <div className={`relative ${className}`}>
      {children}
      {unreadCount > 0 && (
        <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center font-medium">
          {unreadCount > 99 ? '99+' : unreadCount}
        </div>
      )}
    </div>
  );
}