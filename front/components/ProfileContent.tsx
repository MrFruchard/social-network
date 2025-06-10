"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserPostsList } from "@/components/UserPostsList";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { FollowButton } from "@/components/profile/FollowButton";
import { UserCard } from "@/components/profile/UserCard";
import { PrivateProfileMessage } from "@/components/profile/PrivateProfileMessage";
import { useProfileManagement } from "@/hooks/user/useProfileManagement";
import { PROFILE_CONSTANTS } from "@/constants/profile";
import React from "react";



export function ProfileContent({ userId }: { userId?: string }) {
  const {
    userProfile,
    followers,
    following,
    loadingProfile,
    loadingFollowers,
    loadingFollowing,
    error,
    isOwnProfile,
    handleFollowToggle,
    handleAcceptFollow,
    handleDeclineFollow,
    handleAbortFollow,
    handleTogglePrivacy,
    clearError
  } = useProfileManagement(userId);

  const canViewContent = userProfile?.public || userProfile?.is_following === 1 || isOwnProfile;

  if (loadingProfile) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 mb-4">{error}</p>
        <button onClick={clearError} className="text-primary hover:underline">
          Réessayer
        </button>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Profil non trouvé</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto p-4">
      <Card className="mb-8">
        <CardContent className="p-6">
          <ProfileHeader 
            userProfile={userProfile}
            isOwnProfile={isOwnProfile}
            onTogglePrivacy={handleTogglePrivacy}
          />
          <FollowButton
            userProfile={userProfile}
            isOwnProfile={isOwnProfile}
            onFollowToggle={handleFollowToggle}
            onAcceptFollow={handleAcceptFollow}
            onDeclineFollow={handleDeclineFollow}
            onAbortFollow={handleAbortFollow}
          />
        </CardContent>
      </Card>

      <Tabs defaultValue="posts">
        <TabsList className="mb-4">
          <TabsTrigger value="posts">{PROFILE_CONSTANTS.LABELS.POSTS}</TabsTrigger>
          <TabsTrigger value="followers">{PROFILE_CONSTANTS.LABELS.FOLLOWERS}</TabsTrigger>
          <TabsTrigger value="following">{PROFILE_CONSTANTS.LABELS.FOLLOWING}</TabsTrigger>
        </TabsList>

        <TabsContent value="posts">
          <Card>
            <CardHeader>
              <CardTitle>{PROFILE_CONSTANTS.LABELS.POSTS}</CardTitle>
              <CardDescription>
                Toutes les publications de {userProfile?.first_name || "Prénom"}{" "}
                {userProfile?.last_name || "Nom"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {canViewContent ? (
                userProfile?.id && <UserPostsList userId={userProfile.id} />
              ) : (
                <PrivateProfileMessage 
                  userName={userProfile?.first_name}
                  context="posts"
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="followers">
          <Card>
            <CardHeader>
              <CardTitle>{PROFILE_CONSTANTS.LABELS.FOLLOWERS}</CardTitle>
              <CardDescription>
                Personnes qui suivent {userProfile?.first_name || "Prénom"}{" "}
                {userProfile?.last_name || "Nom"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {canViewContent ? (
                loadingFollowers ? (
                  <div className="flex justify-center p-4">
                    <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
                  </div>
                ) : followers.length > 0 ? (
                  <div className="space-y-2">
                    {followers.map(user => (
                      <UserCard key={user.user_id} user={user} />
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">{PROFILE_CONSTANTS.MESSAGES.NO_FOLLOWERS}</p>
                )
              ) : (
                <PrivateProfileMessage 
                  userName={userProfile?.first_name}
                  context="followers"
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="following">
          <Card>
            <CardHeader>
              <CardTitle>{PROFILE_CONSTANTS.LABELS.FOLLOWING}</CardTitle>
              <CardDescription>
                Personnes que {userProfile?.first_name || "Prénom"}{" "}
                {userProfile?.last_name || "Nom"} suit
              </CardDescription>
            </CardHeader>
            <CardContent>
              {canViewContent ? (
                loadingFollowing ? (
                  <div className="flex justify-center p-4">
                    <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
                  </div>
                ) : following.length > 0 ? (
                  <div className="space-y-2">
                    {following.map(user => (
                      <UserCard key={user.user_id} user={user} />
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">{PROFILE_CONSTANTS.MESSAGES.NO_FOLLOWING}</p>
                )
              ) : (
                <PrivateProfileMessage 
                  userName={userProfile?.first_name}
                  context="following"
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
