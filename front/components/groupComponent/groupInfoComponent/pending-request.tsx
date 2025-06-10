"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface Request {
    id: string;
    first_name: string;
    last_name: string;
    username: string;
    image?: string | null;
}

interface PendingRequestsProps {
    groupId: string;
}

export function PendingRequests({ groupId }: PendingRequestsProps) {
    const [requests, setRequests] = useState<Request[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                const res = await fetch(`/api/group/ask?groupId=${groupId}`, {
                    credentials: "include",
                });

                const data = await res.json();
                console.log("Données reçues depuis /api/group/ask :", data); // 👈 LOG ICI

                setRequests(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error("Erreur lors du chargement des demandes :", err);
            } finally {
                setLoading(false);
            }
        };

        fetchRequests();
    }, [groupId]);

    const handleAccept = async (userId: string) => {
        try {
            const res = await fetch(`/api/group/acceptAsk?groupId=${groupId}&userId=${userId}`, {
                method: "POST",
                credentials: "include",
            });
            if (!res.ok) {
                const errorMessage = await res.text();
                throw new Error(errorMessage || "Erreur lors de l'acceptation");
            }
            setRequests(prev => prev.filter(user => user.id !== userId));
        } catch (err) {
            console.error(err);
            // @ts-ignore
            alert("Impossible d'accepter la demande : " + err.message);
        }
    };


    const goToProfile = (userId: string) => {
        router.push(`/profile?id=${userId}`);
    };

    if (loading) return <p className="mt-4">Chargement des demandes...</p>;
    if (requests.length === 0) return <p className="mt-4">Aucune demande en attente.</p>;

    return (
        <div className="mt-6 space-y-4 border-t pt-4">
            <h3 className="text-lg font-semibold">Demandes en attente :</h3>
            {requests.map((user) => (
                <div key={`${user.id}-${user.username}`} className="flex items-center justify-between border p-2 rounded">
                    <div
                        className="flex items-center gap-3 cursor-pointer"
                        onClick={() => goToProfile(user.id)}
                    >
                        {user.image ? (
                            <img
                                src={`/api/avatars/${user.image}`}
                                alt={`Avatar de ${user.username}`}
                                className="w-10 h-10 rounded-full object-cover"
                            />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center font-bold text-gray-700 uppercase">
                                {user.first_name.charAt(0)}
                            </div>
                        )}
                        <div>
                            <p className="font-medium">{user.first_name} {user.last_name}</p>
                            <p className="text-sm text-gray-500 hover:underline">@{user.username}</p>
                        </div>
                    </div>
                    <div className="space-x-2">
                        <Button
                            onClick={() => handleAccept(user.id)}
                            className="cursor-pointer"
                        >
                            Accept
                        </Button>
                    </div>
                </div>
            ))}
        </div>
    );
}