import { useState, useEffect } from 'react';
import { fetchUserProfile, togglePrivacyStatus } from '@/api/user/userInfo';

interface ProfileData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  username?: string;
  dateOfBirth?: string;
  image?: string;
  aboutMe?: string;
  isPublic: boolean;
  role: string;
  createdAt: string;
  followerCount: number;
  followingCount: number;
}

export function useProfile(userId?: string) {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState<boolean>(false);

  // Récupérer l'ID de l'utilisateur connecté une seule fois
  // Nous n'avons plus besoin de récupérer l'ID utilisateur séparément
  // puisque fetchUserProfile gère désormais les deux cas (avec ou sans userId)
  useEffect(() => {
    if (!userId) {
      setIsOwner(true); // Si aucun userId n'est fourni, c'est le profil de l'utilisateur connecté
    }
  }, [userId]);

  // Récupérer les données du profil quand userId change
  useEffect(() => {
    fetchProfileData();
  }, [userId]);

  const fetchProfileData = async () => {
    try {
      setLoading(true);

      // On utilise le userId tel quel, la fonction fetchUserProfile gère maintenant les deux cas
      const data = await fetchUserProfile(userId);

      if (!data || !data.id) {
        throw new Error("Profile data missing ID");
      }

      setProfile(data);
      
      // Si c'est un autre profil que le sien, on vérifie si on en est le propriétaire
      if (userId) {
        try {
          // Récupérer les infos de l'utilisateur connecté pour comparer les IDs
          const currentUserData = await fetch("http://localhost:80/api/user/info", {
            credentials: "include",
          }).then(res => {
            if (!res.ok) throw new Error("Failed to fetch current user");
            return res.json();
          });
          
          // Vérifier si l'utilisateur connecté est le propriétaire du profil
          setIsOwner(currentUserData.id === data.id);
        } catch (error) {
          console.error("Failed to determine ownership:", error);
          setIsOwner(false);
        }
      }
      // Si userId n'est pas fourni, on a déjà défini isOwner=true dans le useEffect

    } catch (err) {
      let errorMessage = 'Failed to load profile data';
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError(errorMessage);
      console.error("Profile fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const togglePrivacy = async () => {
    if (!isOwner) return;

    try {
      setLoading(true);
      const data = await togglePrivacyStatus();
      setProfile(prev => prev ? { ...prev, isPublic: !prev.isPublic } : null);
      return data;
    } catch (err) {
      setError('Failed to toggle privacy');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    profile,
    loading,
    error,
    isOwner,
    refresh: fetchProfileData,
    togglePrivacy
  };
}