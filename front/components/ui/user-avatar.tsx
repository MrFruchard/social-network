import * as React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

export interface UserAvatarProps {
  user: {
    id?: string;
    username?: string;
    firstname?: string;
    lastname?: string;
    image?: string;
    avatar?: string;
    image_profile_url?: string;
  };
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  fallbackClassName?: string;
  showOnlineStatus?: boolean;
  isOnline?: boolean;
}

const sizeClasses = {
  xs: 'h-6 w-6 text-xs',
  sm: 'h-8 w-8 text-xs', 
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-16 w-16 text-lg'
};

const onlineIndicatorSizes = {
  xs: 'h-1.5 w-1.5',
  sm: 'h-2 w-2',
  md: 'h-2.5 w-2.5', 
  lg: 'h-3 w-3',
  xl: 'h-4 w-4'
};

function getInitials(user: UserAvatarProps['user']): string {
  if (user.firstname && user.lastname) {
    return `${user.firstname.charAt(0)}${user.lastname.charAt(0)}`.toUpperCase();
  }
  
  if (user.username) {
    return user.username.substring(0, 2).toUpperCase();
  }
  
  return 'U';
}

function getAvatarUrl(user: UserAvatarProps['user']): string | undefined {
  const imageKey = user.image || user.avatar || user.image_profile_url;
  
  if (!imageKey) return undefined;
  
  // Si c'est déjà une URL complète (blob: ou http:)
  if (imageKey.startsWith('blob:') || imageKey.startsWith('http')) {
    return imageKey;
  }
  
  // Construire l'URL de l'API
  return `http://localhost:80/api/avatars/${imageKey}`;
}

const UserAvatar = React.forwardRef<
  React.ElementRef<typeof Avatar>,
  UserAvatarProps
>(({ 
  user, 
  size = 'md', 
  className, 
  fallbackClassName, 
  showOnlineStatus = false,
  isOnline = false,
  ...props 
}, ref) => {
  const avatarUrl = getAvatarUrl(user);
  const initials = getInitials(user);
  const displayName = user.username || user.firstname || 'Utilisateur';

  return (
    <div className="relative inline-block">
      <Avatar
        ref={ref}
        className={cn(sizeClasses[size], className)}
        {...props}
      >
        <AvatarImage 
          src={avatarUrl} 
          alt={`Photo de profil de ${displayName}`}
        />
        <AvatarFallback 
          className={cn(
            'bg-muted font-medium',
            fallbackClassName
          )}
        >
          {initials}
        </AvatarFallback>
      </Avatar>
      
      {showOnlineStatus && (
        <div 
          className={cn(
            'absolute -bottom-0.5 -right-0.5 rounded-full ring-2 ring-background',
            onlineIndicatorSizes[size],
            isOnline ? 'bg-green-500' : 'bg-gray-400'
          )}
        />
      )}
    </div>
  );
});

UserAvatar.displayName = 'UserAvatar';

export { UserAvatar };