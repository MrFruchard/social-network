// Recuperer les commentaires d'un post
export const fetchPostComments = async (postId) => {
    const response = await fetch(`http://localhost:80/api/comment/${postId}`, {
        credentials: "include",
    });
    if (!response.ok) {
        throw new Error('Failed to fetch comments');
    }
    return response.json();
};

// Creer un nouveau commentaire
export const createComment = async (postId, commentData) => {
    const formData = new FormData();
    formData.append("content", commentData.content);

    const response = await fetch(`http://localhost:80/api/comment/${postId}`, {
        method: "POST",
        credentials: "include",
        body: formData,
    });
    if (!response.ok) {
        throw new Error('Failed to create comment');
    }
    return response.json();
};

// Mettre a jour un commentaire
export const updateComment = async (commentId, commentData) => {
    const formData = new FormData();
    formData.append("content", commentData.content);

    const response = await fetch(`http://localhost:80/api/comment/${commentId}`, {
        method: "PATCH",
        credentials: "include",
        body: formData,
    });
    if (!response.ok) {
        throw new Error('Failed to update comment');
    }
    return response.json();
};

// Supprimer un commentaire
export const deleteComment = async (commentId) => {
    const response = await fetch(`http://localhost:80/api/comment/${commentId}`, {
        method: "DELETE",
        credentials: "include",
    });
    if (!response.ok) {
        throw new Error('Failed to delete comment');
    }
    return response.json();
};

// Reagir a un commentaire (like/dislike)
export const reactToComment = async (commentId, reaction) => {
    const response = await fetch(`http://localhost:80/api/eventcomment/${commentId}`, {
        method: "POST",
        credentials: "include",
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ event: reaction }),
    });
    if (!response.ok) {
        throw new Error('Failed to react to comment');
    }
    return response.json();
};