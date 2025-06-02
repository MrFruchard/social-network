import { LockIcon } from "lucide-react";

interface PrivateProfileMessageProps {
  userName?: string;
  context: "posts" | "followers" | "following";
}

export function PrivateProfileMessage({ userName, context }: PrivateProfileMessageProps) {
  const getContextMessage = () => {
    switch (context) {
      case "posts":
        return `Abonnez-vous pour voir les publications de ${userName || "cet utilisateur"}`;
      case "followers":
        return `Abonnez-vous pour voir les abonnés de ${userName || "cet utilisateur"}`;
      case "following":
        return `Abonnez-vous pour voir les abonnements de ${userName || "cet utilisateur"}`;
      default:
        return `Abonnez-vous pour voir le contenu de ${userName || "cet utilisateur"}`;
    }
  };

  return (
    <div className="text-center py-8">
      <LockIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
      <p className="text-muted-foreground mb-2">Compte privé</p>
      <p className="text-sm text-muted-foreground">
        {getContextMessage()}
      </p>
    </div>
  );
}