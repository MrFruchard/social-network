import { Button } from "@/components/ui/button";
import { UserProfile, FollowStatus } from "@/types/profile";

interface FollowButtonProps {
  userProfile: UserProfile;
  isOwnProfile: boolean;
  onFollowToggle: () => void;
  onAcceptFollow: () => void;
  onDeclineFollow: () => void;
  onAbortFollow: () => void;
}

export function FollowButton({ 
  userProfile, 
  isOwnProfile, 
  onFollowToggle, 
  onAcceptFollow, 
  onDeclineFollow, 
  onAbortFollow 
}: FollowButtonProps) {
  if (!userProfile || isOwnProfile) return null;

  // Demande de suivi reçue
  if (userProfile.is_following === FollowStatus.RECEIVED_REQUEST) {
    return (
      <div className="flex space-x-2 mt-4">
        <Button onClick={onAcceptFollow} variant="default">
          Accepter
        </Button>
        <Button onClick={onDeclineFollow} variant="outline">
          Refuser
        </Button>
      </div>
    );
  }

  switch (userProfile.is_following) {
    case FollowStatus.NOT_FOLLOWING:
      return (
        <Button onClick={onFollowToggle} className="mt-4">
          {userProfile.public ? "Suivre" : "Demander à suivre"}
        </Button>
      );

    case FollowStatus.FOLLOWING:
      return (
        <Button onClick={onFollowToggle} className="mt-4" variant="outline">
          Ne plus suivre
        </Button>
      );

    case FollowStatus.WAITING:
      return (
        <div className="flex space-x-2 mt-4">
          <Button onClick={onAbortFollow} variant="outline">
            Annuler la demande
          </Button>
        </div>
      );

    default:
      return null;
  }
}