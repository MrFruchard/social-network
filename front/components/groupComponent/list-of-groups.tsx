import Link from "next/link";

// Définir le type pour un groupe
interface Group {
    id: string;
    name: string;
    group_pic_url: string;
    created_at: string;
}

export function ListOfGroups({
                                 groups,
                                 loading,
                                 error,
                             }: {
    groups: Group[];
    loading: boolean;
    error: string | null;
}) {
    return (
        <div className="group p-4">
            <h1 className="text-xl font-bold mb-4">List of groups</h1>

            {loading ? (
                <p>Chargement...</p>
            ) : error ? (
                <p className="text-red-500">{error}</p>
            ) : groups.length === 0 ? (
                <p className="text-gray-500">Tu n'es dans aucun groupe.</p>
            ) : (
                <ul className="space-y-2">
                    {groups.map((group) => (
                        <li key={group.id}>
                            <Link
                                href={`/group/${group.id}`}
                                className="block border p-3 rounded-lg shadow flex items-center space-x-4 hover:bg-gray-100 transition"
                            >
                                {group.group_pic_url ? (
                                    <img
                                        src={`http://localhost/api/groupImages/${group.group_pic_url}`}
                                        alt={`Group ${group.name}`}
                                        className="w-16 h-16 object-cover rounded-full"
                                    />
                                ) : (
                                    <div className="w-16 h-16 flex items-center justify-center bg-black text-white text-xl font-bold rounded-full">
                                        {group.name?.charAt(0).toUpperCase() || "?"}
                                    </div>
                                )}
                                <div>
                                    <h2 className="text-lg font-semibold">{group.name || "Unnamed Group"}</h2>
                                    <p className="text-sm text-gray-600">
                                        Created at:{" "}
                                        {group.created_at
                                            ? new Date(group.created_at).toLocaleString()
                                            : "Unknown"}
                                    </p>
                                </div>
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}