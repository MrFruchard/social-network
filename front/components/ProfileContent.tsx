"use client";

import { useAuth } from "@/hooks/user/checkAuth";
import { useSearchParams } from "next/navigation";
import { useProfile } from "@/hooks/user/useProfile";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";
import {
  CalendarIcon,
  UserIcon,
  MailIcon,
  ClockIcon,
  LockIcon,
  LockOpenIcon,
} from "lucide-react";
import { UserPostsList } from "@/components/UserPostsList";
import React, { useEffect, useState } from "react";

// Définition type pour followers/following
interface FollowUser {
  user_id: string;
  first_name: string;
  last_name: string;
  image: string;
  username: string;
  about: string;
  followed: boolean;
}

interface UserProfile {
  id: string;
  last_name: string;
  first_name: string;
  about: string;
  username: string;
  image_url: string;
  public: boolean;
  followers: number;
  following: number;
  created_at: string;
  is_following: number; // 0: Not Following, 1: Following, 2: Waiting, 3: Received Follow Request
}

interface FollowedUser {
  user_id: string;
  first_name: string;
  last_name: string;
  username: string;
  image: string;
  about: string;
  followed: boolean;
}

function formatDate(dateString: string) {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString();
}

const handleFollow = async (targetUserId?: string) => {
  const requestOptions = {
    method: "POST",
    credentials: "include" as RequestCredentials,
  };

  // Utiliser le targetUserId passé en paramètre si disponible, sinon prendre l'ID de l'URL
  const user_id = targetUserId || new URL(location.href).searchParams.get("id");

  try {
    const response = await fetch(
      `http://localhost:80/api/user/follow?user=${user_id}`,
      requestOptions
    );
    const result = await response.text();
    console.log('Follow result:', result);
    return response.ok;
  } catch (error) {
    console.error("Follow error:", error);
    return false;
  }
};

const handleAcceptFollow = async (targetUserId?: string) => {
  const requestOptions = {
    method: "POST",
    credentials: "include" as RequestCredentials,
  };

  // Utiliser le targetUserId passé en paramètre si disponible, sinon prendre l'ID de l'URL
  const user_id = targetUserId || new URL(location.href).searchParams.get("id");

  try {
    const response = await fetch(
      `http://localhost:80/api/user/agree?user=${user_id}`,
      requestOptions
    );
    const result = await response.text();
    console.log('Accept follow result:', result);
    return response.ok;
  } catch (error) {
    console.error("Accept follow error:", error);
    return false;
  }
};

const handleUnfollow = async (targetUserId?: string) => {
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    credentials: "include" as RequestCredentials,
    redirect: "follow" as RequestRedirect,
  };

  // Utiliser le targetUserId passé en paramètre si disponible, sinon prendre l'ID de l'URL
  const user_id = targetUserId || new URL(location.href).searchParams.get("id");

  try {
    const response = await fetch(
      `http://localhost:80/api/user/unfollow?user=${user_id}`,
      requestOptions
    );
    const result = await response.text();
    console.log('Unfollow result:', result);
    return response.ok;
  } catch (error) {
    console.error("Unfollow error:", error);
    return false;
  }
};

