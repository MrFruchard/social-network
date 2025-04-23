"use client";

import { useAuth } from "@/hooks/user/checkAuth";
import { useUserData } from "@/hooks/user/useUserData";
import TwitterLikeFeed from "@/components/feed";
import { useState } from "react";
import { MainLayout } from "@/components/MainLayout";
import PostModal from "@/components/PostModal";

export default function HomePage() {
  const { userData, loading: userDataLoading } = useUserData();
  const { isLoading: authLoading, isAuthenticated } = useAuth({
    required: true,
    redirectTo: "/login",
  });
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openPostForm = () => {
    setIsModalOpen(true);
  };

  const closePostForm = () => {
    setIsModalOpen(false);
  };

  if (authLoading || userDataLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="flex items-center justify-center h-screen">
        Impossible de charger les données utilisateur
      </div>
    );
  }

  return (
    <MainLayout>
      <div className="p-4">
        <div className="border-b border-border pb-4 mb-4">
          <button
            className="w-full bg-muted hover:bg-muted/80 rounded-lg p-4 text-left text-muted-foreground cursor-pointer transition-colors"
            onClick={openPostForm}
          >
            What's happening????
          </button>
        </div>

        <TwitterLikeFeed />
      </div>

      {isModalOpen && <PostModal onClose={closePostForm} />}
    </MainLayout>
  );
}
