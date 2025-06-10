import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { LockIcon, MailIcon, CalendarIcon, UserIcon } from "lucide-react";
import { UserProfile } from "@/types/profile";

interface ProfileHeaderProps {
  userProfile: UserProfile;
  isOwnProfile: boolean;
  onTogglePrivacy: () => void;
}

export function ProfileHeader({ userProfile, isOwnProfile, onTogglePrivacy }: ProfileHeaderProps) {
  const getInitials = () => {
    if (userProfile?.first_name && userProfile?.last_name) {
      return `${userProfile.first_name[0]}${userProfile.last_name[0]}`.toUpperCase();
    }
    if (userProfile?.username) {
      return userProfile.username[0].toUpperCase();
    }
    return "U";
  };

  const canViewDetails = userProfile?.public || userProfile?.is_following === 1 || isOwnProfile;

  return (
    <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
      <div className="flex flex-col items-center gap-4">
        <Avatar className="w-24 h-24 border-2 border-primary">
          <AvatarImage
            src={
              canViewDetails && userProfile?.image_url
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

        {canViewDetails ? (
          <div className="flex flex-col gap-2 mb-4">
            <div className="flex items-center gap-2">
              <MailIcon className="text-muted-foreground h-4 w-4" />
              <span>{userProfile?.email || "Aucun email disponible"}</span>
            </div>

            <div className="flex items-center gap-2">
              <CalendarIcon className="text-muted-foreground h-4 w-4" />
              <span>
                {userProfile?.date_of_birth 
                  ? new Date(userProfile.date_of_birth).toLocaleDateString() 
                  : "Aucune date de naissance disponible"}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <UserIcon className="text-muted-foreground h-4 w-4" />
              <span>{userProfile?.about || "Aucune description disponible."}</span>
            </div>
          </div>
        ) : (
          <div className="mb-4 text-muted-foreground">
            Abonnez-vous pour voir plus d'informations
          </div>
        )}

        <div className="flex gap-4 justify-center md:justify-start">
          <div>
            <div className="text-2xl font-bold">{userProfile?.followers || 0}</div>
            <div className="text-sm text-muted-foreground">Abonnés</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{userProfile?.following || 0}</div>
            <div className="text-sm text-muted-foreground">Abonnements</div>
          </div>
        </div>

        {isOwnProfile && (
          <div className="flex items-center gap-2 mt-4">
            <Switch
              id="public-toggle"
              checked={userProfile?.public}
              onCheckedChange={onTogglePrivacy}
            />
            <label htmlFor="public-toggle">
              {userProfile?.public ? "Public" : "Privé"}
            </label>
          </div>
        )}
      </div>
    </div>
  );
}