export function ProfileContent({ userId }: { userId?: string }) {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [followers, setFollowers] = useState<FollowUser[]>([]);
  const [following, setFollowing] = useState<FollowUser[]>([]);
  const [loadingFollowers, setLoadingFollowers] = useState(false);
  const [loadingFollowing, setLoadingFollowing] = useState(false);
  const isOwnProfile = !userId;

  useEffect(() => {
    const fetchUserProfile = async () => {
      const requestOptions = {
        method: "GET",
        redirect: "follow" as RequestRedirect,
        credentials: "include" as RequestCredentials,
      };

      try {
        const response = await fetch(
          `http://localhost:80/api/user/${userId}`,
          requestOptions
        );
        const data = await response.json();
        console.log('Profile data:', data);
        setUserProfile(data);
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };

    if (userId) {
      fetchUserProfile();
    }
  }, [userId]);

  useEffect(() => {
    const fetchOwnProfile = async () => {
      const requestOptions = {
        method: "GET",
        credentials: "include" as RequestCredentials,
      };

      try {
        const response = await fetch(
          "http://localhost:80/api/user/info",
          requestOptions
        );
        const data = await response.json();
        console.log(data);
        setUserProfile(data);
      } catch (error) {
        console.error("Error fetching own profile:", error);
      }
    };

    if (isOwnProfile) {
      fetchOwnProfile();
    }
  }, [isOwnProfile]);
  
  // Référence pour savoir si le profil a changé
  const [currentProfileId, setCurrentProfileId] = useState<string | null>(null);
  
  // Réinitialiser les listes lors du changement de profil
  useEffect(() => {
    if (userProfile?.id && currentProfileId !== userProfile.id) {
      setCurrentProfileId(userProfile.id);
      setFollowers([]);
      setFollowing([]);
    }
  }, [userProfile?.id, currentProfileId]);

  // Charger les abonnés
  useEffect(() => {
    const fetchFollowers = async () => {
      if (!userProfile?.id) return;
      
      setLoadingFollowers(true);
      try {
        // Utiliser le userProfile.id directement plutôt que userId pour assurer la cohérence
        const profileIdToFetch = userProfile.id;
        const response = await fetch(
          `http://localhost:80/api/user/listfollower?user=${profileIdToFetch}`,
          { credentials: 'include' }
        );
        
        if (!response.ok) {
          console.error('Failed to fetch followers:', response.status);
          return;
        }
        
        const data = await response.json();
        console.log('Followers data for', profileIdToFetch, ':', data);
        
        if (data.status === 'success' && Array.isArray(data.followers)) {
          // Vérifier si le profil courant correspond toujours à celui demandé
          if (userProfile.id === profileIdToFetch) {
            setFollowers(data.followers);
          }
        }
      } catch (error) {
        console.error('Error fetching followers:', error);
      } finally {
        setLoadingFollowers(false);
      }
    };
    
    fetchFollowers();
  }, [userProfile?.id]);
  
  // Charger les abonnements
  useEffect(() => {
    const fetchFollowing = async () => {
      if (!userProfile?.id) return;
      
      setLoadingFollowing(true);
      try {
        // Utiliser le userProfile.id directement plutôt que userId pour assurer la cohérence
        const profileIdToFetch = userProfile.id;
        const response = await fetch(
          `http://localhost:80/api/user/listfollow?user=${profileIdToFetch}`,
          { credentials: 'include' }
        );
        
        if (!response.ok) {
          console.error('Failed to fetch following:', response.status);
          return;
        }
        
        const data = await response.json();
        console.log('Following data for', profileIdToFetch, ':', data);
        
        if (data.status === 'success' && Array.isArray(data.follow)) {
          // Vérifier si le profil courant correspond toujours à celui demandé
          if (userProfile.id === profileIdToFetch) {
            setFollowing(data.follow);
          }
        }
      } catch (error) {
        console.error('Error fetching following:', error);
      } finally {
        setLoadingFollowing(false);
      }
    };
    
    fetchFollowing();
  }, [userProfile?.id]);

  // Rafraîchir les données du profil
  const refreshProfileData = async () => {
    if (!userProfile?.id) return;
    
    try {
      // Utiliser l'endpoint approprié selon qu'il s'agit de son propre profil ou non
      const url = isOwnProfile 
        ? 'http://localhost:80/api/user/info'
        : `http://localhost:80/api/user/${userProfile.id}`;
      
      const response = await fetch(url, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setUserProfile(data);
        console.log('Profile refreshed:', data);
      }
    } catch (error) {
      console.error('Error refreshing profile:', error);
    }
  };

  const handleFollowToggle = async () => {
    if (!userProfile || !userProfile.id) return;

    // Cas où l'utilisateur est déjà abonné et souhaite se désabonner
    if (userProfile.is_following === 1) {
      const success = await handleUnfollow(userProfile.id);
      
      if (success) {
        // Mise à jour de l'état du profil
        setUserProfile({
          ...userProfile,
          is_following: 0,
          followers: userProfile.followers - 1,
        });
        
        // Rafraîchir la liste des abonnés
        setLoadingFollowers(true);
        try {
          const response = await fetch(
            `http://localhost:80/api/user/listfollower?user=${userProfile.id}`,
            { credentials: 'include' }
          );
          if (response.ok) {
            const data = await response.json();
            if (data.status === 'success' && Array.isArray(data.followers)) {
              setFollowers(data.followers);
            }
          }
        } catch (error) {
          console.error('Error refreshing followers:', error);
        } finally {
          setLoadingFollowers(false);
        }
      }
    } 
    // Cas où l'utilisateur n'est pas abonné et souhaite s'abonner ou demander à s'abonner
    else if (userProfile.is_following === 0) {
      const success = await handleFollow(userProfile.id);
      
      if (success) {
        if (userProfile.public) {
          // Profil public: abonnement direct
          setUserProfile({
            ...userProfile,
            is_following: 1,
            followers: userProfile.followers + 1,
          });
          
          // Rafraîchir la liste des abonnés
          setLoadingFollowers(true);
          try {
            const response = await fetch(
              `http://localhost:80/api/user/listfollower?user=${userProfile.id}`,
              { credentials: 'include' }
            );
            if (response.ok) {
              const data = await response.json();
              if (data.status === 'success' && Array.isArray(data.followers)) {
                setFollowers(data.followers);
              }
            }
          } catch (error) {
            console.error('Error refreshing followers:', error);
          } finally {
            setLoadingFollowers(false);
          }
        } else {
          // Profil privé: demande d'abonnement en attente
          setUserProfile({
            ...userProfile,
            is_following: 2, // En attente
          });
        }
      }
    }
  };

  const renderFollowButton = () => {
    if (!userProfile || isOwnProfile) return null;

    // La personne a envoyé une demande d'abonnement à l'utilisateur actuel
    if (userProfile.is_following === 3) {
      return (
        <div className="flex space-x-2 mt-4">
          <Button 
            onClick={async () => {
              const success = await handleAcceptFollow(userProfile.id);
              if (success) {
                // Rafraîchir les données du profil pour refléter le nouvel état
                refreshProfileData();
              }
            }} 
            variant="default"
          >
            Accepter
          </Button>
          <Button 
            onClick={async () => {
              // Refuser la demande
              const response = await fetch(`http://localhost:80/api/user/decline?user=${userProfile.id}`, {
                method: 'POST',
                credentials: 'include',
              });
              
              if (response.ok) {
                // Rafraîchir les données du profil pour refléter le nouvel état
                refreshProfileData();
              }
            }} 
            variant="outline"
          >
            Refuser
          </Button>
        </div>
      );
    }

    switch (userProfile.is_following) {
      case 0: // Pas d'abonnement
        return userProfile.public ? (
          // Si profil public, bouton simple pour suivre
          <Button onClick={handleFollowToggle} className="mt-4">
            Suivre
          </Button>
        ) : (
          // Si profil privé, bouton pour envoyer une demande
          <Button onClick={handleFollowToggle} className="mt-4">
            Demander à suivre
          </Button>
        );
      case 1: // Déjà abonné
        return (
          <Button onClick={handleFollowToggle} className="mt-4" variant="outline">
            Ne plus suivre
          </Button>
        );
      case 2: // Demande envoyée, en attente
        return (
          <div className="flex space-x-2 mt-4">
            <Button 
              onClick={async () => {
                // Annuler la demande d'abonnement
                try {
                  const response = await fetch(`http://localhost:80/api/user/abort?user=${userProfile.id}`, {
                    method: 'GET',
                    credentials: 'include'
                  });
                  
                  if (response.ok) {
                    // Rafraîchir les données du profil pour refléter le nouvel état
                    setUserProfile({
                      ...userProfile,
                      is_following: 0,
                    });
                  }
                } catch (error) {
                  console.error('Error aborting follow request:', error);
                }
              }} 
              variant="outline"
            >
              Annuler la demande
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  const getInitials = () => {
    if (userProfile?.first_name && userProfile?.last_name) {
      return `${userProfile.first_name[0]}${userProfile.last_name[0]}`.toUpperCase();
    }
    if (userProfile?.username) {
      return userProfile.username[0].toUpperCase();
    }
    return "U";
  };

  return (
    <div className="h-full overflow-auto p-4">
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
            <div className="flex flex-col items-center gap-4">
              <Avatar className="w-24 h-24 border-2 border-primary">
                <AvatarImage
                  src={
                    (userProfile?.public || userProfile?.is_following === 1 || isOwnProfile) && userProfile?.image_url
                      ? `http://localhost:80/api/avatars/${userProfile.image_url}`
                      : undefined
                  }
                  alt={userProfile?.username || "profile"}
                />
                <AvatarFallback className="text-xl">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              {!userProfile?.public && userProfile?.is_following !== 1 && !isOwnProfile && (
                <Badge variant="outline" className="gap-1">
                  <LockIcon size={12} /> Compte privé
                </Badge>
              )}
            </div>

            <div className="flex-1 text-center md:text-left">
              <h1 className="text-2xl font-bold mb-2">
                {userProfile?.first_name || "Prénom"}{" "}
                {userProfile?.last_name || "Nom"}
              </h1>

              {userProfile?.username && (
                <h2 className="text-lg text-muted-foreground mb-4">
                  @{userProfile.username}
                </h2>
              )}

              {/* Afficher la description uniquement si le profil est public, l'utilisateur est abonné, ou c'est le profil de l'utilisateur */}
              {(userProfile?.public || userProfile?.is_following === 1 || isOwnProfile) ? (
                <div className="flex flex-col gap-2 mb-4">
                  <div className="flex items-center gap-2">
                    <MailIcon className="text-muted-foreground h-4 w-4" />
                    <span>
                      {userProfile?.about || "Aucune description disponible."}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="mb-4 text-muted-foreground">
                  Abonnez-vous pour voir plus d'informations
                </div>
              )}

              <div className="flex gap-4 justify-center md:justify-start">
                <div>
                  <div className="text-2xl font-bold">
                    {userProfile?.followers || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Abonnés</div>
                </div>

                <div>
                  <div className="text-2xl font-bold">
                    {userProfile?.following || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Abonnements
                  </div>
                </div>
              </div>

              {renderFollowButton()}

              {isOwnProfile && (
                <div className="flex items-center gap-2 mt-4">
                  <Switch
                    id="public-toggle"
                    checked={userProfile?.public}
                    onCheckedChange={async (checked: boolean) => {
                      const newStatus: boolean = checked;
                      try {
                        const response: Response = await fetch(
                          `http://localhost:80/api/user/public`,
                          { method: "PATCH" }
                        );
                        if (response.ok) {
                          setUserProfile(
                            userProfile
                              ? { ...userProfile, public: newStatus }
                              : null
                          );
                          console.log("Public status updated successfully.");
                        } else {
                          console.error(
                            "Failed to toggle public status. Response not OK."
                          );
                        }
                      } catch (error: unknown) {
                        console.error("Error toggling public status:", error);
                      }
                    }}
                  />
                  <label htmlFor="public-toggle">
                    {userProfile?.public ? "Public" : "Privé"}
                  </label>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="posts">
        <TabsList className="mb-4">
          <TabsTrigger value="posts">Publications</TabsTrigger>
          <TabsTrigger value="followers">Abonnés</TabsTrigger>
          <TabsTrigger value="following">Abonnements</TabsTrigger>
        </TabsList>

        <TabsContent value="posts">
          <Card>
            <CardHeader>
              <CardTitle>Publications</CardTitle>
              <CardDescription>
                Toutes les publications de {userProfile?.first_name || "Prénom"}{" "}
                {userProfile?.last_name || "Nom"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Afficher les publications seulement si le profil est public, l'utilisateur est abonné, ou c'est son propre profil */}
              {(userProfile?.public || userProfile?.is_following === 1 || isOwnProfile) ? (
                userProfile?.id && <UserPostsList userId={userProfile.id} />
              ) : (
                <div className="text-center py-8">
                  <LockIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-2">Compte privé</p>
                  <p className="text-sm text-muted-foreground">
                    Abonnez-vous pour voir les publications de {userProfile?.first_name || "cet utilisateur"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="followers">
          <Card>
            <CardHeader>
              <CardTitle>Abonnés</CardTitle>
              <CardDescription>
                Personnes qui suivent {userProfile?.first_name || "Prénom"}{" "}
                {userProfile?.last_name || "Nom"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Afficher les abonnés seulement si le profil est public, l'utilisateur est abonné, ou c'est son propre profil */}
              {(userProfile?.public || userProfile?.is_following === 1 || isOwnProfile) ? (
                loadingFollowers ? (
                  <div className="flex justify-center p-4">
                    <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
                  </div>
                ) : followers.length > 0 ? (
                  <div className="space-y-2">
                    {followers.map(user => (
                      <Link 
                        href={`/profile?id=${user.user_id}`} 
                        key={user.user_id}
                        className="block transition-transform hover:scale-[1.01] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-lg"
                      >
                        <Card className="overflow-hidden hover:bg-muted/50">
                          <CardContent className="p-4 flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <Avatar>
                                <AvatarImage 
                                  src={user.image ? `http://localhost:80/api/avatars/${user.image}` : undefined} 
                                  alt={user.username || "utilisateur"} 
                                />
                                <AvatarFallback>
                                  {(user.username || user.first_name).substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-semibold">
                                  {user.first_name} {user.last_name}
                                </div>
                                {user.username && (
                                  <p className="text-sm text-muted-foreground">
                                    @{user.username}
                                  </p>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">Pas encore d'abonnés.</p>
                )
              ) : (
                <div className="text-center py-8">
                  <LockIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-2">Compte privé</p>
                  <p className="text-sm text-muted-foreground">
                    Abonnez-vous pour voir les abonnés de {userProfile?.first_name || "cet utilisateur"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="following">
          <Card>
            <CardHeader>
              <CardTitle>Abonnements</CardTitle>
              <CardDescription>
                Personnes que {userProfile?.first_name || "Prénom"}{" "}
                {userProfile?.last_name || "Nom"} suit
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Afficher les abonnements seulement si le profil est public, l'utilisateur est abonné, ou c'est son propre profil */}
              {(userProfile?.public || userProfile?.is_following === 1 || isOwnProfile) ? (
                loadingFollowing ? (
                  <div className="flex justify-center p-4">
                    <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
                  </div>
                ) : following.length > 0 ? (
                  <div className="space-y-2">
                    {following.map(user => (
                      <Link 
                        href={`/profile?id=${user.user_id}`} 
                        key={user.user_id}
                        className="block transition-transform hover:scale-[1.01] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-lg"
                      >
                        <Card className="overflow-hidden hover:bg-muted/50">
                          <CardContent className="p-4 flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <Avatar>
                                <AvatarImage 
                                  src={user.image ? `http://localhost:80/api/avatars/${user.image}` : undefined} 
                                  alt={user.username || "utilisateur"} 
                                />
                                <AvatarFallback>
                                  {(user.username || user.first_name).substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-semibold">
                                  {user.first_name} {user.last_name}
                                </div>
                                {user.username && (
                                  <p className="text-sm text-muted-foreground">
                                    @{user.username}
                                  </p>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">Ne suit personne pour l'instant.</p>
                )
              ) : (
                <div className="text-center py-8">
                  <LockIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-2">Compte privé</p>
                  <p className="text-sm text-muted-foreground">
                    Abonnez-vous pour voir les abonnements de {userProfile?.first_name || "cet utilisateur"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
