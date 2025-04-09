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
    const response = await fetch(`http://localhost:80/api/user/${userId}`, {
        credentials: "include"
    });
    return response.json();
};

export const togglePrivacyStatus = async () => {
    const response = await fetch("http://localhost:80/api/user/public", {
        method: "PATCH",
        credentials: "include"
    });
    return response.json();
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
