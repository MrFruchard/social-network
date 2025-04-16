"use client";

import { useAuth } from "@/hooks/user/checkAuth";
import { useUserData } from "@/hooks/user/useUserData";
import TwitterLikeFeed from "@/components/feed";
import { useState } from "react";
import { MainLayout } from "@/components/MainLayout";

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
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!userData) {
    return <div className="flex items-center justify-center h-screen">Impossible de charger les données utilisateur</div>;
  }

  return (
    <MainLayout>
      <div className="p-4">
        <div className="border-b border-border pb-4 mb-4">
          <h2 className="text-xl font-bold mb-2">Home</h2>
          <button
            className="w-full bg-muted hover:bg-muted/80 rounded-lg p-4 text-left text-muted-foreground cursor-pointer transition-colors"
            onClick={openPostForm}
          >
            What's happening?
          </button>
        </div>
        
        <TwitterLikeFeed />
      </div>
      
      {isModalOpen && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black/60 z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              closePostForm();
            }
          }}
        >
          <div className="bg-background text-foreground p-6 rounded-lg shadow-xl max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Create a New Post</h2>
            <form id="post-form" className="flex flex-col gap-4">
              <textarea
                placeholder="What's on your mind?"
                className="bg-transparent border border-border p-3 rounded-lg min-h-[100px] focus:outline-none focus:ring-1 focus:ring-primary"
                required
              ></textarea>
              <input
                type="file"
                accept="image/gif, image/jpeg, image/png"
                className="border border-border p-2 rounded-lg"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={closePostForm}
                  className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Post
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </MainLayout>
  );
}