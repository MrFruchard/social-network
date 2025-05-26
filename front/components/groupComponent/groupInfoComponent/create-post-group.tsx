'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface CreatePostModalProps {
    groupId: string;
    onClose: () => void;
    onPostCreated?: () => void;
}

export function CreatePostModal({ groupId, onClose, onPostCreated }: CreatePostModalProps) {
    const [content, setContent] = useState('');
    const [tags, setTags] = useState('');
    const [image, setImage] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const extractHashtags = (text: string): string[] => {
        const hashtags = text.match(/#\w+/g) || [];
        return hashtags.map(tag => tag.substring(1)); // Retire le `#`
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const formData = new FormData();
        formData.append('content', content);
        formData.append('groupId', groupId);
        formData.append('privacy', 'private');

        // Fusionne les tags manuels et hashtags du contenu
        const tagList = [
            ...new Set([
                ...tags
                    .split(/\s+/)
                    .map(tag => tag.trim())
                    .filter(tag => tag !== ''),
                ...extractHashtags(content)
            ])
        ];

        formData.append('tags', tagList.join(' '));

        if (image) {
            formData.append('image', image); // Assure-toi que ton backend accepte "image"
        }

        try {
            const res = await fetch('/api/posts', {
                method: 'POST',
                body: formData,
                credentials: 'include',
            });

            if (!res.ok) throw new Error('Erreur lors de la création du post');

            setContent('');
            setTags('');
            setImage(null);
            onClose();
            onPostCreated?.();
        } catch (err) {
            console.error(err);
            alert('Erreur lors de la publication du post.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50  bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-lg p-6 relative">
                <h2 className="text-lg font-semibold mb-4">Créer un post</h2>
                <form onSubmit={handleSubmit}>
                    <textarea
                        className="w-full border border-gray-300 p-3 rounded-lg resize-none focus:outline-none focus:ring focus:border-blue-300 mb-4"
                        rows={4}
                        placeholder="Quoi de neuf ?"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        required
                    />
                    <input
                        type="file"
                        accept="image/*"
                        className="mb-4"
                        onChange={(e) => setImage(e.target.files?.[0] || null)}
                    />
                    <div className="flex justify-end space-x-2">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Annuler
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? 'Publication...' : 'Publier'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}