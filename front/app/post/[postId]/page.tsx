"use client";

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

// Rendre cette page comme une redirection vers la page d'accueil
// avec ouverture du PostDetail comme une modal
export default function PostRedirect({
  params,
}: {
  params: { postId: string };
}) {
  const router = useRouter();

  useEffect(() => {
    // Stocker l'ID du post dans sessionStorage pour l'ouvrir en tant que modal
    sessionStorage.setItem('openPostId', params.postId);
    // Rediriger vers la page d'accueil
    router.push('/home');
  }, [params.postId, router]);

  return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );
}
