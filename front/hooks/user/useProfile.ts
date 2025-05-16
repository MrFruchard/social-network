import { useState, useEffect } from 'react';
import { togglePrivacyStatus, fetchUserProfile } from '@/api/user/userInfo';

interface ProfileData {
  id: string;
  username: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  avatar?: string;
  public: boolean;
  followed: boolean;
  is_following: boolean;
  pending_request: boolean;
  follower_count: number;
  following_count: number;
  post_count: number;
  isCurrentUser: boolean;
}

export function useProfile(userId?: string) {
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        setAccessDenied(false);

        // Si userId n'est pas fourni, récupérer le profil de l'utilisateur connecté
        const url = userId 
          ? `http://localhost:80/api/user/${userId}` // Modification de la route pour correspondre au backend
          : 'http://localhost:80/api/user/info';
        
        const response = await fetch(url, {
          credentials: 'include'
        });

        if (response.status === 403) {
          setAccessDenied(true);
          throw new Error('Ce profil est privé. Vous devez suivre cet utilisateur pour voir son contenu.');
        }

        if (!response.ok) {
          throw new Error('Impossible de récupérer les informations du profil');
        }

        const data = await response.json();
        
        // Log pour déboguer
        console.log('Profil reçu du backend:', JSON.stringify(data, null, 2));
        
        // Déterminer si c'est le profil de l'utilisateur actuel
        const isCurrentUser = !userId || data.id === (await getCurrentUserId());
        
        setProfileData({
          ...data,
          isCurrentUser
        });
      } catch (err) {
        console.error('Error fetching profile:', err);
        // Log plus détaillé pour le débogage
        console.error('URL attempted:', userId 
          ? `http://localhost:80/api/user/${userId}`
          : 'http://localhost:80/api/user/info');
        setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  // Helper pour obtenir l'ID de l'utilisateur connecté
  const getCurrentUserId = async (): Promise<string> => {
    try {
      const response = await fetch('http://localhost:80/api/user/info', {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Non connecté');
      }
      
      const data = await response.json();
      return data.id;
    } catch (error) {
      return '';
    }
  };

  // Fonction pour basculer le statut public/privé et le persister
  const togglePrivacy = async () => {
    if (!profileData || !profileData.isCurrentUser) return;
    
    try {
      setLoading(true);
      
      // Mettre à jour l'interface immédiatement pour une meilleure réactivité
      const newPublicStatus = !profileData.public;
      setProfileData(prev => {
        if (!prev) return null;
        return { ...prev, public: newPublicStatus };
      });
      
      // Appeler l'API pour persister le changement
      await togglePrivacyStatus();
      
      // Rafraîchir les données depuis le serveur pour confirmer le changement
      const updatedProfile = await fetchUserProfile();
      
      // Vérifier si le changement a bien été appliqué
      if (updatedProfile.public !== newPublicStatus) {
        console.warn("Le changement de statut n'a pas été correctement appliqué, forçage de l'état local");
        setProfileData(prev => {
          if (!prev) return null;
          return { ...prev, public: updatedProfile.public, isCurrentUser: true };
        });
      }
      
    } catch (err) {
      console.error('Erreur lors du changement de statut :', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour demander à suivre
  const requestFollow = async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      const response = await fetch('http://localhost:80/api/user/follow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ id: userId })
      });
      
      if (!response.ok) {
        throw new Error('Impossible d\'envoyer la demande');
      }
      
      // Mettre à jour l'état local
      setProfileData(prev => prev ? { 
        ...prev, 
        pending_request: true 
      } : null);
    } catch (err) {
      console.error('Error requesting follow:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return {
    profileData,
    loading,
    error,
    accessDenied,
    togglePrivacy,
    requestFollow
  };
}