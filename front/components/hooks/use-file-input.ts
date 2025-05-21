import { useRef, useState } from 'react';

export function useFileInput(accept = 'image/*', maxSize = 5) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [selectedFilePreview, setSelectedFilePreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size / 1024 / 1024 > maxSize) {
        alert(`Le fichier dépasse la taille maximale de ${maxSize} Mo.`);
        return;
      }
      
      setSelectedFile(file);
      setFileName(file.name);
      
      // Créer une prévisualisation pour les images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setSelectedFilePreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setSelectedFilePreview(null);
      }
    }
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
    setFileName('');
    setSelectedFilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return {
    fileInputRef,
    selectedFile,
    fileName,
    selectedFilePreview,
    handleFileChange,
    removeSelectedFile,
  };
}
