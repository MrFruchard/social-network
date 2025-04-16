"use client";
import { useAuth } from "@/hooks/user/checkAuth";
import { LogoutButton } from "@/components/logout-button";
import { useUserData } from "@/hooks/user/useUserData";
import { createPost } from "@/api/post/postApi";
import TwitterLikeFeed from "@/components/feed";
import { ProfileMenuItem } from "@/components/ProfileMenuItem";
import { useState } from "react";

export default function HomePage() {
  const { userData, loading: userDataLoading } = useUserData();
  const { isLoading: authLoading, isAuthenticated } = useAuth({
    required: true,
    redirectTo: "/login", // Rediriger vers /login au lieu de / pour éviter les boucles
  });
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openPostForm = () => {
    setIsModalOpen(true);
  };

  const closePostForm = () => {
    setIsModalOpen(false);
  };

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
        <div className="grid grid-cols-5 grid-rows-5 gap-4 h-screen">
          <div className="row-span-5 border p-2 flex flex-col justify-between">
            <div className="flex flex-col gap-4">
              <ul className="space-y-2">
                <li className="px-2 py-1 hover:bg-gray-100 rounded cursor-pointer">
                  Home
                </li>
                <ProfileMenuItem />
                <li className="px-2 py-1 hover:bg-gray-100 rounded cursor-pointer">
                  Notifications
                </li>
                <li className="px-2 py-1 hover:bg-gray-100 rounded cursor-pointer">
                  Messages
                </li>
                <li className="px-2 py-1 hover:bg-gray-100 rounded cursor-pointer">
                  Groupes
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
            className={`col-span-3 row-span-4 col-start-2 row-start-2 border overflow-scroll transition ${
              isModalOpen ? "opacity-50 pointer-events-none" : ""
            }`}
            id="main_container"
          >
            <TwitterLikeFeed />
          </div>
          <button
            className="absolute bottom-4 right-4 bg-blue-500 text-white px-4 py-2 rounded shadow"
            onClick={openPostForm}
          >
            New Post
          </button>
          {isModalOpen && (
            <div
              className="fixed inset-0 flex items-center justify-center bg-black/60 px-4 py-2 rounded shadow transition"
              id="modal"
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  closePostForm();
                }
              }}
            >
              <div className="bg-white p-4 rounded shadow-md">
                <h2 className="text-xl font-bold mb-4">Create a New Post</h2>
                <form id="post-form" className="flex flex-col gap-4">
                  <textarea
                    placeholder="Content"
                    className="border p-2 rounded"
                    required
                  ></textarea>
                  <input
                    type="file"
                    accept="image/gif, image/jpeg, image/png"
                    className="border p-2 rounded"
                  />
                  <button
                    type="submit"
                    className="bg-blue-500 text-white px-4 py-2 rounded shadow"
                  >
                    Submit
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
