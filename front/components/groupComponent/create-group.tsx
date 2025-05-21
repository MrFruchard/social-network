import { useState } from "react";

export function CreateGroup({ onCreateSuccess }: { onCreateSuccess: () => void }) {
    const [showForm, setShowForm] = useState(false);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [image, setImage] = useState<File | null>(null);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess(false);

        if (!title.trim() || !description.trim()) {
            setError("Please fill in all required fields.");
            return;
        }

        const formData = new FormData();
        formData.append("title", title);
        formData.append("description", description);
        if (image) formData.append("image", image);

        try {
            const res = await fetch("/api/group/create", {
                method: "POST",
                body: formData,
            });

            if (!res.ok) throw new Error("Failed to create group.");

            setSuccess(true);
            setTitle("");
            setDescription("");
            setImage(null);
            setShowForm(false);

            onCreateSuccess(); // 🔁 recharge les groupes
        } catch (err) {
            setError((err as Error).message);
        }
    };
    return (
        <>
            {/* Button aligned to the right */}
            <div className="flex justify-end p-4">
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="text-white bg-black hover:bg-gray-800 font-bold rounded-full px-4 py-2 text-sm cursor-pointer"
                    title="Create a group"
                >
                    Create Group +
                </button>
            </div>

            {/* Compact form under the button */}
            {showForm && (
                <div className="p-4   w-full">
                    <form
                        onSubmit={handleSubmit}
                        className="w-full p-6 border rounded-lg shadow bg-white space-y-4"
                    >
                        <div>
                            <label className="block font-medium mb-1">Group title</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full border rounded p-2 text-sm"
                                required
                            />
                        </div>
                        <div>
                            <label className="block font-medium mb-1">Description</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full border rounded p-2 text-sm"
                                required
                            />
                        </div>
                        <div>
                            <label className="block font-medium mb-1">Image (optional)</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    if (e.target.files && e.target.files[0]) {
                                        setImage(e.target.files[0]);
                                    }
                                }}
                                className="text-sm "
                            />
                        </div>
                        {error && <p className="text-red-600 text-sm">{error}</p>}
                        {success && <p className="text-green-600 text-sm">Group created successfully!</p>}
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                className="bg-black text-white px-4 py-1.5 text-sm rounded-full hover:bg-blue-950 cursor-pointer"
                            >
                                Create
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </>
    );
}