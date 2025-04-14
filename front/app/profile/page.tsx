"use client";

import { useAuth } from "@/hooks/user/checkAuth";
import { useRouter, useSearchParams } from "next/navigation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ProfileContent } from "@/components/ProfileContent";
import { LogoutButton } from "@/components/logout-button";
import { ProfileMenuItem } from "@/components/ProfileMenuItem";
import { useUserData } from "@/hooks/user/useUserData";
import Link from "next/link";

export default function ProfilePage() {
  const router = useRouter();
  const { isLoading: authLoading, isAuthenticated } = useAuth({
    required: true,
    redirectTo: "/",
  });

  const { userData, loading: userDataLoading } = useUserData();
  const searchParams = useSearchParams();
  const userId = searchParams.get("id");

  if (authLoading || userDataLoading) {
    return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
    );
  }

  if (!userData) {
    return (
        <div className="container mx-auto py-8">
          <Alert>
            <AlertDescription>Impossible de charger les données utilisateur</AlertDescription>
          </Alert>
        </div>
    );
  }

  const navigateTo = (path: string) => {
    router.push(path);
  };

  return (
      <>
        {isAuthenticated && (
            <div className="grid grid-cols-5 grid-rows-5 gap-4 h-screen">
              <div className="row-span-5 border p-2 flex flex-col justify-between">
                <div className="flex flex-col gap-4">
                  <ul className="space-y-2">
                    <li className="cursor-pointer" onClick={() => navigateTo("/home")}>
                      <div className="px-2 py-1 hover:bg-gray-100 rounded">Home</div>
                    </li>
                    <ProfileMenuItem />
                    <li className="cursor-pointer" onClick={() => navigateTo("/notifications")}>
                      <div className="px-2 py-1 hover:bg-gray-100 rounded">Notifications</div>
                    </li>
                    <li className="cursor-pointer" onClick={() => navigateTo("/messages")}>
                      <div className="px-2 py-1 hover:bg-gray-100 rounded">Messages</div>
                    </li>
                    <li className="cursor-pointer" onClick={() => navigateTo("/groups")}>
                      <div className="px-2 py-1 hover:bg-gray-100 rounded">Groupes</div>
                    </li>
                  </ul>
                </div>
                <div className="flex justify-center mb-4">
                  <LogoutButton />
                </div>
              </div>
              <div className="col-span-3 border p-4">{`Bienvenue, ${userData["username"]} !`}</div>
              <div className="row-span-5 col-start-5 border p-2">3</div>
              <div
                  className="col-span-3 row-span-4 col-start-2 row-start-2 border overflow-hidden"
                  id="main_container"
              >
                <ProfileContent userId={userId || undefined} />
              </div>
            </div>
        )}
      </>
  );

}