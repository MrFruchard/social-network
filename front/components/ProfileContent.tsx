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
  is_following: number; // 0: Not Following, 1: Following, 2: Waiting
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

const handleFollow = async () => {
  const requestOptions = {
    method: "POST",
    credentials: "include" as RequestCredentials,
  };

  const user_id = new URL(location.href).searchParams.get("id");

  try {
    const response = await fetch(
      `http://localhost:80/api/user/follow?user=${user_id}`,
      requestOptions
    );
    const result = await response.text();
    console.log(result);
  } catch (error) {
    console.log("error", error);
  }
};

const handleAcceptFollow = async () => {
  const requestOptions = {
    method: "POST",
  };

  const user_id = new URL(location.href).searchParams.get("id");

  try {
    const response = await fetch(
      `http://localhost:80/api/user/agree?user=${user_id}`,
      requestOptions
    );
    const result = await response.text();
    console.log(result);
  } catch (error) {
    console.log("error", error);
  }
};

const handleUnfollow = async () => {
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  const raw = JSON.stringify({});

  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow" as RequestRedirect,
  };

  const user_id = new URL(location.href).searchParams.get("id");

  try {
    const response = await fetch(
      `http://localhost:80/api/user/unfollow?user=${user_id}`,
      requestOptions
    );
    const result = await response.text();
    console.log(result);
  } catch (error) {
    console.log("error", error);
  }
};

export function ProfileContent({ userId }: { userId?: string }) {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const isOwnProfile = !userId;

  useEffect(() => {
    const fetchUserProfile = async () => {
      const requestOptions = {
        method: "GET",
        redirect: "follow" as RequestRedirect,
      };

      try {
        const response = await fetch(
          `http://localhost:80/api/user/${userId}`,
          requestOptions
        );
        const data = await response.json();
        console.log(data);
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

  const handleFollowToggle = async () => {
    if (!userProfile) return;

    if (userProfile.is_following === 1) {
      await handleUnfollow();
      setUserProfile({
        ...userProfile,
        is_following: 0,
        followers: userProfile.followers - 1,
      });
    } else if (userProfile.is_following === 0) {
      if (userProfile.public) {
        await handleFollow();
        setUserProfile({
          ...userProfile,
          is_following: 1,
          followers: userProfile.followers + 1,
        });
      } else {
        await handleFollow();
        setUserProfile({
          ...userProfile,
          is_following: 2,
        });
      }
    }
  };

  const renderFollowButton = () => {
    if (!userProfile || isOwnProfile) return null;

    switch (userProfile.is_following) {
      case 0:
        return (
          <Button onClick={handleFollowToggle} className="mt-4">
            Suivre
          </Button>
        );
      case 1:
        return (
          <Button onClick={handleFollowToggle} className="mt-4">
            Ne plus suivre
          </Button>
        );
      case 2:
        return (
          <Button disabled className="mt-4">
            En attente
          </Button>
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
                    userProfile?.image_url
                      ? `http://localhost:80/api/avatars/${userProfile.image_url}`
                      : undefined
                  }
                  alt={userProfile?.username || "profile"}
                />
                <AvatarFallback className="text-xl">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
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

              <div className="flex flex-col gap-2 mb-4">
                <div className="flex items-center gap-2">
                  <MailIcon className="text-muted-foreground h-4 w-4" />
                  <span>
                    {userProfile?.about || "Aucune description disponible."}
                  </span>
                </div>
              </div>

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
              {userProfile?.id && <UserPostsList userId={userProfile.id} />}
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
              <p className="text-muted-foreground">Pas encore d'abonnés.</p>
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
              <p className="text-muted-foreground">
                Ne suit personne pour l'instant.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
