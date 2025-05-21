"use client";
import { useState } from "react";
import { MoreHorizontal } from "lucide-react";
import { useRouter } from "next/navigation"; // <-- import ici

interface GroupApiResponse {
    group_infos: {
        id: string;
        name: string;
        description: string;
        group_pic_url: string;
        created_at: string;
    };
    total_members: number;
    is_member: boolean;
    is_admin: boolean;
}

export function HeaderGroup({ data }: { data: GroupApiResponse }) {
    const { group_infos, total_members } = data;
    const [showMenu, setShowMenu] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const router = useRouter(); // <-- ici


    async function handleDelete() {
        try {
            const res = await fetch(`/api/group/delete?groupId=${group_infos.id}`, {
                method: "DELETE",
                credentials:"include"
            });
            if (!res.ok) throw new Error("Erreur lors de la suppression.");
            const result = await res.json();
            console.log("Groupe supprimé :", result);
            // redirection possible ici si tu veux
            router.push("/groups");
        } catch (error) {
            console.error(error);
        } finally {
            setShowConfirm(false);
        }
    }

    return (
        <div className="p-6 max-w-4xl mx-auto border-b-1 border-gray-200">
            <div className="flex items-start gap-6 relative">
                {group_infos.group_pic_url ? (
                    <img
                        src={`http://localhost/api/groupImages/${group_infos.group_pic_url}`}
                        alt={`Image of ${group_infos.name}`}
                        className="w-32 h-32 object-cover rounded-full"
                    />
                ) : (
                    <div className="w-32 h-32 rounded-full bg-black text-white flex items-center justify-center text-4xl font-bold">
                        {group_infos.name.charAt(0).toUpperCase()}
                    </div>
                )}

                <div className="flex-1">
                    <div className="flex justify-between items-start">
                        <h1 className="text-3xl font-bold mb-2">{group_infos.name}</h1>
                        {data.is_admin &&
                            <button
                                onClick={() => setShowMenu((prev) => !prev)}
                                className="text-gray-500 hover:text-black cursor-pointer hover:bg-gray-100 px-1 py-0.1  rounded-full"
                            >
                                <MoreHorizontal />
                            </button>
                        }

                    </div>

                    {showMenu  && (
                        <div className="absolute top-0 right-0 mt-6 bg-white border rounded shadow-md z-10 p-2 text-sm w-40">
                            <button className="block w-full text-left hover:bg-gray-100 px-2 py-1 rounded">
                                Modifier le groupe
                            </button>
                            <button
                                className="block w-full text-left text-white bg-red-500 hover:bg-red-700 px-2 py-1 rounded cursor-pointer"
                                onClick={() => {
                                    setShowConfirm(true);
                                    setShowMenu(false);
                                }}
                            >
                                Delete Group
                            </button>
                        </div>
                    )}

                    <p className="text-gray-600 mb-2">{group_infos.description}</p>
                    <p className="text-sm text-gray-500 mb-4">
                        Created at: {new Date(group_infos.created_at).toLocaleString()}
                    </p>

                    <div className="text-sm text-gray-700 space-y-1">
                        <p>{total_members} member{total_members > 1 ? "s" : "" }</p>
                    </div>
                </div>
            </div>

            {/* Modal de confirmation */}
            {showConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-lg">
                        <h2 className="text-lg font-semibold mb-4">Confirmer la suppression</h2>
                        <p className="mb-4 text-sm text-gray-700">
                            Es-tu sûr de vouloir supprimer ce groupe ? <br/><span className={"font-bold"}>Cette action est irréversible</span>.
                        </p>
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setShowConfirm(false)}
                                className="px-4 py-2 text-gray-700 hover:text-black hover:bg-gray-200 cursor-pointer rounded-full"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleDelete}
                                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 cursor-pointer rounded-full"
                            >
                                Supprimer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}