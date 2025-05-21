'use client';

import { useState, useEffect, FormEvent } from 'react';
import { PostContainer } from './PostContainer';
import { ImageUpload, useImageUpload } from './ImageUpload';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { extractTags } from './PostContainer';
import { useUserData } from '@/hooks/user/useUserData';
import { useAutoResizeTextarea } from '@/components/hooks/use-auto-resize-textarea';

interface Follower {
  user_id: string;
  first_name: string;
  last_name: string;
  username: string;
  image: string;
  about: string;
  followed: boolean;
}

interface CreatePostProps {
  isOpen: boolean;
  onClose: () => void;
  onPostCreated?: () => void;
}

/**
 * Composant pour créer un nouveau post
 * Remplace l'ancien PostModal avec un design plus cohérent
 */
export function CreatePost({ isOpen, onClose, onPostCreated }: CreatePostProps) {
  // États
  const [content, setContent] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [selectedFollowerIds, setSelectedFollowerIds] = useState<string[]>([]);
  const [followers, setFollowers] = useState<Follower[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const { userData } = useUserData();
  
  // Hooks personnalisés
  const { textareaRef } = useAutoResizeTextarea(content);
  const { selectedFile, previewUrl, handleImageChange, resetImage } = useImageUpload();

  // Charger la liste des followers
  useEffect(() => {
    if (isOpen) {
      fetchFollowers();
    }
  }, [isOpen]);

  const fetchFollowers = async () => {
    try {
      const response = await fetch("http://localhost:80/api/user/listfollower", {
        method: "GET",
        credentials: "include"
      });
      
      const data = await response.json();
      
      if (data.status === "success" && data.followers) {
        setFollowers(data.followers);
      } else {
        console.log("No followers found or error in response:", data);
      }
    } catch (error) {
      console.error("Error fetching followers:", error);
    }
  };

  // Gérer la soumission du formulaire
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!content.trim() && !selectedFile) {
      // Ne pas soumettre si le contenu est vide et aucune image
      return;
    }
    
    setSubmitting(true);
    
    try {
      const formData = new FormData();
      formData.append("content", content);
      
      if (selectedFile) {
        formData.append("image", selectedFile);
      }
      
      // Paramètres de confidentialité
      formData.append("privacy", isPublic ? "public" : "private");
      
      // Extraction des tags
      const tags = extractTags(content);
      formData.append("tags", tags.join(" "));
      
      // Liste des followers autorisés si post privé
      formData.append("allowed_followers", JSON.stringify(selectedFollowerIds));
      
      // Appel API
      const response = await fetch("http://localhost:80/api/posts", {
        method: "POST",
        body: formData,
        credentials: "include"
      });
      
      if (response.ok) {
        resetForm();
        if (onPostCreated) {
          onPostCreated();
        }
        onClose();
      } else {
        const errorText = await response.text();
        console.error("Error creating post:", errorText);
        alert("Erreur lors de la création du post. Veuillez réessayer.");
      }
    } catch (error) {
      console.error("Error submitting post:", error);
      alert("Erreur lors de la création du post. Veuillez réessayer.");
    } finally {
      setSubmitting(false);
    }
  };

  // Réinitialiser le formulaire
  const resetForm = () => {
    setContent('');
    setIsPublic(true);
    setSelectedFollowerIds([]);
    resetImage();
  };

  // Gérer la sélection/désélection d'un follower
  const toggleFollower = (followerId: string) => {
    setSelectedFollowerIds(prev => 
      prev.includes(followerId)
        ? prev.filter(id => id !== followerId)
        : [...prev, followerId]
    );
  };

  return (
    <PostContainer
      title="Créer un nouveau post"
      isOpen={isOpen}
      onClose={onClose}
    >
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        {/* Zone de texte */}
        <Textarea
          ref={textareaRef}
          placeholder="Qu'avez-vous en tête ?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="resize-none min-h-[100px] border border-border p-3 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
        />
        
        {/* Upload d'image */}
        <ImageUpload
          onImageChange={handleImageChange}
          previewUrl={previewUrl}
        />
        
        {/* Option de confidentialité */}
        <div className="flex items-center gap-2">
          <input 
            type="checkbox" 
            id="privacy"
            checked={isPublic}
            onChange={() => setIsPublic(prev => !prev)}
            className="h-4 w-4"
          />
          <label htmlFor="privacy" className="font-semibold">Public</label>
        </div>
        
        {/* Sélection des followers (si post privé) */}
        {!isPublic && (
          <div>
            <h3 className="text-lg font-semibold mb-2">Sélectionnez vos followers</h3>
            <div className="max-h-40 overflow-y-auto border border-border p-2 rounded-lg">
              {followers.length === 0 ? (
                <p>Vous n'avez pas de followers :(</p>
              ) : (
                followers.map((follower) => (
                  <div key={follower.user_id} className="flex items-center gap-2 mb-2">
                    <input
                      type="checkbox"
                      name="followers"
                      id={`follower-${follower.user_id}`}
                      value={follower.user_id}
                      checked={selectedFollowerIds.includes(follower.user_id)}
                      onChange={() => toggleFollower(follower.user_id)}
                      className="h-4 w-4"
                    />
                    <label htmlFor={`follower-${follower.user_id}`} className="flex items-center gap-2">
                      {follower.image ? (
                        <img
                          src={`http://localhost:80/api/avatars/${follower.image}`}
                          alt={follower.username}
                          className="w-8 h-8 rounded-full"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                          {follower.first_name?.charAt(0) || ''}
                        </div>
                      )}
                      <span>
                        {follower.first_name} {follower.last_name} (@{follower.username})
                      </span>
                    </label>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
        
        {/* Boutons d'action */}
        <div className="flex justify-end gap-2 mt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={submitting}
          >
            Annuler
          </Button>
          <Button
            type="submit"
            disabled={(!content.trim() && !selectedFile) || submitting}
          >
            {submitting ? (
              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
            ) : (
              "Publier"
            )}
          </Button>
        </div>
      </form>
    </PostContainer>
  );
}