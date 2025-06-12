import { useState, useEffect } from "react";
import Link from "next/link";
import { useUserPosts } from "@/hooks/social/useUserPosts";
import { 
  MessageCircle, 
  ThumbsUp, 
  ThumbsDown, 
  Users
} from "lucide-react";
import { reactToPost } from "@/api/post/postApi";
import { Alert, AlertDescription } from "@/components/ui/alert";
import UserLink from "@/components/UserLink";
import { useRouter } from "next/navigation";

interface Post {
  id: string;
  liked: boolean;
  disliked: boolean;
  like_count: number;
  dislike_count: number;
  [key: string]: any;
}

export function UserPostsList({ userId }: { userId: string }) {
  const { posts, loading, error } = useUserPosts(userId);
  const [localPosts, setLocalPosts] = useState<Post[]>([]);
  const router = useRouter();

  // When posts load, update local state with image processing
  useEffect(() => {
    const processPostsWithImages = async () => {
      if (posts && posts.length > 0) {
        const postsWithImages = await Promise.all(
          posts.map(async (post: any) => {
            let imageProfileUrl = post.image_profile_url;
            if (imageProfileUrl) {
              try {
                const profileImageResponse = await fetch(`/api/avatars/${imageProfileUrl}`, { method: 'GET' });
                if (profileImageResponse.ok) {
                  const profileImageBlob = await profileImageResponse.blob();
                  imageProfileUrl = URL.createObjectURL(profileImageBlob);
                } else {
                  imageProfileUrl = null;
                }
              } catch (profileImageError) {
                console.error(`Failed to fetch profile image for post ${post.id}:`, profileImageError);
                imageProfileUrl = null;
              }
            }

            let imageContentUrl = post.image_content_url;
            if (imageContentUrl) {
              try {
                const requestOptions = {
                  method: 'GET',
                };

                const imageResponse = await fetch(`/api/postImages/${imageContentUrl}`, requestOptions);
                if (imageResponse.ok) {
                  const imageBlob = await imageResponse.blob();
                  imageContentUrl = URL.createObjectURL(imageBlob);
                }
              } catch (imageError) {
                console.error(`Failed to fetch image for post ${post.id}:`, imageError);
              }
            }
            return {
              ...post,
              image_profile_url: imageProfileUrl,
              image_content_url: imageContentUrl,
            };
          })
        );
        setLocalPosts(postsWithImages);
      }
    };

    processPostsWithImages();
  }, [posts]);

  const handleLike = async (postId: string): Promise<void> => {
    try {
      await reactToPost(postId, "liked");
      setLocalPosts(
        localPosts.map((post: Post) => {
          if (post.id === postId) {
            const newLiked = !post.liked;
            const likeCount = newLiked
              ? post.like_count + 1
              : post.like_count - 1;

            const newDisliked = newLiked ? false : post.disliked;
            const dislikeCount =
              post.disliked && newLiked
                ? post.dislike_count - 1
                : post.dislike_count;

            return {
              ...post,
              liked: newLiked,
              disliked: newDisliked,
              like_count: likeCount,
              dislike_count: dislikeCount,
            };
          }
          return post;
        })
      );
    } catch (error) {
      console.error("Failed to like post:", error);
    }
  };

  const handleDislike = async (postId: string): Promise<void> => {
    try {
      await reactToPost(postId, "disliked");
      setLocalPosts(
        localPosts.map((post: Post) => {
          if (post.id === postId) {
            const newDisliked = !post.disliked;
            const dislikeCount = newDisliked
              ? post.dislike_count + 1
              : post.dislike_count - 1;

            const newLiked = newDisliked ? false : post.liked;
            const likeCount =
              post.liked && newDisliked ? post.like_count - 1 : post.like_count;

            return {
              ...post,
              disliked: newDisliked,
              liked: newLiked,
              dislike_count: dislikeCount,
              like_count: likeCount,
            };
          }
          return post;
        })
      );
    } catch (error) {
      console.error("Failed to dislike post:", error);
    }
  };

  // Calculate time ago
  const timeAgo = (dateString: string): string => {
    const now: Date = new Date();
    const past: Date = new Date(dateString);
    const diffMs: number = now.getTime() - past.getTime();
    const diffSec: number = Math.round(diffMs / 1000);
    const diffMin: number = Math.round(diffSec / 60);
    const diffHour: number = Math.round(diffMin / 60);
    const diffDay: number = Math.round(diffHour / 24);

    if (diffSec < 60) {
      return `${diffSec}s`;
    } else if (diffMin < 60) {
      return `${diffMin}m`;
    } else if (diffHour < 24) {
      return `${diffHour}h`;
    } else if (diffDay < 30) {
      return `${diffDay}j`;
    } else {
      return past.toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "short",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert>
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    );
  }

  if ((!posts || posts.length === 0) && (!localPosts || localPosts.length === 0)) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No posts yet.
      </div>
    );
  }

  return (
    <div className="divide-y">
      {localPosts.map((post) => (
        <div
          key={post.id}
          className="p-4 hover:bg-gray-50 transition"
        >
          <div className="flex">
            {/* Avatar */}
            <div className="mr-3 cursor-pointer" onClick={() => router.push(`/profile?id=${post.user_id || post.userId}`)}>
              {post.image_profile_url ? (
                <img
                  src={post.image_profile_url}
                  alt={`${post.first_name} ${post.last_name}`}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500 text-lg font-semibold">
                    {post.first_name.charAt(0)}
                    {post.last_name.charAt(0)}
                  </span>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <UserLink 
                    userId={post.user_id || post.userId} 
                    username={`${post.first_name} ${post.last_name}`}
                    isPrivate={post.is_private}
                    className="font-bold hover:underline"
                  />
                  <span className="text-gray-500 ml-1">
                    @{post.username} · {timeAgo(post.created_at)}
                  </span>
                </div>
              </div>

              {/* Group */}
              {post.group_id && post.group_id.id && (
                <div 
                  className="flex items-center text-gray-500 mb-1 text-sm cursor-pointer hover:underline"
                  onClick={() => router.push(`/group/${post.group_id.id}`)}
                >
                  <Users size={14} className="mr-1" />
                  <span>{post.group_id.name}</span>
                </div>
              )}

              {/* Post Content */}
              <div className="mt-1 mb-2">
                <p className="whitespace-pre-line">{post.content}</p>
                {post.tags && (
                  <div className="mt-1">
                    <span className="text-blue-500 hover:underline">
                      #{post.tags}
                    </span>
                  </div>
                )}
              </div>

              {/* Image */}
              {post.image_content_url && (
                <div className="mt-2 mb-3 rounded-lg overflow-hidden border border-gray-200">
                  <img
                    src={post.image_content_url}
                    alt="Contenu du post"
                    className="w-full h-auto object-cover"
                  />
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-between mt-3 text-gray-500">
                {/* Comment */}
                <Link href={`/post/${post.id}`}>
                  <button className="flex items-center group">
                    <div className="p-2 rounded-full group-hover:bg-blue-50 group-hover:text-blue-500 transition">
                      <MessageCircle size={18} />
                    </div>
                    <span className="ml-1 text-sm group-hover:text-blue-500">
                      {post.comment_count}
                    </span>
                  </button>
                </Link>

                {/* Like */}
                <button
                  className="flex items-center group"
                  onClick={() => handleLike(post.id)}
                >
                  <div
                    className={`p-2 rounded-full transition ${
                      post.liked
                        ? "bg-green-50 text-green-500"
                        : "group-hover:bg-green-50 group-hover:text-green-500"
                    }`}
                  >
                    <ThumbsUp
                      size={18}
                      className={post.liked ? "fill-green-500" : ""}
                    />
                  </div>
                  <span
                    className={`ml-1 text-sm ${
                      post.liked
                        ? "text-green-500"
                        : "group-hover:text-green-500"
                    }`}
                  >
                    {post.like_count}
                  </span>
                </button>

                {/* Dislike */}
                <button
                  className="flex items-center group"
                  onClick={() => handleDislike(post.id)}
                >
                  <div
                    className={`p-2 rounded-full transition ${
                      post.disliked
                        ? "bg-red-50 text-red-500"
                        : "group-hover:bg-red-50 group-hover:text-red-500"
                    }`}
                  >
                    <ThumbsDown
                      size={18}
                      className={post.disliked ? "fill-red-500" : ""}
                    />
                  </div>
                  <span
                    className={`ml-1 text-sm ${
                      post.disliked
                        ? "text-red-500"
                        : "group-hover:text-red-500"
                    }`}
                  >
                    {post.dislike_count}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}