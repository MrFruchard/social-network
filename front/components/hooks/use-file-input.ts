import { useRef, useState } from 'react';

export function useFileInput({ accept = 'image/*', maxSize = 5 } = {}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | undefined>();
  const [fileName, setFileName] = useState<string>('');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size / 1024 / 1024 > maxSize) {
        alert(`Le fichier dépasse la taille maximale de ${maxSize} Mo.`);
        return;
      }
      setSelectedFile(file);
      setFileName(file.name);
    }
  };

  const clearFile = () => {
    setSelectedFile(undefined);
    setFileName('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return {
    fileInputRef,
    selectedFile,
    fileName,
    handleFileSelect,
    clearFile,
  };
}
