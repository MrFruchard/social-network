import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reactToPost } from '@/api/post/postApi';

interface Post {
  id: number;
  liked: boolean;
  disliked: boolean;
  like_count: number;
  dislike_count: number;
  [key: string]: any;
}

const fetchPosts = async (selectedTag?: string | null): Promise<Post[]> => {
  const url = selectedTag 
    ? `http://localhost:80/api/tag?tag=${encodeURIComponent(selectedTag)}` 
    : 'http://localhost:80/api/home/post';

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP Error: ${response.status}`);
  }
  const result = await response.json();
  
  return result.data.map((post: any) => ({
    ...post,
    image_profile_url: post.image_profile_url,
    image_content_url: post.image_content_url,
  }));
};

export const usePosts = (selectedTag?: string | null) => {
  return useQuery({
    queryKey: ['posts', selectedTag],
    queryFn: () => fetchPosts(selectedTag),
    staleTime: 1000 * 60 * 2, // 2 minutes
    cacheTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useReactToPost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, reaction }: { postId: number; reaction: 'liked' | 'disliked' }) =>
      reactToPost(postId, reaction),
    onSuccess: (_, { postId, reaction }) => {
      queryClient.setQueryData(['posts'], (oldData: Post[] | undefined) => {
        if (!oldData) return oldData;
        
        return oldData.map((post: Post) => {
          if (post.id === postId) {
            if (reaction === 'liked') {
              const newLiked = !post.liked;
              const likeCount = newLiked ? post.like_count + 1 : post.like_count - 1;
              const newDisliked = newLiked ? false : post.disliked;
              const dislikeCount = post.disliked && newLiked ? post.dislike_count - 1 : post.dislike_count;

              return {
                ...post,
                liked: newLiked,
                disliked: newDisliked,
                like_count: likeCount,
                dislike_count: dislikeCount,
              };
            } else {
              const newDisliked = !post.disliked;
              const dislikeCount = newDisliked ? post.dislike_count + 1 : post.dislike_count - 1;
              const newLiked = newDisliked ? false : post.liked;
              const likeCount = post.liked && newDisliked ? post.like_count - 1 : post.like_count;

              return {
                ...post,
                disliked: newDisliked,
                liked: newLiked,
                dislike_count: dislikeCount,
                like_count: likeCount,
              };
            }
          }
          return post;
        });
      });
    },
  });
};