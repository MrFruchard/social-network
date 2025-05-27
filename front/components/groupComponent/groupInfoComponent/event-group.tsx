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
}

interface EventGroupProps {
    groupId: string;
}

export function EventGroup({ groupId }: EventGroupProps) {
    const [events, setEvents] = useState<EventInfos[] | null>(null);
    const [desc, setDesc] = useState("");
    const [optionA, setOptionA] = useState("");
    const [optionB, setOptionB] = useState("");
    const [loading, setLoading] = useState(false);

    // ✅ État pour afficher/masquer le formulaire
    const [showForm, setShowForm] = useState(false);

    const fetchEvents = async () => {
        try {
            const res = await fetch(`/api/group/event?groupId=${groupId}`);
            const data = await res.json();

            if (Array.isArray(data)) {
                setEvents(data);
            } else {
                console.warn("Réponse inattendue (non-array) :", data);
                setEvents([]);
            }
        } catch (err) {
            console.error("Erreur lors du chargement des événements :", err);
            setEvents([]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const query = new URLSearchParams({
            groupId: groupId,
            event: desc,
            optionA: optionA,
            optionB: optionB,
        });

        try {
            const res = await fetch(`/api/group/event?${query.toString()}`, {
                method: "POST",
            });

            if (!res.ok) throw new Error("Erreur lors de la création de l'événement");

            setDesc("");
            setOptionA("");
            setOptionB("");

            await fetchEvents();
            setShowForm(false); // ✅ Fermer le formulaire après envoi
        } catch (err) {
            console.error("Erreur lors de la requête POST :", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, [groupId]);

    return (
        <div className="p-4 border-b border-gray-200 ">
            <h2 className="text-xl font-bold mb-4">Événements du groupe</h2>


            {!Array.isArray(events) || events.length === 0 ? (
                <div className="text-gray-600 mb-6">
                    Aucun événement disponible.
                </div>
            ) : (
                <div className="w-full mb-6 flex justify-start">
                    {/* Conteneur limité en largeur (central) */}
                    <div className="max-w-3xl mx-auto px-4">
                        {/* Bande scrollable */}
                        <div className="overflow-x-auto scrollbar-hide">
                            {/* Liste horizontale sans retour à la ligne */}
                            <div className="flex gap-4 whitespace-nowrap ">
                                {events.map((event) => (
                                    <div
                                        key={event.id}
                                        className="w-[250px] border p-4 rounded shadow bg-white shrink-0"
                                    >
                                        <p className="text-sm text-gray-500">
                                            Par {event.sender.username ?? `${event.sender.first_name} ${event.sender.last_name}`} –{" "}
                                            {new Date(event.created_at).toLocaleDateString()}
                                        </p>
                                        <p className="font-semibold">{event.desc}</p>
                                        <div className="mt-2">
                                            <span className="mr-4">🅰️ {event.option_a}</span>
                                            <span>🅱️ {event.option_b}</span>
                                        </div>
                                        <p className="mt-1 text-sm text-gray-700">
                                            Choix sélectionné :{" "}
                                            {event.choice === 0 ? "A" : event.choice === 1 ? "B" : "Non spécifié"}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ✅ Bouton pour toggle le formulaire */}
            <Button
                onClick={() => setShowForm(!showForm)}
                className={"cursor-pointer"}
            >
                {showForm ? "Annuler" : "Proposer un événement"}
            </Button>

            {/* ✅ Affichage conditionnel du formulaire */}
            {showForm && (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <h3 className="text-lg font-semibold">Nouvel événement</h3>

                    <div>
                        <label className="block font-medium">Description</label>
                        <textarea
                            required
                            value={desc}
                            onChange={(e) => setDesc(e.target.value)}
                            className="w-full border p-2 rounded"
                        />
                    </div>

                    <div>
                        <label className="block font-medium">Option A</label>
                        <input
                            required
                            value={optionA}
                            onChange={(e) => setOptionA(e.target.value)}
                            className="w-full border p-2 rounded"
                        />
                    </div>

                    <div>
                        <label className="block font-medium">Option B</label>
                        <input
                            required
                            value={optionB}
                            onChange={(e) => setOptionB(e.target.value)}
                            className="w-full border p-2 rounded"
                        />
                    </div>

                    <Button
                        type="submit"
                        disabled={loading}
                        className=" px-4 py-2  disabled:opacity-50 cursor-pointer"
                    >
                        {loading ? "Envoi..." : "Créer l'événement"}
                    </Button>
                </form>
            )}
        </div>
    );
}