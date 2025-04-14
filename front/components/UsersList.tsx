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
        
        const response = await fetch(url, {
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des utilisateurs');
        }
        
        const data = await response.json();
        setUsers(data);
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
        <h2 className="text-xl font-bold">{title}</h2>
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
        <h2 className="text-xl font-bold">{title}</h2>
        <p className="text-muted-foreground">Aucun utilisateur trouvé</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">{title}</h2>
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