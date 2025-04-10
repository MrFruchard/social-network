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

  useEffect(() => {
    fetchProfileData();
  }, [userId]);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const data = await fetchUserProfile(userId);
      setProfile(data);
      
      // Si aucun userId n'est fourni, on consid�re que c'est le profil de l'utilisateur connecté
      if (!userId) {
        setIsOwner(true);
      } else {
        // V�rifier si le profil consult� correspond � l'utilisateur connect�
        // Note: Cette logique pourrait n�cessiter un ajustement selon votre impl�mentation
        const currentUserData = await fetch("http://localhost:80/api/user/info", {
          credentials: "include",
        }).then(res => res.json());
        
        setIsOwner(currentUserData.id === data.id);
      }
    } catch (err) {
      setError('Failed to load profile data');
      console.error(err);
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