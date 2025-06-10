'use client';

import { ReactNode } from 'react';
import { X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

// Types communs pour les posts
export interface PostCommon {
  id: string | number;
  content: string;
  image_content_url?: string;
  created_at: string;
}

export interface PostUser {
  user_id?: string;
  userId?: string;
  first_name?: string;
  last_name?: string;
  username?: string;
  image_profile_url?: string;
}

export interface PostEngagement {
  liked?: boolean;
  disliked?: boolean;
  like_count?: number;
  dislike_count?: number;
  comment_count?: number;
}

export interface Post extends PostCommon, PostUser, PostEngagement {
  tags?: string[] | string;
  is_private?: boolean;
  group_id?: any;
  comment?: Comment[];
}

export interface Comment extends PostCommon {
  post_id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  username: string;
  image_profile: string;
  liked: boolean;
  disliked: boolean;
  like_count: number;
  dislike_count: number;
  is_temp?: boolean;
  error?: boolean;
}

// Props pour le composant PostContainer
export interface PostContainerProps {
  title?: string;
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  fullWidth?: boolean;
}

/**
 * Composant conteneur pour les modales de post
 * Utilisé à la fois pour la création et l'affichage de posts
 */
export function PostContainer({ 
  title, 
  isOpen, 
  onClose, 
  children,
  fullWidth = false
}: PostContainerProps) {
  // Si le composant est utilisé directement dans le DOM (pas dans Dialog)
  if (!isOpen) {
    return null;
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className={`${fullWidth ? 'sm:max-w-2xl' : 'sm:max-w-md'} max-h-[90vh] overflow-y-auto`}>
        <DialogHeader className="flex justify-between items-center">
          <DialogTitle className="text-center flex-grow">{title || 'Post'}</DialogTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        
        {children}
      </DialogContent>
    </Dialog>
  );
}

/**
 * Utilitaire pour calculer le temps écoulé depuis une date 
 * (utilisé dans les deux composants)
 */
export function timeAgo(dateString: string): string {
  const now = new Date();
  const past = new Date(dateString);
  const diffMs = now.getTime() - past.getTime();
  const diffSec = Math.round(diffMs / 1000);
  const diffMin = Math.round(diffSec / 60);
  const diffHour = Math.round(diffMin / 60);
  const diffDay = Math.round(diffHour / 24);

  if (diffSec < 60) {
    return `${diffSec}s`;
  } else if (diffMin < 60) {
    return `${diffMin}m`;
  } else if (diffHour < 24) {
    return `${diffHour}h`;
  } else if (diffDay < 30) {
    return `${diffDay}j`;
  } else {
    return past.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
    });
  }
}

/**
 * Utilitaire pour extraire les tags d'un contenu de post
 */
export function extractTags(content: string): string[] {
  return content.match(/#[\w]+/g)?.map(tag => tag.slice(1)) || [];
}

/**
 * Utilitaire pour formater les URL d'image
 */
export function formatImageUrl(imageUrl: string, type: 'comment' | 'post' | 'avatar' = 'post'): string {
  if (!imageUrl) return '';
  
  if (imageUrl.startsWith('http')) {
    return imageUrl;
  }
  
  const basePath = 'http://localhost:80/api';
  
  switch (type) {
    case 'comment':
      return `${basePath}/commentImages/${imageUrl}`;
    case 'avatar':
      return `${basePath}/avatars/${imageUrl}`;
    case 'post':
    default:
      return `${basePath}/postImages/${imageUrl}`;
  }
}