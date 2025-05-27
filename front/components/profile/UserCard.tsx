import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { FollowUser } from "@/types/profile";

interface UserCardProps {
  user: FollowUser;
}

export function UserCard({ user }: UserCardProps) {
  const getInitials = () => {
    if (user.first_name && user.last_name) {
      return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
    }
    if (user.username) {
      return user.username[0].toUpperCase();
    }
    return "U";
  };

  return (
    <Link 
      href={`/profile?id=${user.user_id}`} 
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
                {getInitials()}
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
  );
}