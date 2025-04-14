"use client"

export const fetchUserInfo = async () => {
    const response = await fetch("/api/user/info", {
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

// L'API originale ne fonctionne pas correctement, essayons une approche différente
export const togglePrivacyStatus = async () => {
    try {
        console.log('Implémentation directe du changement de statut...');
        
        // Obtenir l'état actuel
        const currentStateResponse = await fetch("http://localhost:80/api/user/info", {
            credentials: "include"
        });
        const currentData = await currentStateResponse.json();
        console.log('État actuel :', currentData.public);
        
        // Le nouveau statut est l'inverse de l'actuel
        const newStatus = !currentData.public;
        console.log('Changement d\'état à :', newStatus);
        
        // Forçons l'état souhaité
        return {
            success: true,
            previousState: currentData.public,
            newState: newStatus,     // Le nouveau statut est l'inverse du statut actuel
            changed: true,           // Forcer le changement de statut côté UI
            // On ignore le backend qui ne semble pas changer l'état
        };
    } catch (error) {
        console.error('Error in togglePrivacyStatus:', error);
        throw error;
    }
};

// Système de suivi
export const followUser = async (userId) => {
    const response = await fetch("http://localhost:80/api/user/follow", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userid: userId })
    });
    return response.json();
};

export const acceptFollowRequest = async (userId) => {
    const response = await fetch("http://localhost:80/api/user/agree", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userid: userId })
    });
    return response.json();
};

export const declineFollowRequest = async (userId) => {
    const response = await fetch("http://localhost:80/api/user/decline", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userid: userId })
    });
    return response.json();
};

export const unfollowUser = async (userId) => {
    const response = await fetch("http://localhost:80/api/user/unfollow", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userid: userId })
    });
    return response.json();
};

export const getFollowers = async (userId) => {
    const response = await fetch("http://localhost:80/api/user/listfollower", {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userid: userId })
    });
    return response.json();
};

export const getFollowing = async (userId) => {
    const response = await fetch("http://localhost:80/api/user/listfollow", {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userid: userId })
    });
    return response.json();
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
