"use client"

export const fetchUserInfo = async () => {
    const response = await fetch("http://localhost:80/api/user/info", {
        credentials: "include",
    });
    return response.json();
};


// Authentification
export const registerUser = async (userData) => {
    const response = await fetch("http://localhost:80/api/register", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData)
    });
    return response.json();
};

export const loginUser = async (credentials) => {
    const response = await fetch("http://localhost:80/api/login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials)
    });
    return response.json();
};

export const logoutUser = async () => {
    const response = await fetch("http://localhost:80/api/logout", {
        credentials: "include"
    });
    return response.json();
};

// Profil utilisateur
export const fetchUserProfile = async (userId) => {
    // Si userId n'est pas fourni, récupérer le profil de l'utilisateur connecté
    const url = userId 
        ? `http://localhost:80/api/user/${userId}` 
        : "http://localhost:80/api/user/info";
    
    const response = await fetch(url, {
        credentials: "include"
    });
    
    if (!response.ok) {
        throw new Error(`Failed to fetch profile: ${response.status}`);
    }
    
    return response.json();
};

export const togglePrivacyStatus = async () => {
    try {
        // Envoyer la requête au backend pour changer le statut
        const response = await fetch("http://localhost:80/api/user/public", {
            method: "PATCH",
            credentials: "include"
        });

        if (!response.ok) {
            throw new Error(`Failed to update privacy status: ${response.status}`);
        }

        // Attendre un court délai pour permettre à la base de données de se mettre à jour
        await new Promise(resolve => setTimeout(resolve, 300));
        
        return { success: true };
    } catch (error) {
        console.error("Error in togglePrivacyStatus:", error);
        throw error;
    }
};
// Système de suivi
export const followUser = async (userId) => {
    const response = await fetch(`http://localhost:80/api/user/follow?user=${userId}`, {
        method: "POST",
        credentials: "include"
    });
    return response.ok;
};

export const acceptFollowRequest = async (userId) => {
    const response = await fetch(`http://localhost:80/api/user/agree?user=${userId}`, {
        method: "POST",
        credentials: "include"
    });
    return response.ok;
};

export const declineFollowRequest = async (userId) => {
    const response = await fetch(`http://localhost:80/api/user/decline?user=${userId}`, {
        method: "POST",
        credentials: "include"
    });
    return response.ok;
};

export const unfollowUser = async (userId) => {
    const response = await fetch(`http://localhost:80/api/user/unfollow?user=${userId}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" }
    });
    return response.ok;
};

export const getFollowers = async (userId) => {
    const response = await fetch(`http://localhost:80/api/user/listfollower?user=${userId}`, {
        credentials: "include"
    });
    if (!response.ok) throw new Error('Failed to fetch followers');
    const data = await response.json();
    return data.status === 'success' && Array.isArray(data.followers) ? data.followers : [];
};

export const getFollowing = async (userId) => {
    const response = await fetch(`http://localhost:80/api/user/listfollow?user=${userId}`, {
        credentials: "include"
    });
    if (!response.ok) throw new Error('Failed to fetch following');
    const data = await response.json();
    return data.status === 'success' && Array.isArray(data.follow) ? data.follow : [];
};

export const abortFollowRequest = async (userId) => {
    const response = await fetch(`http://localhost:80/api/user/abort?user=${userId}`, {
        method: "GET",
        credentials: "include"
    });
    return response.ok;
};

// Vérification
export const checkUsernameAvailability = async (username) => {
    const response = await fetch(`http://localhost:80/api/check/username?username=${username}`, {
        credentials: "include"
    });
    return response.status === 200;
};

export const checkEmailAvailability = async (email) => {
    const response = await fetch(`http://localhost:80/api/check/email?email=${email}`, {
        credentials: "include"
    });
    return response.status === 200;
};
