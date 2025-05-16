import { useState, useEffect } from 'react';
import { updateGroup, deleteGroup } from '../../api/user/groupApi';

// Définition des types
interface Group {
  id: string;
  title: string;
  description: string;
  owner: string;
  image?: string;
  created_at: string;
  // ajoutez d'autres propriétés selon votre modèle de données
}

interface GroupUpdateData {
  title?: string;
  description?: string;
  image?: File;
}

export function useGroup(groupId: string) {
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Récupérer les détails du groupe
  const fetchGroupDetails = async () => {
    try {
      setLoading(true);
      // Notez: Cette API n'existe pas encore dans le backend
      // const data = await fetchGroupDetails(groupId);
      // setGroup(data);

      // Pour l'instant, on pourrait utiliser fetchHomeGroups et filtrer le groupe spécifique
      // Ce code devrait être remplacé quand une API dédiée sera disponible
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Une erreur est survenue'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (groupId) {
      fetchGroupDetails();
    }
  }, [groupId]);

  // Mettre à jour un groupe
  const handleUpdateGroup = async (groupData: GroupUpdateData) => {
    try {
      setLoading(true);
      const updatedGroup = await updateGroup(groupId, groupData);
      setGroup(updatedGroup);
      return updatedGroup;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erreur lors de la mise à jour du groupe'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Supprimer un groupe
  const handleDeleteGroup = async () => {
    try {
      setLoading(true);
      await deleteGroup(groupId);
      setGroup(null);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erreur lors de la suppression du groupe'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    group,
    loading,
    error,
    updateGroup: handleUpdateGroup,
    deleteGroup: handleDeleteGroup,
    refresh: fetchGroupDetails
  };
}