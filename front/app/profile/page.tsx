"use client";

import { useAuth } from "@/hooks/user/checkAuth";
import { useSearchParams } from "next/navigation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ProfileContent } from "@/components/ProfileContent";
import { useUserData } from "@/hooks/user/useUserData";
import { MainLayout } from "@/components/MainLayout";

export default function ProfilePage() {
  const { isLoading: authLoading, isAuthenticated } = useAuth({
    required: true,
    redirectTo: "/login",
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
          <AlertDescription>
            Impossible de charger les données utilisateur
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // redirectTo in useAuth will handle this
  }

  return (
    <MainLayout>
      <div className="p-4">
        <ProfileContent userId={userId || undefined} />
      </div>
    </MainLayout>
  );
}
