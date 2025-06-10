'use client';

import { useState, useRef, ChangeEvent } from 'react';
import { X, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImageUploadProps {
  onImageChange: (file: File | null) => void;
  previewUrl?: string | null;
  initialPreview?: string | null;
  accept?: string;
  label?: string;
}

/**
 * Composant réutilisable pour l'upload d'images avec prévisualisation
 * Utilisé à la fois dans la création de post et l'ajout de commentaires
 */
export function ImageUpload({
  onImageChange,
  previewUrl,
  initialPreview,
  accept = 'image/*',
  label = 'Ajouter une image'
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(initialPreview || previewUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Gestion du changement de fichier
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setPreview(imageUrl);
      onImageChange(file);
    } else {
      setPreview(null);
      onImageChange(null);
    }
  };

  // Suppression de l'image
  const removeImage = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onImageChange(null);
  };

  return (
    <div className="mt-2">
      {/* Input caché pour sélectionner un fichier */}
      <input
        type="file"
        accept={accept}
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileChange}
      />
      
      {/* Bouton pour déclencher la sélection de fichier */}
      <Button 
        variant="ghost" 
        size="icon" 
        className="text-primary"
        onClick={() => fileInputRef.current?.click()}
        type="button"
      >
        <ImageIcon className="h-5 w-5" />
      </Button>
      
      {/* Prévisualisation de l'image */}
      {preview && (
        <div className="relative mt-2 rounded-md overflow-hidden">
          <img 
            src={preview} 
            alt="Image preview" 
            className="max-h-60 w-auto"
          />
          <Button 
            variant="destructive" 
            size="icon" 
            className="absolute top-2 right-2 h-6 w-6 rounded-full bg-black/70 hover:bg-black/90"
            onClick={removeImage}
            type="button"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}
    </div>
  );
}

/**
 * Hook simplifié pour la gestion des images dans les formulaires
 */
export function useImageUpload(accept: string = 'image/*') {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const handleImageChange = (file: File | null) => {
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setSelectedFile(null);
      setPreviewUrl(null);
    }
  };
  
  const resetImage = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
  };
  
  return {
    selectedFile,
    previewUrl,
    handleImageChange,
    resetImage
  };
}