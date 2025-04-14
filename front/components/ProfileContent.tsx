"use client";

import { useAuth } from "@/hooks/user/checkAuth";
import { useSearchParams } from "next/navigation";
import { useProfile } from "@/hooks/user/useProfile";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CalendarIcon, UserIcon, MailIcon, ClockIcon, LockIcon, LockOpenIcon } from "lucide-react";
import { UserPostsList } from "@/components/UserPostsList";

function formatDate(dateString: string) {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString();
}

export function ProfileContent({ userId }: { userId?: string }) {
  const { 
    profileData: profile, 
    loading, 
    error, 
    accessDenied,
    togglePrivacy,
    requestFollow
  } = useProfile(userId);
  
  const isOwner = profile?.isCurrentUser || false;
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (accessDenied) {
    return (
      <div className="p-4">
        <Alert>
          <div className="flex flex-col gap-4">
            <AlertDescription>
              Ce profil est privé. Vous devez suivre cet utilisateur pour voir son contenu.
            </AlertDescription>
            <Button onClick={() => requestFollow()}>Demander à suivre</Button>
          </div>
        </Alert>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-4">
        <Alert>
          <AlertDescription>Profil introuvable</AlertDescription>
        </Alert>
      </div>
    );
  }

  const getInitials = () => {
    if (profile.first_name && profile.last_name) {
      return `${profile.first_name[0]}${profile.last_name[0]}`.toUpperCase();
    }
    if (profile.username) {
      return profile.username[0].toUpperCase();
    }
    return "U";
  };

  const handleTogglePrivacy = async () => {
    try {
      await togglePrivacy();
    } catch (err) {
      console.error("Failed to toggle privacy", err);
    }
  };

  return (
    <div className="h-full overflow-auto p-4">
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
            <div className="flex flex-col items-center gap-4">
              <Avatar className="w-24 h-24 border-2 border-primary">
                <AvatarImage src={profile.avatar ? `http://localhost:80/api/avatars/${profile.avatar}` : undefined} alt={profile.username || "profile"} />
                <AvatarFallback className="text-xl">{getInitials()}</AvatarFallback>
              </Avatar>
              
              {isOwner && (
                <div className="flex flex-col gap-2 items-center">
                  <div className="flex items-center gap-2">
                    <Switch 
                      checked={profile.public} 
                      onCheckedChange={() => {
                        // Toggle local UI state immediately for better UX
                        const newState = !profile.public;
                        console.log("Interface: Basculement immédiat vers", newState ? "public" : "privé");
                        
                        // Then call backend
                        handleTogglePrivacy();
                      }} 
                    />
                    <span className="text-sm font-medium">
                      {profile.public ? "Profil Public" : "Profil Privé"}
                    </span>
                  </div>
                  <Badge variant={profile.public ? "outline" : "secondary"}>
                    {profile.public ? <LockOpenIcon className="h-3 w-3 mr-1" /> : <LockIcon className="h-3 w-3 mr-1" />}
                    {profile.public ? "Public" : "Privé"}
                  </Badge>
                  
                  {/* Debug info */}
                  <div className="mt-2 p-2 bg-gray-100 rounded text-xs">
                    <div>État actuel: {String(profile.public)}</div>
                    <button 
                      onClick={() => console.log('Profile data:', profile)} 
                      className="underline text-blue-500"
                    >
                      Log données
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-2xl font-bold mb-2">
                {profile.first_name} {profile.last_name}
              </h1>
              
              {profile.username && (
                <h2 className="text-lg text-muted-foreground mb-4">@{profile.username}</h2>
              )}
              
              <div className="flex flex-col gap-2 mb-4">
                {/* Afficher les données du rôle si disponible */}
                {/*<div className="flex items-center gap-2">
                  <UserIcon className="text-muted-foreground h-4 w-4" />
                  <span>{profile.role}</span>
                </div>*/}
                
                <div className="flex items-center gap-2">
                  <MailIcon className="text-muted-foreground h-4 w-4" />
                  <span>{profile.email}</span>
                </div>
                
                {/* Afficher la date de naissance si disponible */}
                {/*profile.date_of_birth && (
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="text-muted-foreground h-4 w-4" />
                    <span>Né(e) le {formatDate(profile.date_of_birth)}</span>
                  </div>
                )*/}
                
                {profile.created_at && (
                  <div className="flex items-center gap-2">
                    <ClockIcon className="text-muted-foreground h-4 w-4" />
                    <span>Membre depuis {formatDate(profile.created_at)}</span>
                  </div>
                )}
              </div>
              
              <div className="flex gap-4 justify-center md:justify-start">
                <div>
                  <div className="text-2xl font-bold">{profile.follower_count}</div>
                  <div className="text-sm text-muted-foreground">Abonnés</div>
                </div>
                
                <div>
                  <div className="text-2xl font-bold">{profile.following_count}</div>
                  <div className="text-sm text-muted-foreground">Abonnements</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Afficher la section À propos si disponible */}
      {/*profile.about_me && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>À propos</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{profile.about_me}</p>
          </CardContent>
        </Card>
      )*/}
      
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
                Toutes les publications de {profile.first_name} {profile.last_name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UserPostsList userId={profile.id} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="followers">
          <Card>
            <CardHeader>
              <CardTitle>Abonnés</CardTitle>
              <CardDescription>
                Personnes qui suivent {profile.first_name} {profile.last_name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Pas encore d'abonnés.</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="following">
          <Card>
            <CardHeader>
              <CardTitle>Abonnements</CardTitle>
              <CardDescription>
                Personnes que {profile.first_name} {profile.last_name} suit
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Ne suit personne pour l'instant.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}