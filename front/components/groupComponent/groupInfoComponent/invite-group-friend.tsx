// components/groupComponent/groupInfoComponent/followers-list-with-invite.tsx
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

interface Follower {
    id: string;
    username: string;
    first_name: string;
    last_name: string;
    image_profile_url?: string | null;
}

interface FollowersListProps {
    groupId: string;
}

export function FollowersListWithInvite({ groupId }: FollowersListProps) {
    const [followers, setFollowers] = useState<Follower[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFollowers = async () => {
            try {
                const res = await fetch("/api/user/followers", { credentials: "include" });
                const data = await res.json();
                if (Array.isArray(data)) {
                    setFollowers(data);
                } else {
                    throw new Error("Format inattendu");
                }
            } catch (error) {
                console.error("Erreur chargement followers :", error);
            } finally {
                setLoading(false);
            }
        };

        fetchFollowers();
    }, []);

    const handleInvite = async (userId: string) => {
        try {
            const res = await fetch(`/api/group/invite?groupId=${groupId}&userId=${userId}`, {
                method: "POST",
                credentials: "include",
            });
            if (!res.ok) throw new Error("Erreur lors de l'invitation");
            alert("Invitation envoyée !");
        } catch (error) {
            console.error("Erreur d'invitation :", error);
            alert("Échec de l'invitation.");
        }
    };

    if (loading) return <p>Chargement des followers...</p>;

    return (
        <div className="mt-4 border-t pt-4 space-y-3">
            <h3 className="text-lg font-semibold mb-2">Inviter des followers</h3>
            {followers.length === 0 ? (
                <p className="text-gray-500">Aucun follower à afficher.</p>
            ) : (
                followers.map((follower) => (
                    <div key={follower.id} className="flex items-center justify-between bg-gray-50 p-3 rounded shadow-sm">
                        <div className="flex items-center gap-3">
                            {follower.image_profile_url ? (
                                <img
                                    src={`http://localhost/api/profileImages/${follower.image_profile_url}`}
                                    alt={follower.username}
                                    className="w-10 h-10 rounded-full object-cover"
                                />
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-gray-400 flex items-center justify-center text-white font-bold">
                                    {follower.first_name.charAt(0)}
                                </div>
                            )}
                            <div>
                                <p className="font-medium">{follower.first_name} {follower.last_name}</p>
                                <p className="text-sm text-gray-500">@{follower.username}</p>
                            </div>
                        </div>
                        <Button onClick={() => handleInvite(follower.id)} className="px-4 py-2">
                            Inviter
                        </Button>
                    </div>
                ))
            )}
        </div>
    );
}