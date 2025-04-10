import { useState, useEffect } from 'react';
import { fetchHomeGroups, createGroup } from '../../api/user/groupApi';

interface Group {
  id: string;
  title: string;
  description: string;
  owner: string;
  image?: string;
  created_at: string;
  isMember?: boolean;
}

interface GroupData {
  title: string;
  description: string;
  image?: File;
}

export function useGroups() {
  const [userGroups, setUserGroups] = useState<Group[]>([]);
  const [discoveryGroups, setDiscoveryGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const data = await fetchHomeGroups();

      // Selon l'API, les données sont probablement dans data.data et data.discovery
      if (data) {
        // Adapter cette partie à la structure réelle de la réponse API
        setUserGroups(data.data || []);
        setDiscoveryGroups(data.discovery || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Une erreur est survenue'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleCreateGroup = async (groupData: GroupData) => {
    try {
      setLoading(true);
      const newGroup = await createGroup(groupData);
      setUserGroups(prev => [...prev, newGroup]);
      return newGroup;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erreur lors de la création du groupe'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    userGroups,
    discoveryGroups,
    loading,
    error,
    refresh: fetchGroups,
    createGroup: handleCreateGroup
  };
}