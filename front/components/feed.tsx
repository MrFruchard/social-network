import { useState, useEffect } from "react";
import { reactToPost } from "@/api/post/postApi";
import {
  Heart,
  MessageCircle,
  ThumbsUp,
  ThumbsDown,
  Users,
} from "lucide-react";
import Link from "next/link";
import UserLink from "@/components/UserLink";
import { useRouter } from "next/navigation";

export default function TwitterLikeFeed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    console.log("Fetching posts with tag:", selectedTag);
    const fetchPosts = async () => {
      try {
        const url = selectedTag
          ? `http://localhost:80/api/tag?tag=${encodeURIComponent(selectedTag)}`
          : "http://localhost:80/api/home/post";

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }
        const result = await response.json();

        const postsWithImages = await Promise.all(
          result.data.map(async (post: any) => {
            if (post.image_content_url) {
              try {
                const requestOptions = {
                  method: "GET",
                };

                const imageResponse = await fetch(
                  `/api/postImages/${post.image_content_url}`,
                  requestOptions
                );
                if (imageResponse.ok) {
                  const imageBlob = await imageResponse.blob();
                  const imageUrl = URL.createObjectURL(imageBlob);
                  return { ...post, image_content_url: imageUrl };
                }
              } catch (imageError) {
                console.error(
                  `Failed to fetch image for post ${post.id}:`,
                  imageError
                );
              }
            }
            return post;
          })
        );

        setPosts(postsWithImages);
        setLoading(false);
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "An unknown error occurred"
        );
        setLoading(false);
      }
    };

    fetchPosts();
  }, [selectedTag]);

  interface Post {
    id: number;
    liked: boolean;
    disliked: boolean;
    like_count: number;
    dislike_count: number;
    [key: string]: any; // To allow other properties in the post object
  }

  const handleLike = async (postId: number): Promise<void> => {
    try {
      await reactToPost(postId, "liked");
      setPosts(
        posts.map((post: Post) => {
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

  const handleDislike = async (postId: number): Promise<void> => {
    try {
      await reactToPost(postId, "disliked");
      setPosts(
        posts.map((post: Post) => {
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
        <strong className="font-bold">Erreur! </strong>
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

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

  return (
    <div className="w-full mx-auto bg-white">
      <div className="top-0 z-10 bg-white p-4 border-b">
        <h1 className="text-xl font-bold">Accueil</h1>
      </div>

      <div className="divide-y">
        {posts.map((post) => (
          <div key={post.id} className="p-4 hover:bg-gray-50 transition">
            <div className="flex">
              <div
                className="mr-3 cursor-pointer"
                onClick={() => {
                  router.push(`/profile?id=${post.user_id || post.userId}`);
                }}
              >
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

              <div className="flex-1">
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

                {post.group_id && post.group_id.id && (
                  <div
                    className="flex items-center text-gray-500 mb-1 text-sm cursor-pointer hover:underline"
                    onClick={() => router.push(`/group/${post.group_id.id}`)}
                  >
                    <Users size={14} className="mr-1" />
                    <span>{post.group_id.name}</span>
                  </div>
                )}

                <div className="mt-1 mb-2">
                  <p className="whitespace-pre-line">{post.content}</p>
                  {
                    <div className="mt-1">
                      <span className="text-blue-500">
                        {Array.isArray(post.tags) &&
                          post.tags.map((tag: string, index: number) => (
                            <span
                              key={index}
                              onClick={() => {
                                console.log("Tag clicked:", tag);
                                setSelectedTag(tag);
                              }}
                              className="text-blue-500 hover:underline mr-2 cursor-pointer"
                            >
                              {tag}
                            </span>
                          ))}
                      </span>
                    </div>
                  }
                </div>

                {post.image_content_url && (
                  <div className="mt-2 mb-3 rounded-lg overflow-hidden border border-gray-200">
                    <img
                      src={post.image_content_url}
                      alt="Contenu du post"
                      className="w-full h-auto object-cover"
                    />
                  </div>
                )}

                <div className="flex justify-between mt-3 text-gray-500">
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
    </div>
  );
}
