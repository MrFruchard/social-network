"use client";

import { useState, useEffect } from "react";
import { createComment } from "@/api/post/commentApi";

// Affiche directement l'image à partir de l'URL construite
function CommentImage({ imageUrl }: { imageUrl: string }) {
  if (!imageUrl) return null;
  return (
    <img
      src={imageUrl}
      alt="Comment content"
      className="mt-2 rounded-lg shadow-sm"
    />
  );
}

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

export default function PostPage({
  params,
}: {
  params: Promise<{ postId: string }>;
}) {
  const [postId, setPostId] = useState<string | null>(null);
  const [post, setPost] = useState<Post | null>(null);
  const [newComment, setNewComment] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [picture, setPicture] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Ajoute un state pour stocker les URLs blob des images de profil des commentaires
  const [commentProfileImages, setCommentProfileImages] = useState<{
    [id: string]: string | null;
  }>({});

  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await params;
      setPostId(resolvedParams.postId);
    };

    resolveParams();
  }, [params]);

  useEffect(() => {
    if (!postId) return;

    const fetchPost = async () => {
      try {
        const response = await fetch(
          `http://localhost:80/api/post?postId=${postId}`
        );
        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }
        const result = await response.json();
        let comments = result.comment || [];

        // Pour chaque commentaire avec une image, construit l'URL complète
        comments = comments.map((comment: any) => {
          if (comment.image_content_url) {
            return {
              ...comment,
              image_content_url: `http://localhost:80/api/commentImages/${comment.image_content_url}`,
            };
          }
          return comment;
        });

        setPost({
          ...result,
          comment: comments,
        });
        setLoading(false);

        // Prépare le chargement des images de profil des commentaires
        const fetchCommentProfileImages = async () => {
          const images: { [id: string]: string | null } = {};
          await Promise.all(
            comments.map(async (comment: any) => {
              if (comment.image_profile) {
                try {
                  const res = await fetch(
                    `/api/avatars/${comment.image_profile}`
                  );
                  if (res.ok) {
                    const blob = await res.blob();
                    images[comment.id] = URL.createObjectURL(blob);
                  } else {
                    images[comment.id] = null;
                  }
                } catch {
                  images[comment.id] = null;
                }
              } else {
                images[comment.id] = null;
              }
            })
          );
          setCommentProfileImages(images);
        };
        fetchCommentProfileImages();
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
    // Empêche de poster si ni texte ni image
    if ((!newComment.trim() && !imageFile) || !postId) return;

    try {
      const formData = new FormData();
      formData.append("content", newComment); // Peut être vide, backend doit gérer
      if (imageFile) {
        formData.append("image", imageFile);
      }
      const createdComment = await createComment(postId, formData);

      // Vérifiez que le commentaire a un ID unique
      const newCommentWithId = {
        ...createdComment,
        id: createdComment.id || `temp-${Date.now()}`,
      };

      setPost((prevPost) =>
        prevPost
          ? {
              ...prevPost,
              comment: prevPost.comment
                ? [...prevPost.comment, newCommentWithId]
                : [newCommentWithId],
              comment_count: prevPost.comment_count + 1,
            }
          : null
      );
      setNewComment("");
      setPicture(null);
      setImageFile(null);
      window.location.reload();
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
    <div className="w-full mx-auto bg-gray-50 min-h-screen p-4">
      {/* Bouton Retour à l'accueil */}
      <div className="mb-4">
        <button
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded"
          onClick={() => (window.location.href = "/home")}
        >
          ← Retour à l'accueil
        </button>
      </div>

      {post && (
        <>
          {/* Post Section */}
          <div className="mb-6 bg-white shadow-md rounded-lg p-6">
            <div className="flex items-center mb-4">
              <img
                src={post.image_profile_url}
                alt={`${post.first_name} ${post.last_name}`}
                className="w-12 h-12 rounded-full object-cover mr-3"
              />
              <div>
                <p className="font-bold text-lg">
                  {post.first_name} {post.last_name}
                </p>
                <p className="text-gray-500">@{post.username}</p>
              </div>
            </div>
            <p className="text-gray-800">{post.content}</p>
            {post.image_content_url && (
              <img
                src={post.image_content_url}
                alt="Post content"
                className="mt-4 rounded-lg shadow-md"
              />
            )}
          </div>

          {/* New Comment Section */}
          <div className="mb-6 bg-white shadow-md rounded-lg p-6">
            <h2 className="text-lg font-bold mb-4">Écrire un commentaire</h2>
            <textarea
              className="w-full border rounded-lg p-2 mb-4"
              placeholder="Écrire un commentaire..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            ></textarea>
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
              onClick={handleCreateComment}
            >
              Publier
            </button>
            <input
              type="file"
              name="image_comment"
              id="image_comment"
              accept="image/png, image/jpeg, image/gif, image/jpg"
              className="mt-4"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setImageFile(file);
                  const reader = new FileReader();
                  reader.onload = () => {
                    if (typeof reader.result === "string") {
                      setPicture(reader.result);
                    }
                  };
                  reader.readAsDataURL(file);
                }
              }}
            />
          </div>

          {/* Comments Section */}
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-lg font-bold mb-4">Commentaires</h2>
            {post.comment && post.comment.length > 0 ? (
              post.comment.map((comment) => (
                <div key={comment.id} className="mb-6 border-b pb-4">
                  <div className="flex items-center mb-2">
                    {commentProfileImages[comment.id] ? (
                      <img
                        src={commentProfileImages[comment.id] as string}
                        alt={`${comment.first_name} ${comment.last_name}`}
                        className="w-10 h-10 rounded-full object-cover mr-3"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                        <span className="text-gray-500 text-base font-semibold">
                          {comment.first_name?.charAt(0)}
                          {comment.last_name?.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div>
                      <p className="font-bold">
                        {comment.first_name} {comment.last_name}
                      </p>
                      <p className="text-gray-500">@{comment.username}</p>
                    </div>
                  </div>
                  <p className="text-gray-800">{comment.content}</p>
                  {comment.image_content_url &&
                    comment.image_content_url !== "" && (
                      <CommentImage imageUrl={comment.image_content_url} />
                    )}
                </div>
              ))
            ) : (
              <p className="text-gray-500">Aucun commentaire pour le moment.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
