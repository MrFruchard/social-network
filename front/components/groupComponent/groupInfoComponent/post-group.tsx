'use client';

import { useEffect, useState } from 'react';
import { MessageCircle, ThumbsUp, ThumbsDown } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Post {
    id: string;
    userId: string;
    first_name: string;
    last_name: string;
    username: string;
    image_profile_url: string;
    content: string;
    tags: string[];
    image_content_url: string;
    created_at: string;
    liked: boolean;
    disliked: boolean;
    like_count: number;
    dislike_count: number;
    comment_count: number;
    group_id: {
        id: string;
        name: string;
        group_pic_url: string;
        description: string;
        created_at: string;
    };
    owner_user_id: boolean;
}

interface PostGroupProps {
    groupId: string;
}

export function PostGroup({ groupId }: PostGroupProps) {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        if (!groupId) return;

        const fetchPosts = async () => {
            try {
                const res = await fetch(`http://localhost/api/group/post?groupId=${groupId}`, {
                    credentials: 'include',
                });

                if (!res.ok) throw new Error('Erreur lors du chargement des posts');

                const data = await res.json();

                // Cas normal : aucun post retourné
                if (data === null || (Array.isArray(data) && data.length === 0)) {
                    setPosts([]); // on définit explicitement un tableau vide
                    setError(null); // pas une vraie erreur, donc on n'affiche pas d'erreur
                    return;
                }

                // Vérifie que c’est bien un tableau
                if (!Array.isArray(data)) {
                    throw new Error('Données de posts invalides');
                }

                setPosts(data);
                setError(null); // au cas où une ancienne erreur persiste
            } catch (err) {
                console.error(err);
                setError('Erreur de chargement des posts');
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, [groupId]);

    const timeAgo = (dateString: string): string => {
        const now = new Date();
        const past = new Date(dateString);
        const diffMs = now.getTime() - past.getTime();
        const diffSec = Math.round(diffMs / 1000);
        const diffMin = Math.round(diffSec / 60);
        const diffHour = Math.round(diffMin / 60);
        const diffDay = Math.round(diffHour / 24);
        if (diffSec < 60) return `${diffSec}s`;
        if (diffMin < 60) return `${diffMin}m`;
        if (diffHour < 24) return `${diffHour}h`;
        if (diffDay < 30) return `${diffDay}j`;
        return past.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    };

    if (loading) {
        return (
            <div className='flex justify-center items-center h-64'>
                <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500'></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative'>
                <strong className='font-bold'>Erreur ! </strong>
                <span className='block sm:inline'>{error}</span>
            </div>
        );
    }

    if (!posts || posts.length === 0) {
        return <p className="p-4 italic text-gray-600">Ce groupe n'a pas encore de post.</p>;
    }

    return (
        <div className='divide-y'>
            {posts.map((post) => (
                <div key={post.id} className='p-4 hover:bg-gray-50 transition'>
                    <div className='flex'>
                        <div
                            className='mr-3 cursor-pointer'
                            onClick={() => router.push(`/profile?id=${post.userId}`)}
                        >
                            {post.image_profile_url ? (
                                <img
                                    src={`/images_profile/${post.image_profile_url}`}
                                    alt={`${post.first_name} ${post.last_name}`}
                                    className='w-12 h-12 rounded-full object-cover'
                                />
                            ) : (
                                <div className='w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center'>
                  <span className='text-gray-500 text-lg font-semibold'>
                    {post.first_name?.charAt(0)}
                      {post.last_name?.charAt(0)}
                  </span>
                                </div>
                            )}
                        </div>

                        <div className='flex-1'>
                            <div className='flex justify-between'>
                                <div>
                                    <span className='font-bold'>{post.first_name} {post.last_name}</span>
                                    <span className='text-gray-500 ml-1'>
                    @{post.username} · {timeAgo(post.created_at)}
                  </span>
                                </div>
                            </div>

                            <div className='mt-1 mb-2 whitespace-pre-line'>
                                {post.content}
                                <div className='mt-1'>
                                    {post.tags?.map((tag: string, i: number) => (
                                        <span key={i} className='text-blue-500 hover:underline mr-2 cursor-pointer'>
                      #{tag}
                    </span>
                                    ))}
                                </div>
                            </div>

                            {post.image_content_url && (
                                <div className='mt-2 mb-3 rounded-lg overflow-hidden border border-gray-200'>
                                    <img
                                        src={`/images_post/${post.image_content_url}`}
                                        alt='Contenu du post'
                                        className='w-full h-auto object-cover'
                                    />
                                </div>
                            )}

                            <div className='flex justify-between mt-3 text-gray-500'>
                                <button className='flex items-center group' onClick={() => router.push(`/post/${post.id}`)}>
                                    <div className='p-2 rounded-full group-hover:bg-blue-50 group-hover:text-blue-500 transition'>
                                        <MessageCircle size={18} />
                                    </div>
                                    <span className='ml-1 text-sm group-hover:text-blue-500'>{post.comment_count}</span>
                                </button>

                                <div className='flex items-center gap-4'>
                                    <div className='flex items-center group'>
                                        <div className='p-2 rounded-full group-hover:bg-green-50 group-hover:text-green-500 transition'>
                                            <ThumbsUp size={18} />
                                        </div>
                                        <span className='ml-1 text-sm group-hover:text-green-500'>{post.like_count}</span>
                                    </div>

                                    <div className='flex items-center group'>
                                        <div className='p-2 rounded-full group-hover:bg-red-50 group-hover:text-red-500 transition'>
                                            <ThumbsDown size={18} />
                                        </div>
                                        <span className='ml-1 text-sm group-hover:text-red-500'>{post.dislike_count}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}