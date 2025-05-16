"use client";

import { useRouter } from "next/navigation";
import { use, useState } from "react";
import { Button } from "./ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { Lock } from "lucide-react";
import { useUserData } from "@/hooks/user/useUserData";

interface UserLinkProps {
  userId: string;
  username: string;
  isPrivate?: boolean;
  className?: string;
  showPrivateIcon?: boolean;
}

export default function UserLink({
  userId,
  username,
  isPrivate = false,
  className = "",
  showPrivateIcon = true,
}: UserLinkProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const {
    userData,
    loading,
    error: userError,
  } = useUserData() as {
    userData: { id: string } | null;
    loading: boolean;
    error: string | null;
  };

  const handleClick = async () => {
    try {
      // Log pour déboguer l'ID utilisateur
      console.log("UserLink clicked with userId:", userId);
      console.log(
        "Current userId:",
        userData ? userData.id : "No user data available"
      );
      if (userId !== userData?.id) {
        router.push(`/profile?id=${userId}`);
      } else {
        router.push("/profile");
      }
    } catch (err) {
      setError("Impossible d'accéder à ce profil");
      setTimeout(() => setError(null), 3000);
    }
  };

  if (isPrivate && showPrivateIcon) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="link"
              className={`p-0 h-auto flex items-center gap-1 ${className}`}
              onClick={handleClick}
            >
              {username} <Lock className="h-3 w-3" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Profil privé</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <>
      <Button
        variant="link"
        className={`p-0 h-auto ${className}`}
        onClick={handleClick}
      >
        {username}
      </Button>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </>
  );
}
