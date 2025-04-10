"use client";

import { useRouter } from "next/navigation";
import { UserIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUserData } from "@/hooks/user/useUserData";

export function ProfileMenuItem() {
  const router = useRouter();
  const { userData, loading } = useUserData();

  const navigateToProfile = () => {
    router.push("/profile");
  };

  const getInitials = () => {
    if (!userData) return "U";

    if (userData["firstName"] && userData["lastName"]) {
      return `${userData["firstName"][0]}${userData["lastName"][0]}`.toUpperCase();
    }
    if (userData["username"]) {
      return userData["username"][0].toUpperCase();
    }
    return "U";
  };

  return (
      <li className="cursor-pointer" onClick={navigateToProfile}>
        <div className="flex items-center gap-3 px-2 py-1 hover:bg-gray-100 rounded">
          {loading ? (
              <>
                <div className="w-6 h-6 rounded-full bg-gray-200 animate-pulse"></div>
                <span>Profil</span>
              </>
          ) : (
              <>
                {userData && userData["image"] ? (
                    <Avatar className="h-6 w-6">
                      <AvatarImage
                          src={`http://localhost:80/api/avatars/${userData["image"]}`}
                          alt="Profile"
                      />
                      <AvatarFallback>{getInitials()}</AvatarFallback>
                    </Avatar>
                ) : (
                    <UserIcon className="h-5 w-5" />
                )}
                <span>Profil</span>
              </>
          )}
        </div>
      </li>
  );
}