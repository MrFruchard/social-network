'use client';

import { useState } from 'react';
import { Post, Comment, timeAgo } from './PostContainer';
import { createComment } from '@/api/post/commentApi';
import { useUserData } from '@/hooks/user/useUserData';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageCircle, ThumbsUp, ThumbsDown } from 'lucide-react';
import { useAutoResizeTextarea } from '@/components/hooks/use-auto-resize-textarea';
import { ImageUpload, useImageUpload } from './ImageUpload';

interface CommentSectionProps {
  post: Post;
  onCommentAction?: () => void;
}

/**
 * Composant pour afficher et gérer les commentaires d'un post
 */
export function CommentSection({ post, onCommentAction }: CommentSectionProps) {
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [commentLoading, setCommentLoading] = useState(false);
  
  const { userData } = useUserData();
  const { textareaRef } = useAutoResizeTextarea(newComment);
  const { selectedFile, previewUrl, handleImageChange, resetImage } = useImageUpload();

  // Publier un nouveau commentaire
  const handleCreateComment = async () => {
    // Éviter les soumissions multiples ou vides
    if (isSubmitting || (!newComment.trim() && !selectedFile) || !post) return;
    
    // Marquer comme en cours de soumission
    setIsSubmitting(true);
    setCommentLoading(true);
    
    try {
      // Préparer les données du formulaire
      const formData = new FormData();
      formData.append('content', newComment);
      if (selectedFile) {
        formData.append('image', selectedFile);
      }
      
      // Utiliser l'ID du post
      const postIdStr = post.id.toString();
      
      // Créer un commentaire temporaire pour l'UX
      const tempId = `temp-${Date.now()}`;
      const tempComment = {
        id: tempId,
        post_id: post.id.toString(),
        user_id: userData?.id || "current_user",
        first_name: userData?.firstname || "Vous",
        last_name: userData?.lastname || "",
        username: userData?.username || "vous",
        image_profile: userData?.profilePic || "",
        content: newComment,
        image_content_url: previewUrl || "",
        liked: false,
        disliked: false,
        like_count: 0,
        dislike_count: 0,
        created_at: new Date().toISOString(),
        is_temp: true
      };
      
      // Ajouter temporairement le commentaire à l'UI
      const updatedPost = {
        ...post,
        comment: post.comment ? [...post.comment, tempComment] : [tempComment],
        comment_count: (post.comment_count || 0) + 1,
      };
      
      // Réinitialiser le formulaire
      setNewComment('');
      resetImage();
      
      try {
        // Envoyer le commentaire au serveur
        const result = await createComment(postIdStr, formData);
        
        // Si on a un résultat, déclencher le callback
        if (result && onCommentAction) {
          // Pour les posts d'autres utilisateurs, attendre un peu plus longtemps
          const isOtherUserPost = post.user_id && post.user_id !== userData?.id;
          if (isOtherUserPost) {
            await new Promise(resolve => setTimeout(resolve, 500));
          }
          
          onCommentAction();
        }
      } catch (error) {
        console.error('Erreur lors de la création du commentaire:', error);
        alert("Erreur lors de l'envoi du commentaire. Veuillez réessayer.");
      }
    } finally {
      setIsSubmitting(false);
      setCommentLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Zone de commentaire */}
      <div className="pb-4 border-b">
        <div className="flex gap-3">
          <Avatar className="h-10 w-10">
            {userData?.profilePic ? (
              <AvatarImage 
                src={`http://localhost:80/api/avatars/${userData.profilePic}`}
                alt={userData.username}
              />
            ) : (
              <AvatarFallback>
                {userData?.firstname?.charAt(0) || ''}
                {userData?.lastname?.charAt(0) || ''}
              </AvatarFallback>
            )}
          </Avatar>
          
          <div className="flex-1">
            <Textarea
              ref={textareaRef}
              placeholder="Écrivez votre commentaire..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="resize-none min-h-[60px] border-0 focus-visible:ring-0 px-0 py-2"
            />
            
            {/* Composant d'upload d'image */}
            <ImageUpload
              onImageChange={handleImageChange}
              previewUrl={previewUrl}
            />
            
            <div className="flex justify-end mt-3">
              <Button 
                onClick={handleCreateComment} 
                disabled={(!newComment.trim() && !selectedFile) || commentLoading || isSubmitting}
                className="rounded-full px-4"
              >
                {commentLoading ? (
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                ) : (
                  "Répondre"
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Liste des commentaires */}
      <div className="space-y-4">
        {post.comment && post.comment.length > 0 ? (
          post.comment.map((comment: Comment) => (
            <div key={comment.id} className="flex gap-3 py-3">
              <Avatar className="h-10 w-10">
                {comment.image_profile ? (
                  <AvatarImage 
                    src={`http://localhost:80/api/avatars/${comment.image_profile}`}
                    alt={`${comment.first_name} ${comment.last_name}`}
                  />
                ) : (
                  <AvatarFallback>
                    {comment.first_name?.charAt(0)}{comment.last_name?.charAt(0)}
                  </AvatarFallback>
                )}
              </Avatar>
              
              <div className="flex-1">
                <div className="flex items-center gap-1">
                  <span className="font-bold">
                    {comment.first_name} {comment.last_name}
                  </span>
                  <span className="text-muted-foreground">
                    @{comment.username} · {timeAgo(comment.created_at)}
                  </span>
                </div>
                
                <p className="mt-1 whitespace-pre-line">{comment.content}</p>
                
                {comment.image_content_url && (
                  <div className="mt-2 rounded-lg overflow-hidden">
                    <img 
                      src={comment.image_content_url} 
                      alt="Comment content" 
                      className="max-h-60 w-auto"
                    />
                  </div>
                )}
                
                <div className="flex gap-6 mt-2 text-muted-foreground">
                  <Button variant="ghost" size="sm" className="p-0 h-auto hover:text-primary">
                    <MessageCircle size={16} />
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className={`p-0 h-auto ${comment.liked ? 'text-green-500' : 'hover:text-green-500'}`}
                  >
                    <ThumbsUp size={16} className={comment.liked ? 'fill-green-500' : ''} />
                    <span className="ml-1 text-xs">{comment.like_count}</span>
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className={`p-0 h-auto ${comment.disliked ? 'text-red-500' : 'hover:text-red-500'}`}
                  >
                    <ThumbsDown size={16} className={comment.disliked ? 'fill-red-500' : ''} />
                    <span className="ml-1 text-xs">{comment.dislike_count}</span>
                  </Button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="py-4 text-center text-muted-foreground">
            Aucun commentaire pour le moment
          </div>
        )}
      </div>
    </div>
  );
}