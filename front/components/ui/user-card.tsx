import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { UserAvatar } from '@/components/ui/user-avatar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export interface User {
  id?: string;
  user_id?: string;
  username?: string;
  firstname?: string;
  lastname?: string;
  email?: string;
  image?: string;
  avatar?: string;
  image_profile_url?: string;
  bio?: string;
  is_private?: boolean;
  follower_count?: number;
  following_count?: number;
}

export interface UserCardProps {
  user: User;
  variant?: 'default' | 'compact' | 'detailed';
  showBio?: boolean;
  showStats?: boolean;
  showActions?: boolean;
  actions?: React.ReactNode;
  className?: string;
  onUserClick?: (user: User) => void;
  clickable?: boolean;
}

const UserCard: React.FC<UserCardProps> = ({
  user,
  variant = 'default',
  showBio = false,
  showStats = false,
  showActions = false,
  actions,
  className,
  onUserClick,
  clickable = true
}) => {
  const userId = user.id || user.user_id;
  const displayName = `${user.firstname || ''} ${user.lastname || ''}`.trim() || user.username;
  const username = user.username;

  const cardContent = (
    <CardContent className={cn(
      'p-4 flex items-center gap-4',
      variant === 'compact' && 'p-3 gap-3',
      variant === 'detailed' && 'p-6 flex-col items-start gap-4'
    )}>
      <UserAvatar
        user={user}
        size={variant === 'compact' ? 'sm' : variant === 'detailed' ? 'lg' : 'md'}
        showOnlineStatus={false}
      />
      
      <div className={cn(
        'flex-1 min-w-0',
        variant === 'detailed' && 'w-full'
      )}>
        <div className={cn(
          'flex items-center justify-between',
          variant === 'detailed' && 'flex-col items-start gap-2'
        )}>
          <div className="min-w-0 flex-1">
            <div className="font-semibold text-sm truncate">
              {displayName}
            </div>
            {username && (
              <div className="text-xs text-muted-foreground truncate">
                @{username}
              </div>
            )}
            {user.is_private && (
              <div className="text-xs text-muted-foreground">
                🔒 Profil privé
              </div>
            )}
          </div>
          
          {showActions && actions && (
            <div className="flex-shrink-0">
              {actions}
            </div>
          )}
        </div>
        
        {showBio && user.bio && variant === 'detailed' && (
          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
            {user.bio}
          </p>
        )}
        
        {showStats && variant === 'detailed' && (
          <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
            {user.follower_count !== undefined && (
              <span>
                <span className="font-semibold text-foreground">{user.follower_count}</span> abonnés
              </span>
            )}
            {user.following_count !== undefined && (
              <span>
                <span className="font-semibold text-foreground">{user.following_count}</span> abonnements
              </span>
            )}
          </div>
        )}
      </div>
    </CardContent>
  );

  const handleClick = () => {
    if (onUserClick) {
      onUserClick(user);
    }
  };

  if (clickable && userId) {
    return (
      <Card 
        className={cn(
          'transition-all hover:shadow-md hover:scale-[1.01] cursor-pointer',
          className
        )}
        onClick={handleClick}
      >
        <Link 
          href={`/profile?id=${userId}`}
          className="block focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-lg"
        >
          {cardContent}
        </Link>
      </Card>
    );
  }

  return (
    <Card className={cn(className)} onClick={onUserClick ? handleClick : undefined}>
      {cardContent}
    </Card>
  );
};

// Composant spécialisé pour les listes d'utilisateurs
export interface UserListProps {
  users: User[];
  variant?: UserCardProps['variant'];
  showBio?: boolean;
  showStats?: boolean;
  showActions?: boolean;
  renderActions?: (user: User) => React.ReactNode;
  className?: string;
  itemClassName?: string;
  onUserClick?: (user: User) => void;
  emptyMessage?: string;
  loading?: boolean;
}

export const UserList: React.FC<UserListProps> = ({
  users,
  variant = 'default',
  showBio = false,
  showStats = false,
  showActions = false,
  renderActions,
  className,
  itemClassName,
  onUserClick,
  emptyMessage = 'Aucun utilisateur trouvé',
  loading = false
}) => {
  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="rounded-full bg-muted h-10 w-10 flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-1/2" />
                <div className="h-3 bg-muted rounded w-1/3" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={cn('space-y-3', className)}>
      {users.map((user) => (
        <UserCard
          key={user.id || user.user_id}
          user={user}
          variant={variant}
          showBio={showBio}
          showStats={showStats}
          showActions={showActions}
          actions={renderActions?.(user)}
          className={itemClassName}
          onUserClick={onUserClick}
        />
      ))}
    </div>
  );
};

export { UserCard };