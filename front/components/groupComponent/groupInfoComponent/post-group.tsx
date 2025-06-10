'use client';

import { useState, useEffect } from 'react';
import { MessageCircle, ThumbsUp, ThumbsDown, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { reactToPost } from '@/api/post/postApi';
import UserLink from '@/components/UserLink';
import { PostDetail } from '@/components/post';
import {Button} from "@/components/ui/button";
import { CreatePostModal } from '@/components/groupComponent/groupInfoComponent/create-post-group'; // adapte le chemin si besoin

interface Post {
    id: number | string;
    userId: string;
    first_name: string;
    last_name: string;
    username: string;
    image_profile_url: string | null;
    content: string;
    tags: string[];
    image_content_url: string | null;
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
    const [selectedPostId, setSelectedPostId] = useState<string | number | null>(null);
    const [postDetailOpen, setPostDetailOpen] = useState(false);
    const router = useRouter();
    const [createPost, setCreatePost] = useState<boolean>(false);

    useEffect(() => {
        if (!groupId) return;

        const fetchPosts = async () => {
            try {
                const res = await fetch(`http://localhost/api/group/post?groupId=${groupId}`, {
                    credentials: 'include',
                });

                if (!res.ok) throw new Error('Erreur lors du chargement des posts');
                const data = await res.json();

                if (!data || !Array.isArray(data)) {
                    setPosts([]);
                    return;
                }


                const postsWithImages = await Promise.all(data.map(async (post: Post) => {
                    try {
                        if (post.image_profile_url) {
                            const res = await fetch(`/api/avatars/${post.image_profile_url}`);
                            if (res.ok) {
                                const blob = await res.blob();
                                post.image_profile_url = URL.createObjectURL(blob);
                            } else {
                                post.image_profile_url = null;
                            }
                        }

                        if (post.image_content_url) {
                            const res = await fetch(`/api/postImages/${post.image_content_url}`);
                            if (res.ok) {
                                const blob = await res.blob();
                                post.image_content_url = URL.createObjectURL(blob);
                            }
                        }
                    } catch (err) {
                        console.error("Image fetch error", err);
                    }
                    return post;
                }));

                setPosts(postsWithImages);
                setError(null);
            } catch (err) {
                console.error(err);
                setError('Erreur de chargement des posts');
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, [groupId]);

    const handleLike = async (postId: number | string) => {
        await reactToPost(postId, 'liked');
        setPosts(posts => posts.map(post => {
            if (post.id === postId) {
                const liked = !post.liked;
                const disliked = liked ? false : post.disliked;
                return {
                    ...post,
                    liked,
                    disliked,
                    like_count: liked ? post.like_count + 1 : post.like_count - 1,
                    dislike_count: post.disliked && liked ? post.dislike_count - 1 : post.dislike_count,
                };
            }
            return post;
        }));
    };

    const handleDislike = async (postId: number | string) => {
        await reactToPost(postId, 'disliked');
        setPosts(posts => posts.map(post => {
            if (post.id === postId) {
                const disliked = !post.disliked;
                const liked = disliked ? false : post.liked;
                return {
                    ...post,
                    disliked,
                    liked,
                    dislike_count: disliked ? post.dislike_count + 1 : post.dislike_count - 1,
                    like_count: post.liked && disliked ? post.like_count - 1 : post.like_count,
                };
            }
            return post;
        }));
    };

    const timeAgo = (date: string) => {
        const diff = Date.now() - new Date(date).getTime();
        const sec = Math.floor(diff / 1000);
        const min = Math.floor(sec / 60);
        const hour = Math.floor(min / 60);
        const day = Math.floor(hour / 24);
        if (sec < 60) return `${sec}s`;
        if (min < 60) return `${min}m`;
        if (hour < 24) return `${hour}h`;
        if (day < 30) return `${day}j`;
        return new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    };

    if (loading) {
        return <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>;
    }

    if (error) {
        return <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            <strong className="font-bold">Erreur ! </strong>
            <span className="block sm:inline">{error}</span>
        </div>;
    }

    return (
        <div className="divide-y">
            <div className="flex justify-end p-4 cursor-pointer">
                <Button onClick={() => setCreatePost(true)} className={"cursor-pointer"}>Créer un post</Button>
                {createPost && (
                    <CreatePostModal
                        groupId={groupId}
                        onClose={() => setCreatePost(false)}
                        onPostCreated={() => {
                            setCreatePost(false);
                            // Recharge les posts si besoin
                        }}
                    />
                )}
            </div>
            {posts.map(post => (
                <div key={post.id} className="p-4 hover:bg-gray-50 transition">
                    <div className="flex">
                        <div className="mr-3 cursor-pointer" onClick={() => router.push(`/profile?id=${post.userId}`)}>
                            {post.image_profile_url ? (
                                <img src={post.image_profile_url} className="w-12 h-12 rounded-full object-cover" />
                            ) : (
                                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                                    <span className="text-gray-500 font-semibold text-lg">{post.first_name[0]}{post.last_name[0]}</span>
                                </div>
                            )}
                        </div>

                        <div className="flex-1">
                            <div className="flex justify-between items-start">
                                <div>
                                    <UserLink userId={post.userId} username={`${post.first_name} ${post.last_name}`} className="font-bold hover:underline" />
                                    <span className="text-gray-500 ml-1">@{post.username} · {timeAgo(post.created_at)}</span>
                                </div>
                            </div>

                            {post.group_id?.id && (
                                <div className="flex items-center text-sm text-gray-500 mb-1 cursor-pointer hover:underline" onClick={() => router.push(`/group/${post.group_id.id}`)}>
                                    <Users size={14} className="mr-1" /> {post.group_id.name}
                                </div>
                            )}

                            <div className="mt-1 mb-2 whitespace-pre-line">{post.content}</div>
                            {post.tags && (
                                <div className="mt-1">
                                    {post.tags.map((tag, index) => (
                                        <span key={index} className="text-blue-500 hover:underline mr-2 cursor-pointer">#{tag}</span>
                                    ))}
                                </div>
                            )}

                            {post.image_content_url && (
                                <div className="mt-2 mb-3 rounded-lg overflow-hidden border border-gray-200">
                                    <img src={post.image_content_url} alt="Contenu du post" className="w-full h-auto object-cover" />
                                </div>
                            )}

                            <div className="flex justify-between mt-3 text-gray-500">
                                <button className="flex items-center group" onClick={() => {
                                    setSelectedPostId(post.id);
                                    setPostDetailOpen(true);
                                }}>
                                    <div className="p-2 rounded-full group-hover:bg-blue-50 group-hover:text-blue-500 transition">
                                        <MessageCircle size={18} />
                                    </div>
                                    <span className="ml-1 text-sm group-hover:text-blue-500">{post.comment_count}</span>
                                </button>

                                <button className="flex items-center group" onClick={() => handleLike(post.id)}>
                                    <div className={`p-2 rounded-full transition ${post.liked ? 'bg-green-50 text-green-500' : 'group-hover:bg-green-50 group-hover:text-green-500'}`}>
                                        <ThumbsUp size={18} />
                                    </div>
                                    <span className={`ml-1 text-sm ${post.liked ? 'text-green-500' : 'group-hover:text-green-500'}`}>{post.like_count}</span>
                                </button>

                                <button className="flex items-center group" onClick={() => handleDislike(post.id)}>
                                    <div className={`p-2 rounded-full transition ${post.disliked ? 'bg-red-50 text-red-500' : 'group-hover:bg-red-50 group-hover:text-red-500'}`}>
                                        <ThumbsDown size={18} />
                                    </div>
                                    <span className={`ml-1 text-sm ${post.disliked ? 'text-red-500' : 'group-hover:text-red-500'}`}>{post.dislike_count}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ))}

            {selectedPostId && (
                <PostDetail
                    postId={selectedPostId}
                    isOpen={postDetailOpen}
                    onClose={() => {
                        setPostDetailOpen(false);
                        setTimeout(() => setSelectedPostId(null), 200);
                    }}
                    onPostUpdated={(updatedPost) => {
                        // @ts-ignore
                        setPosts(posts => posts.map(p => p.id === updatedPost.id ? updatedPost : p));
                    }}
                />
            )}
        </div>
    );
}