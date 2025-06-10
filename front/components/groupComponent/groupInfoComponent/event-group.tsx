'use client';

import { useEffect, useState } from "react";
import { Button } from '@/components/ui/button';

interface User {
    id: string;
    username?: string;
    image?: string;
    last_name: string;
    first_name: string;
}

interface EventInfos {
    id: string;
    group_id: string;
    sender: User;
    desc: string;
    option_a: string;
    option_b: string;
    created_at: string;
    choice: number;
    count_a: number;
    count_b: number;
}

interface EventGroupProps {
    groupId: string;
}

function getInitials(first: string, last: string): string {
    const firstInitial = first?.[0]?.toUpperCase() ?? '';
    const lastInitial = last?.[0]?.toUpperCase() ?? '';
    return `${firstInitial}${lastInitial}`;
}

function AvatarOrInitials({
                              image,
                              firstName,
                              lastName,
                          }: {
    image?: string;
    firstName: string;
    lastName: string;
}) {
    const [imgError, setImgError] = useState(false);

    if (!image || imgError) {
        return (
            <div className="w-8 h-8 rounded-full bg-gray-300 text-black flex items-center justify-center font-semibold text-xs">
                {getInitials(firstName, lastName)}
            </div>
        );
    }

    return (
        <img
            src={`/api/avatars/${image}`}
            alt="avatar"
            className="w-8 h-8 rounded-full object-cover border border-gray-300"
            onError={() => setImgError(true)}
        />
    );
}

export function EventGroup({ groupId }: EventGroupProps) {
    const [events, setEvents] = useState<EventInfos[] | null>(null);
    const [title, setTitle] = useState("");
    const [optionA, setOptionA] = useState("");
    const [optionB, setOptionB] = useState("");
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);

    const fetchEvents = async () => {
        try {
            const res = await fetch(`/api/group/event?groupId=${groupId}`);
            const data = await res.json();
            setEvents(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Erreur lors du chargement des événements :", err);
            setEvents([]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const query = new URLSearchParams({
            groupId,
            event: title,
            optionA,
            optionB,
        });

        try {
            const res = await fetch(`/api/group/event?${query.toString()}`, {
                method: "POST",
            });

            if (!res.ok) throw new Error("Erreur lors de la création de l'événement");

            setTitle("");
            setOptionA("");
            setOptionB("");
            setShowForm(false);
            await fetchEvents();
        } catch (err) {
            console.error("Erreur lors de la requête POST :", err);
        } finally {
            setLoading(false);
        }
    };

    const handleVote = async (eventId: string, response: "A" | "B") => {
        try {
            const res = await fetch(`/api/group/response?eventId=${eventId}&groupId=${groupId}&response=${response}`, {
                method: "POST",
            });

            if (!res.ok) throw new Error("Erreur lors du vote");

            await fetchEvents();
        } catch (err) {
            console.error("Erreur lors du vote :", err);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, [groupId]);

    return (
        <div className="p-4 border-b border-gray-300 bg-white text-black">
            <h2 className="text-2xl font-bold mb-6">Événements du groupe</h2>

            {events === null ? (
                <div className="text-gray-600 mb-6">Chargement...</div>
            ) : events.length === 0 ? (
                <div className="text-gray-600 mb-6">Aucun événement disponible.</div>
            ) : (
                <div className="mb-6 overflow-x-auto">
                    <div className="flex gap-4">
                        {events.map((event) => (
                            <div
                                key={event.id}
                                className="min-w-[280px] bg-white border border-gray-300 rounded-xl shadow-sm p-4"
                            >
                                <div className="flex items-center gap-3 mb-2">
                                    <AvatarOrInitials
                                        image={event.sender.image}
                                        firstName={event.sender.first_name}
                                        lastName={event.sender.last_name}
                                    />
                                    <div className="text-sm text-gray-600 leading-tight">
                                        <div className="font-semibold">
                                            {event.sender.username ?? `${event.sender.first_name} ${event.sender.last_name}`}
                                        </div>
                                        <div className="text-xs">{new Date(event.created_at).toLocaleDateString()}</div>
                                    </div>
                                </div>

                                <p className="font-semibold text-lg text-black mb-4">{event.desc}</p>

                                <div className="mb-3 flex flex-col gap-2">
                                    <button
                                        onClick={() => handleVote(event.id, "A")}
                                        className={`flex items-center justify-between w-full px-4 py-2 rounded-full border text-sm font-medium transition cursor-pointer
                                            ${event.choice === 1
                                            ? 'bg-black text-white border-black'
                                            : 'bg-white text-black border-gray-300 hover:bg-gray-100'}
                                        `}
                                    >
                                        <div className="flex items-center gap-2">
                                            {event.choice === 1 ? (
                                                <span className="w-5 h-5 flex items-center justify-center rounded-full bg-white text-black text-xs font-bold">✔</span>
                                            ) : (
                                                <span className="w-5 h-5" />
                                            )}
                                            {event.option_a}
                                        </div>
                                        <span className={`text-xs ${event.choice === 1 ? 'text-white' : 'text-black'}`}>{event.count_a}</span>
                                    </button>

                                    <button
                                        onClick={() => handleVote(event.id, "B")}
                                        className={`flex items-center justify-between w-full px-4 py-2 rounded-full border text-sm font-medium transition cursor-pointer
                                            ${event.choice === 2
                                            ? 'bg-black text-white border-black'
                                            : 'bg-white text-black border-gray-300 hover:bg-gray-100'}
                                        `}
                                    >
                                        <div className="flex items-center gap-2">
                                            {event.choice === 2 ? (
                                                <span className="w-5 h-5 flex items-center justify-center rounded-full bg-white text-black text-xs font-bold">✔</span>
                                            ) : (
                                                <span className="w-5 h-5" />
                                            )}
                                            {event.option_b}
                                        </div>
                                        <span className={`text-xs ${event.choice === 2 ? 'text-white' : 'text-gray-500'}`}>{event.count_b}</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <Button onClick={() => setShowForm(!showForm)} className="mb-1">
                {showForm ? "Annuler" : "Proposer un événement"}
            </Button>

            {showForm && (
                <form onSubmit={handleSubmit} className="space-y-4 bg-gray-50 p-4 rounded-lg border border-gray-300">
                    <h3 className="text-lg font-semibold text-black">Créer un nouvel événement</h3>

                    <div>
                        <label className="block font-medium text-black">Titre de l’événement</label>
                        <input
                            required
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full border border-gray-300 p-2 rounded mt-1 bg-white text-black"
                            placeholder="Ex: Sortie au cinéma"
                        />
                    </div>

                    <div>
                        <label className="block font-medium text-black">Option A</label>
                        <input
                            required
                            value={optionA}
                            onChange={(e) => setOptionA(e.target.value)}
                            className="w-full border border-gray-300 p-2 rounded mt-1 bg-white text-black"
                            placeholder="Ex: Film A"
                        />
                    </div>

                    <div>
                        <label className="block font-medium text-black">Option B</label>
                        <input
                            required
                            value={optionB}
                            onChange={(e) => setOptionB(e.target.value)}
                            className="w-full border border-gray-300 p-2 rounded mt-1 bg-white text-black"
                            placeholder="Ex: Film B"
                        />
                    </div>

                    <Button type="submit" disabled={loading} className="px-4 py-2 bg-black text-white">
                        {loading ? "Envoi en cours..." : "Créer l’événement"}
                    </Button>
                </form>
            )}
        </div>
    );
}