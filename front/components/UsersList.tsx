"use client"

import { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import UserLink from './UserLink';
import { Button } from './ui/button';
import { Skeleton } from './ui/skeleton';

interface User {
  id: string;
  username: string;
  first_name?: string;
  last_name?: string;
  avatar?: string;
  public: boolean;
  is_following?: boolean;
  pending_request?: boolean;
}

interface UsersListProps {
  title: string;
  type: 'followers' | 'following' | 'search' | 'suggestions'; 
  initialUsers?: User[];
}

export default function UsersList({ title, type, initialUsers = [] }: UsersListProps) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [loading, setLoading] = useState(initialUsers.length === 0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialUsers.length > 0) return;
    
    const fetchUsers = async () => {
      try {
        setLoading(true);
        let url = '';
        
        switch (type) {
          case 'followers':
            url = 'http://localhost:80/api/user/listfollower';
            break;
          case 'following':
            url = 'http://localhost:80/api/user/listfollow';
            break;
          case 'search':
          case 'suggestions':
            // Ces endpoints n'existent pas encore - fallback vers followers
            url = 'http://localhost:80/api/user/listfollower';
            break;
        }
        
        console.log(`Fetching users from ${url}`);
        
        // Pour les tests en développement, simulation d'une réponse API
        if (process.env.NODE_ENV === 'development' && false) { // Mettre true pour activer les données de test
          console.log('Using mock data for development');
          
          // Données de test
          const mockData = {
            status: "success",
            followers: [
              {
                user_id: "765c0cf9-eb9b-4940-831f-11b3d6b948bf",
                first_name: "Alex",
                last_name: "Brown",
                image: "",
                username: "alexbrown",
                about: "Aime les jeux vidéo et le DevOps.",
                followed: true
              }
            ]
          };
          
          setUsers(mockData.followers.map(user => ({
            ...user,
            id: user.user_id,
            avatar: user.image,
            public: true
          })));
          
          setLoading(false);
          return;
        }
        
        // Vraie requête API
        const response = await fetch(url, {
          credentials: 'include'
        });
        
        // Log les détails de la réponse pour le débogage
        console.log('Response status:', response.status);
        console.log('Response ok:', response.ok);
        
        // Gérer les erreurs de manière plus détaillée
        if (!response.ok) {
          console.error('API error:', response.status, response.statusText);
          throw new Error(`Erreur ${response.status}: ${response.statusText || 'Récupération impossible'}`);
        }
        
        const data = await response.json();
        
        // API returns different property names based on the endpoint
        if (data && typeof data === 'object') {
          // Log the response for debugging
          console.log(`API response for ${type}:`, data);
          
          // Authentication error
          if (data.code === 401) {
            console.error('Authentication error:', data);
            setError('Authentification requise');
            return;
          }
          
          if (data.status === 'success') {
            if (type === 'followers' && Array.isArray(data.followers)) {
              setUsers(data.followers.map(user => ({
                ...user,
                id: user.user_id,
                avatar: user.image,
                public: true, // Default as we don't have this info
                username: user.username || 'utilisateur'
              })));
            } else if (type === 'following' && Array.isArray(data.follow)) {
              setUsers(data.follow.map(user => ({
                ...user,
                id: user.user_id,
                avatar: user.image,
                public: true, // Default as we don't have this info
                username: user.username || 'utilisateur'
              })));
            } else if (Array.isArray(data.users)) {
              setUsers(data.users);
            } else if (Array.isArray(data)) {
              setUsers(data);
            } else {
              // Empty results are ok - just show empty state
              console.log('Empty results from API:', data);
              setUsers([]);
            }
          } else {
            console.error('API returned error:', data);
            setError(data.message || 'Une erreur est survenue');
          }
        } else {
          console.error('Invalid API response format:', data);
          setError('Format de données invalide');
        }
      } catch (err) {
        console.error('Error fetching users:', err);
        setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, [type, initialUsers]);

  const handleFollowRequest = async (userId: string) => {
    try {
      const response = await fetch('http://localhost:80/api/user/follow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ id: userId })
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de l\'envoi de la demande');
      }
      
      // Mettre à jour l'état local
      setUsers(users.map(user => 
        user.id === userId 
          ? { ...user, pending_request: true } 
          : user
      ));
    } catch (err) {
      console.error('Error requesting follow:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {title && <h2 className="text-xl font-bold">{title}</h2>}
        {[1, 2, 3].map(i => (
          <Card key={i}>
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
              <Skeleton className="h-8 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (users.length === 0) {
    return (
      <div className="space-y-4">
        {title && <h2 className="text-xl font-bold">{title}</h2>}
        <p className="text-muted-foreground">Aucun utilisateur trouvé</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {title && <h2 className="text-xl font-bold">{title}</h2>}
      <div className="space-y-2">
        {users.map(user => (
          <Card key={user.id}>
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarImage 
                    src={user.avatar ? `http://localhost:80/api/avatars/${user.avatar}` : undefined} 
                    alt={user.username} 
                  />
                  <AvatarFallback>
                    {user.username.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <UserLink 
                    userId={user.id} 
                    username={user.username} 
                    isPrivate={!user.public}
                    className="font-semibold"
                  />
                  {user.first_name && user.last_name && (
                    <p className="text-sm text-muted-foreground">
                      {user.first_name} {user.last_name}
                    </p>
                  )}
                </div>
              </div>
              
              {type === 'search' || type === 'suggestions' ? (
                user.is_following ? (
                  <Button variant="outline" disabled>Suivi</Button>
                ) : user.pending_request ? (
                  <Button variant="outline" disabled>Demande envoyée</Button>
                ) : (
                  <Button onClick={() => handleFollowRequest(user.id)}>
                    Suivre
                  </Button>
                )
              ) : null}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}