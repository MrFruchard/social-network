import { useState, useEffect } from 'react';
import { removeGroupMember, askToJoinGroup } from '../../api/user/groupApi';

// Définition des types
interface GroupMember {
  id: string;
  username?: string;
  first_name: string;
  last_name: string;
  image?: string;
  role?: string;
  // ajoutez d'autres propriétés selon votre modèle de données
}

type UserStatus = 'member' | 'pending' | 'none' | null;

export function useGroupMembers(groupId: string) {
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [pendingRequests, setPendingRequests] = useState<GroupMember[]>([]);
  const [userStatus, setUserStatus] = useState<UserStatus>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Récupérer les membres du groupe
  const fetchMembers = async () => {
    try {
      setLoading(true);
      
      // Récupérer les membres
      const response = await fetch(`http://localhost:80/api/group/${groupId}/members`, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch group members');
      }
      
      const data = await response.json();
      setMembers(data.members || []);
      setPendingRequests(data.pendingRequests || []);
      setUserStatus(data.userStatus || null);
    } catch (err) {
      console.error('Error fetching group members:', err);
      setError(err instanceof Error ? err : new Error('Une erreur est survenue'));
      
      // En cas d'erreur, garder les anciennes valeurs
      setMembers(prev => prev);
      setPendingRequests(prev => prev);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (groupId) {
      fetchMembers();
    }
  }, [groupId]);

  // Supprimer un membre
  const handleRemoveMember = async (userId: string) => {
    try {
      setLoading(true);
      await removeGroupMember(groupId, userId);
      // Mettre à jour la liste des membres
      setMembers(prev => prev.filter(member => member.id !== userId));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erreur lors de la suppression du membre'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Demander à rejoindre le groupe
  const handleJoinRequest = async () => {
    try {
      setLoading(true);
      await askToJoinGroup(groupId);
      setUserStatus('pending');
      return true;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erreur lors de la demande'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Quitter le groupe
  const handleLeaveGroup = async (userId: string) => {
    try {
      setLoading(true);
      // Utiliser l'API de suppression de membre existante
      await removeGroupMember(groupId, userId);
      setUserStatus('none');
      return true;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erreur lors de la sortie du groupe'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    members,
    pendingRequests,
    userStatus,
    loading,
    error,
    removeMember: handleRemoveMember,
    requestJoin: handleJoinRequest,
    leaveGroup: handleLeaveGroup,
    refresh: fetchMembers
  };
}