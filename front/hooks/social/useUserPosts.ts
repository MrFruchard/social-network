import { useState, useEffect } from 'react';
import { fetchProfilePosts } from '../../api/post/postApi';

interface Post {
  id: string;
  userId: string;
  first_name: string;
  last_name: string;
  username: string;
  image_profile_url: string;
  content: string;
  tags: string;
  image_content_url: string;
  created_at: string;
  liked: boolean;
  disliked: boolean;
  like_count: number;
  dislike_count: number;
  comment_count: number;
  followed: boolean;
  group_id: {
    id: string;
    name: string;
    group_pic_url: string;
    created_at: string;
  } | null;
  owner_user_id: boolean;
}

interface UseUserPostsReturn {
  posts: Post[];
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useUserPosts(userId: string): UseUserPostsReturn {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPosts = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetchProfilePosts(userId);
      setPosts(response.data || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An error occurred while fetching posts'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [userId]);

  return {
    posts,
    loading,
    error,
    refetch: fetchPosts
  };
}