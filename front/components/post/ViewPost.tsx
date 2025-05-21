'use client';

import { useState, useEffect } from 'react';
import { PostContainer, Post, Comment, timeAgo, formatImageUrl } from './PostContainer';
import { CommentSection } from './CommentSection';
import { MessageCircle, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import UserLink from '@/components/UserLink';
import { reactToPost } from '@/api/post/postApi';
import { useRouter } from 'next/navigation';

interface ViewPostProps {
  postId: string | number;
  isOpen: boolean;
  onClose: () => void;
  onPostUpdated?: (updatedPost: Post) => void;
}

/**
 * Composant pour afficher un post existant avec ses commentaires
 * Remplace l'ancien PostDetail avec la même fonctionnalité
 */
export function ViewPost({ postId, isOpen, onClose, onPostUpdated }: ViewPostProps) {
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdateTime, setLastUpdateTime] = useState(0);
  const router = useRouter();

  // Charger les détails du post
  useEffect(() => {
    if (!isOpen || !postId) return;
    
    const fetchPost = async () => {
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:80/api/post?postId=${postId}`, {
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }
        
        const result = await response.json();
        
        // Formatage des URL des images pour les commentaires
        let comments = result.comment || [];
        comments = comments.map((comment: any) => {
          if (comment.image_content_url) {
            return {
              ...comment,
              image_content_url: formatImageUrl(comment.image_content_url, 'comment'),
            };
          }
          return comment;
        });

        setPost({
          ...result,
          comment: comments,
        });
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Une erreur inconnue est survenue');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [isOpen, postId, lastUpdateTime]);

  // Gérer les réactions (like/dislike)
  const handleReaction = async (type: 'liked' | 'disliked') => {
    if (!post) return;
    
    try {
      await reactToPost(post.id, type);
      
      // Mise à jour de l'UI optimiste
      const updatedPost = { ...post };
      
      if (type === 'liked') {
        const newLiked = !post.liked;
        updatedPost.liked = newLiked;
        updatedPost.like_count = (post.like_count || 0) + (newLiked ? 1 : -1);
        
        // Si on like et que le post était déjà disliké, on enlève le dislike
        if (newLiked && post.disliked) {
          updatedPost.disliked = false;
          updatedPost.dislike_count = Math.max(0, (post.dislike_count || 0) - 1);
        }
      } else if (type === 'disliked') {
        const newDisliked = !post.disliked;
        updatedPost.disliked = newDisliked;
        updatedPost.dislike_count = (post.dislike_count || 0) + (newDisliked ? 1 : -1);
        
        // Si on dislike et que le post était déjà liké, on enlève le like
        if (newDisliked && post.liked) {
          updatedPost.liked = false;
          updatedPost.like_count = Math.max(0, (post.like_count || 0) - 1);
        }
      }
      
      // Mettre à jour l'état local
      setPost(updatedPost);
      
      // Notifier le parent 
      if (onPostUpdated) {
        onPostUpdated(updatedPost);
      }
    } catch (error) {
      console.error(`Erreur de réaction (${type}):`, error);
    }
  };

  // Callback quand un commentaire est ajouté ou modifié
  const handleCommentAction = () => {
    // Déclencher un rechargement du post complet
    setLastUpdateTime(Date.now());
  };

  return (
    <PostContainer
      title="Post"
      isOpen={isOpen}
      onClose={onClose}
      fullWidth={true}
    >
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
        </div>
      ) : error ? (
        <div className="p-4 text-red-500 text-center">
          {error}
        </div>
      ) : post ? (
        <div className="space-y-4">
          {/* Post principal */}
          <div className="pb-4 border-b">
            <div className="flex items-start gap-3">
              <Avatar className="h-10 w-10">
                {post.image_profile_url ? (
                  <AvatarImage src={post.image_profile_url} alt={`${post.first_name} ${post.last_name}`} />
                ) : (
                  <AvatarFallback>
                    {post.first_name?.charAt(0)}{post.last_name?.charAt(0)}
                  </AvatarFallback>
                )}
              </Avatar>
              
              <div className="flex-1">
                <div className="flex items-center gap-1">
                  <UserLink 
                    userId={post.user_id || post.userId}
                    username={`${post.first_name} ${post.last_name}`}
                    isPrivate={post.is_private}
                    className="font-bold hover:underline"
                  />
                  <span className="text-muted-foreground ml-1">
                    @{post.username} · {timeAgo(post.created_at)}
                  </span>
                </div>
                
                {post.group_id && post.group_id.id && (
                  <div 
                    className="flex items-center text-muted-foreground text-sm mb-1 cursor-pointer hover:underline"
                    onClick={() => router.push(`/group/${post.group_id.id}`)}
                  >
                    <span>{post.group_id.name}</span>
                  </div>
                )}
                
                <p className="mt-2 whitespace-pre-line text-foreground">{post.content}</p>
                
                {/* Tags du post */}
                {Array.isArray(post.tags) && post.tags.length > 0 && (
                  <div className="mt-1">
                    {post.tags.map((tag: string, index: number) => (
                      <span 
                        key={index} 
                        className="text-primary hover:underline mr-2 cursor-pointer"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                
                {/* Image du post */}
                {post.image_content_url && (
                  <div className="mt-3 rounded-lg overflow-hidden">
                    <img 
                      src={post.image_content_url} 
                      alt="Post content" 
                      className="w-full max-h-96 object-cover"
                    />
                  </div>
                )}
                
                {/* Interactions (commentaires, likes, dislikes) */}
                <div className="flex justify-between mt-4 text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="p-0 h-auto hover:text-primary"
                    >
                      <MessageCircle size={18} />
                      <span className="ml-1 text-sm">{post.comment_count}</span>
                    </Button>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className={`p-0 h-auto ${post.liked ? 'text-green-500' : 'hover:text-green-500'}`}
                      onClick={() => handleReaction('liked')}
                    >
                      <ThumbsUp size={18} className={post.liked ? 'fill-green-500' : ''} />
                      <span className="ml-1 text-sm">{post.like_count}</span>
                    </Button>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className={`p-0 h-auto ${post.disliked ? 'text-red-500' : 'hover:text-red-500'}`}
                      onClick={() => handleReaction('disliked')}
                    >
                      <ThumbsDown size={18} className={post.disliked ? 'fill-red-500' : ''} />
                      <span className="ml-1 text-sm">{post.dislike_count}</span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Section des commentaires */}
          <CommentSection 
            post={post} 
            onCommentAction={handleCommentAction}
          />
        </div>
      ) : null}
    </PostContainer>
  );
}