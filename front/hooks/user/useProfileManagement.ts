import { useState, useEffect } from 'react';
import { 
  fetchUserProfile, 
  getFollowers, 
  getFollowing, 
  followUser, 
  unfollowUser, 
  acceptFollowRequest, 
  declineFollowRequest, 
  abortFollowRequest,
  togglePrivacyStatus
} from '@/api/user/userInfo';
import { UserProfile, FollowUser, FollowStatus } from '@/types/profile';

export function useProfileManagement(userId?: string) {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [followers, setFollowers] = useState<FollowUser[]>([]);
  const [following, setFollowing] = useState<FollowUser[]>([]);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingFollowers, setLoadingFollowers] = useState(false);
  const [loadingFollowing, setLoadingFollowing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isOwnProfile = !userId;

  // Charger le profil utilisateur
  useEffect(() => {
    const loadProfile = async () => {
      setLoadingProfile(true);
      setError(null);
      try {
        const profile = await fetchUserProfile(userId);
        setUserProfile(profile);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur lors du chargement du profil');
      } finally {
        setLoadingProfile(false);
      }
    };

    loadProfile();
  }, [userId]);

  // Charger les followers
  useEffect(() => {
    const loadFollowers = async () => {
      if (!userProfile?.id) return;
      setLoadingFollowers(true);
      try {
        const followersData = await getFollowers(userProfile.id);
        setFollowers(followersData);
      } catch (err) {
        console.error('Erreur lors du chargement des abonnés:', err);
      } finally {
        setLoadingFollowers(false);
      }
    };

    loadFollowers();
  }, [userProfile?.id]);

  // Charger les following
  useEffect(() => {
    const loadFollowing = async () => {
      if (!userProfile?.id) return;
      setLoadingFollowing(true);
      try {
        const followingData = await getFollowing(userProfile.id);
        setFollowing(followingData);
      } catch (err) {
        console.error('Erreur lors du chargement des abonnements:', err);
      } finally {
        setLoadingFollowing(false);
      }
    };

    loadFollowing();
  }, [userProfile?.id]);

  // Gérer le suivi/désabonnement
  const handleFollowToggle = async () => {
    if (!userProfile?.id) return;

    try {
      if (userProfile.is_following === FollowStatus.FOLLOWING) {
        // Désabonner
        const success = await unfollowUser(userProfile.id);
        if (success) {
          setUserProfile(prev => prev ? {
            ...prev,
            is_following: FollowStatus.NOT_FOLLOWING,
            followers: prev.followers - 1
          } : null);
          // Recharger les followers
          const updatedFollowers = await getFollowers(userProfile.id);
          setFollowers(updatedFollowers);
        }
      } else if (userProfile.is_following === FollowStatus.NOT_FOLLOWING) {
        // Suivre ou demander à suivre
        const success = await followUser(userProfile.id);
        if (success) {
          const newStatus = userProfile.public ? FollowStatus.FOLLOWING : FollowStatus.WAITING;
          setUserProfile(prev => prev ? {
            ...prev,
            is_following: newStatus,
            followers: userProfile.public ? prev.followers + 1 : prev.followers
          } : null);
          
          if (userProfile.public) {
            // Recharger les followers pour les profils publics
            const updatedFollowers = await getFollowers(userProfile.id);
            setFollowers(updatedFollowers);
          }
        }
      }
    } catch (err) {
      setError('Erreur lors de la modification du suivi');
    }
  };

  // Accepter une demande de suivi
  const handleAcceptFollow = async () => {
    if (!userProfile?.id) return;
    
    try {
      const success = await acceptFollowRequest(userProfile.id);
      if (success) {
        await refreshProfile();
      }
    } catch (err) {
      setError('Erreur lors de l\'acceptation de la demande');
    }
  };

  // Refuser une demande de suivi
  const handleDeclineFollow = async () => {
    if (!userProfile?.id) return;
    
    try {
      const success = await declineFollowRequest(userProfile.id);
      if (success) {
        await refreshProfile();
      }
    } catch (err) {
      setError('Erreur lors du refus de la demande');
    }
  };

  // Annuler une demande de suivi
  const handleAbortFollow = async () => {
    if (!userProfile?.id) return;
    
    try {
      const success = await abortFollowRequest(userProfile.id);
      if (success) {
        setUserProfile(prev => prev ? {
          ...prev,
          is_following: FollowStatus.NOT_FOLLOWING
        } : null);
      }
    } catch (err) {
      setError('Erreur lors de l\'annulation de la demande');
    }
  };

  // Changer le statut public/privé
  const handleTogglePrivacy = async () => {
    if (!isOwnProfile || !userProfile) return;
    
    try {
      await togglePrivacyStatus();
      setUserProfile(prev => prev ? {
        ...prev,
        public: !prev.public
      } : null);
    } catch (err) {
      setError('Erreur lors du changement de statut');
    }
  };

  // Rafraîchir les données du profil
  const refreshProfile = async () => {
    if (!userProfile?.id) return;
    
    try {
      const url = isOwnProfile ? undefined : userProfile.id;
      const updatedProfile = await fetchUserProfile(url);
      setUserProfile(updatedProfile);
    } catch (err) {
      setError('Erreur lors du rafraîchissement du profil');
    }
  };

  return {
    // États
    userProfile,
    followers,
    following,
    loadingProfile,
    loadingFollowers,
    loadingFollowing,
    error,
    isOwnProfile,
    
    // Actions
    handleFollowToggle,
    handleAcceptFollow,
    handleDeclineFollow,
    handleAbortFollow,
    handleTogglePrivacy,
    refreshProfile,
    
    // Utilitaires
    clearError: () => setError(null)
  };
}