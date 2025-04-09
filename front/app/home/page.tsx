"use client";
import { useAuth } from "@/hooks/checkAuth";
import { LogoutButton } from "@/components/logout-button";
import { useUserData } from "@/hooks/useUserData";

export default function HomePage() {
  const { userData, loading: userDataLoading } = useUserData();
  const { isLoading: authLoading, isAuthenticated } = useAuth({
    required: true,
    redirectTo: "/",
  });

  if (authLoading || userDataLoading) {
    return <div>Loading...</div>;
  }

  // Si userData est null ou undefined, on affiche un message d'erreur
  if (!userData) {
    return <div>Impossible de charger les données utilisateur</div>;
  }

  return (
    <>
      {isAuthenticated && (
        <div className="grid grid-cols-5 grid-rows-5 gap-4">
          <div className="row-span-5 border">
            <ul>
              <li>{userData.username}</li>
              <li>2</li>
              <li>3</li>
              <li>4</li>
              <li>
                <LogoutButton />
              </li>
            </ul>
          </div>
          <div className="col-span-3 border">{`Bienvenue, ${userData.username} !`}</div>
          <div className="row-span-5 col-start-5 border">3</div>
          <div
            className="col-span-3 row-span-4 col-start-2 row-start-2 border"
            id="main"
          >
            4
          </div>
        </div>
      )}
    </>
  );
}
