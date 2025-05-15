import { useState, useEffect } from 'react';
import { fetchGroupPosts } from '../../api/user/groupApi';

interface Post {
  id: string;
  content: string;
  image?: string;
  author: {
    id: string;
    username: string;
    first_name?: string;
    last_name?: string;
    profile_picture?: string;
  };
  created_at: string;
  likes_count: number;
  dislikes_count: number;
  comments_count: number;
  user_reaction?: 'like' | 'dislike' | null;
}

export function useGroupPosts(groupId: string) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPosts = async () => {
    if (!groupId) return;
    
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:80/api/group/${groupId}/posts`, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch group posts');
      }
      
      const data = await response.json();
      setPosts(data.posts || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Une erreur est survenue'));
      console.error('Error fetching group posts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [groupId]);

  return {
    posts,
    loading,
    error,
    refresh: fetchPosts
  };
}