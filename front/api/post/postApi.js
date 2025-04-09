// Récupérer les posts pour le feed principal
export const fetchHomePosts = async () => {
    const response = await fetch("http://localhost:80/api/home/post", {
        credentials: "include",
    });
    if (!response.ok) {
        throw new Error('Failed to fetch home posts');
    }
    return response.json();
};

// Récupérer les posts d'un profil
export const fetchProfilePosts = async (userId) => {
    const response = await fetch(`http://localhost:80/api/profile/${userId}`, {
        credentials: "include",
    });
    if (!response.ok) {
        throw new Error('Failed to fetch profile posts');
    }
    return response.json();
};

// Créer un nouveau post
export const createPost = async (postData) => {
    const formData = new FormData();
    formData.append("content", postData.content);
    if (postData.tags) formData.append("tags", postData.tags);
    if (postData.image) formData.append("image", postData.image);
    if (postData.groupId) formData.append("groupId", postData.groupId);

    const response = await fetch("http://localhost:80/api/posts", {
        method: "POST",
        credentials: "include",
        body: formData,
    });
    if (!response.ok) {
        throw new Error('Failed to create post');
    }
    return response.json();
};

// Mettre à jour un post
export const updatePost = async (postId, postData) => {
    const formData = new FormData();
    formData.append("content", postData.content);
    if (postData.tags) formData.append("tags", postData.tags);
    if (postData.image) formData.append("image", postData.image);

    const response = await fetch(`http://localhost:80/api/post/${postId}`, {
        method: "PATCH",
        credentials: "include",
        body: formData,
    });
    if (!response.ok) {
        throw new Error('Failed to update post');
    }
    return response.json();
};

// Supprimer un post
export const deletePost = async (postId) => {
    const response = await fetch(`http://localhost:80/api/post/${postId}`, {
        method: "DELETE",
        credentials: "include",
    });
    if (!response.ok) {
        throw new Error('Failed to delete post');
    }
    return response.json();
};

// Réagir à un post (like/dislike)
export const reactToPost = async (postId, reaction) => {
    const response = await fetch(`http://localhost:80/api/eventpost/${postId}`, {
        method: "GET",
        credentials: "include",
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ event: reaction }),
    });
    if (!response.ok) {
        throw new Error('Failed to react to post');
    }
    return response.json();
};
