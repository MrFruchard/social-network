"use client";

import { useAuth } from "@/hooks/user/checkAuth";
import { useProfile } from "@/hooks/user/useProfile";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CalendarIcon, UserIcon, MailIcon, ClockIcon, LockIcon, LockOpenIcon } from "lucide-react";

function formatDate(dateString: string) {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString();
}

export function ProfileContent({ userId }: { userId?: string }) {
  const { profile, loading, error, isOwner, togglePrivacy } = useProfile(userId);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
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
          <AlertDescription>Profile not found</AlertDescription>
        </Alert>
      </div>
    );
  }

  const getInitials = () => {
    if (profile.firstName && profile.lastName) {
      return `${profile.firstName[0]}${profile.lastName[0]}`.toUpperCase();
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
                <AvatarImage src={profile.image ? `http://localhost:80/api/avatars/${profile.image}` : undefined} alt={profile.username || "profile"} />
                <AvatarFallback className="text-xl">{getInitials()}</AvatarFallback>
              </Avatar>
              
              {isOwner && (
                <div className="flex flex-col gap-2 items-center">
                  <div className="flex items-center gap-2">
                    <Switch checked={profile.isPublic} onCheckedChange={handleTogglePrivacy} />
                    <span className="text-sm font-medium">
                      {profile.isPublic ? "Public Profile" : "Private Profile"}
                    </span>
                  </div>
                  <Badge variant={profile.isPublic ? "outline" : "secondary"}>
                    {profile.isPublic ? <LockOpenIcon className="h-3 w-3 mr-1" /> : <LockIcon className="h-3 w-3 mr-1" />}
                    {profile.isPublic ? "Public" : "Private"}
                  </Badge>
                </div>
              )}
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-2xl font-bold mb-2">
                {profile.firstName} {profile.lastName}
              </h1>
              
              {profile.username && (
                <h2 className="text-lg text-muted-foreground mb-4">@{profile.username}</h2>
              )}
              
              <div className="flex flex-col gap-2 mb-4">
                <div className="flex items-center gap-2">
                  <UserIcon className="text-muted-foreground h-4 w-4" />
                  <span>{profile.role}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <MailIcon className="text-muted-foreground h-4 w-4" />
                  <span>{profile.email}</span>
                </div>
                
                {profile.dateOfBirth && (
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="text-muted-foreground h-4 w-4" />
                    <span>Born on {formatDate(profile.dateOfBirth)}</span>
                  </div>
                )}
                
                <div className="flex items-center gap-2">
                  <ClockIcon className="text-muted-foreground h-4 w-4" />
                  <span>Member since {formatDate(profile.createdAt)}</span>
                </div>
              </div>
              
              <div className="flex gap-4 justify-center md:justify-start">
                <div>
                  <div className="text-2xl font-bold">{profile.followerCount}</div>
                  <div className="text-sm text-muted-foreground">Followers</div>
                </div>
                
                <div>
                  <div className="text-2xl font-bold">{profile.followingCount}</div>
                  <div className="text-sm text-muted-foreground">Following</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {profile.aboutMe && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>About</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{profile.aboutMe}</p>
          </CardContent>
        </Card>
      )}
      
      <Tabs defaultValue="posts">
        <TabsList className="mb-4">
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="followers">Followers</TabsTrigger>
          <TabsTrigger value="following">Following</TabsTrigger>
        </TabsList>
        
        <TabsContent value="posts">
          <Card>
            <CardHeader>
              <CardTitle>Posts</CardTitle>
              <CardDescription>
                All posts from {profile.firstName} {profile.lastName}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">No posts yet.</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="followers">
          <Card>
            <CardHeader>
              <CardTitle>Followers</CardTitle>
              <CardDescription>
                People who follow {profile.firstName} {profile.lastName}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">No followers yet.</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="following">
          <Card>
            <CardHeader>
              <CardTitle>Following</CardTitle>
              <CardDescription>
                People {profile.firstName} {profile.lastName} follows
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Not following anyone yet.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}