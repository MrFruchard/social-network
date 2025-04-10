import { useState, useEffect } from "react";

interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  username: string;
  image_profile: string;
  content: string;
  image_content_url: string;
  liked: boolean;
  disliked: boolean;
  like_count: number;
  dislike_count: number;
  created_at: string;
}

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
  comment: Comment[];
}

export default function PostPage({ params }: { params: { postId: string } }) {
  const { postId } = params;

  const [post, setPost] = useState<Post | null>(null);
  const [newComment, setNewComment] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await fetch(
          `http://localhost:80/api/post?postId=${postId}`
        );
        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }
        const result = await response.json();
        setPost(result);
        setLoading(false);
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "An unknown error occurred"
        );
        setLoading(false);
      }
    };

    fetchPost();
  }, [postId]);

  const handleCreateComment = async () => {
    if (!newComment.trim()) return;

    try {
      const formData = new FormData();
      formData.append("content", newComment);

      const response = await fetch("http://localhost:80/api/comment/", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to create comment");
      }

      const createdComment = await response.json();
      setPost((prevPost) =>
        prevPost
          ? {
              ...prevPost,
              comment: [...prevPost.comment, createdComment],
              comment_count: prevPost.comment_count + 1,
            }
          : null
      );
      setNewComment("");
    } catch (error) {
      console.error("Failed to create comment:", error);
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

  return (
    <div className="w-full mx-auto bg-white p-4">
      {post && (
        <>
          {/* Post Section */}
          <div className="mb-4">
            <div className="flex items-center">
              <img
                src={post.image_profile_url}
                alt={`${post.first_name} ${post.last_name}`}
                className="w-12 h-12 rounded-full object-cover mr-3"
              />
              <div>
                <p className="font-bold">
                  {post.first_name} {post.last_name}
                </p>
                <p className="text-gray-500">@{post.username}</p>
              </div>
            </div>
            <p className="mt-2">{post.content}</p>
            {post.image_content_url && (
              <img
                src={post.image_content_url}
                alt="Post content"
                className="mt-2 rounded-lg"
              />
            )}
          </div>

          {/* New Comment Section */}
          <div className="mb-4">
            <textarea
              className="w-full border rounded-lg p-2"
              placeholder="Écrire un commentaire..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            ></textarea>
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded-lg mt-2"
              onClick={handleCreateComment}
            >
              Publier
            </button>
          </div>

          {/* Comments Section */}
          <div>
            <h2 className="text-lg font-bold mb-2">Commentaires</h2>
            {post.comment.map((comment) => (
              <div key={comment.id} className="mb-4">
                <div className="flex items-center">
                  <img
                    src={comment.image_profile}
                    alt={`${comment.first_name} ${comment.last_name}`}
                    className="w-10 h-10 rounded-full object-cover mr-3"
                  />
                  <div>
                    <p className="font-bold">
                      {comment.first_name} {comment.last_name}
                    </p>
                    <p className="text-gray-500">@{comment.username}</p>
                  </div>
                </div>
                <p className="mt-2">{comment.content}</p>
                {comment.image_content_url && (
                  <img
                    src={comment.image_content_url}
                    alt="Comment content"
                    className="mt-2 rounded-lg"
                  />
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
