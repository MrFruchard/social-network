import { useState, useEffect } from 'react';

// Définition des types
interface Invitation {
  userId: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  status: 'pending' | 'accepted' | 'rejected';
  // ajoutez d'autres propriétés selon votre modèle de données
}

interface Request {
  userId: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  requestDate?: string;
  // ajoutez d'autres propriétés selon votre modèle de données
}

export function useGroupInvitations(groupId: string) {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Récupérer les invitations et demandes du groupe
  const fetchInvitations = async () => {
    try {
      setLoading(true);
      
      // Récupérer les invitations et demandes
      const response = await fetch(`http://localhost:80/api/group/${groupId}/invitations`, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch group invitations');
      }
      
      const data = await response.json();
      setInvitations(data.invitations || []);
      setPendingRequests(data.pendingRequests || []);
    } catch (err) {
      console.error('Error fetching group invitations:', err);
      setError(err instanceof Error ? err : new Error('Une erreur est survenue'));
      
      // En cas d'erreur, garder les anciennes valeurs
      setInvitations(prev => prev);
      setPendingRequests(prev => prev);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (groupId) {
      fetchInvitations();
    }
  }, [groupId]);

  // Accepter une demande d'adhésion
  const acceptRequest = async (userId: string) => {
    try {
      setLoading(true);
      
      const response = await fetch(`http://localhost:80/api/group/${groupId}/accept`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to accept group request');
      }
      
      setPendingRequests(prev => prev.filter(request => request.userId !== userId));
      return true;
    } catch (err) {
      console.error('Error accepting group request:', err);
      setError(err instanceof Error ? err : new Error('Erreur lors de l\'acceptation de la demande'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Refuser une demande d'adhésion
  const rejectRequest = async (userId: string) => {
    try {
      setLoading(true);
      
      const response = await fetch(`http://localhost:80/api/group/${groupId}/reject`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to reject group request');
      }
      
      setPendingRequests(prev => prev.filter(request => request.userId !== userId));
      return true;
    } catch (err) {
      console.error('Error rejecting group request:', err);
      setError(err instanceof Error ? err : new Error('Erreur lors du refus de la demande'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Inviter un utilisateur à rejoindre le groupe
  const inviteUser = async (userId: string) => {
    try {
      setLoading(true);
      
      const response = await fetch(`http://localhost:80/api/group/${groupId}/invite`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to invite user to group');
      }
      
      const newInvitation = await response.json();
      setInvitations(prev => [...prev, newInvitation]);
      return true;
    } catch (err) {
      console.error('Error inviting user to group:', err);
      setError(err instanceof Error ? err : new Error('Erreur lors de l\'invitation'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    invitations,
    pendingRequests,
    loading,
    error,
    acceptRequest,
    rejectRequest,
    inviteUser,
    refresh: fetchInvitations
  };
}