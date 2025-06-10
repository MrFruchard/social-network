// Recuperer les groupes pour l'utilisateur connecte
export const fetchHomeGroups = async () => {
    const response = await fetch("http://localhost:80/api/home/groups", {
        credentials: "include",
    });
    if (!response.ok) {
        throw new Error('Failed to fetch group');
    }
    return response.json();
};

// Creer un nouveau groupe
export const createGroup = async (groupData) => {
    const formData = new FormData();
    formData.append("title", groupData.title);
    formData.append("description", groupData.description);
    if (groupData.image) formData.append("image", groupData.image);

    const response = await fetch("http://localhost:80/api/group/create", {
        method: "POST",
        credentials: "include",
        body: formData,
    });
    if (!response.ok) {
        throw new Error('Failed to create group');
    }
    return response.json();
};

// Mettre a jour un groupe
export const updateGroup = async (groupId, groupData) => {
    const formData = new FormData();
    formData.append("title", groupData.title);
    formData.append("description", groupData.description);
    if (groupData.image) formData.append("image", groupData.image);
    formData.append("groupId", groupId);

    const response = await fetch("http://localhost:80/api/group/update", {
        method: "PATCH",
        credentials: "include",
        body: formData,
    });
    if (!response.ok) {
        throw new Error('Failed to update group');
    }
    return response.json();
};

// Supprimer un groupe
export const deleteGroup = async (groupId) => {
    const formData = new FormData();
    formData.append("groupId", groupId);

    const response = await fetch("http://localhost:80/api/group/delete", {
        method: "DELETE",
        credentials: "include",
        body: formData,
    });
    if (!response.ok) {
        throw new Error('Failed to delete group');
    }
    return response.json();
};

// Supprimer un membre du groupe
export const removeGroupMember = async (groupId, userId) => {
    const formData = new FormData();
    formData.append("groupId", groupId);
    formData.append("userId", userId);

    const response = await fetch("http://localhost:80/api/group/member", {
        method: "DELETE",
        credentials: "include",
        body: formData,
    });
    if (!response.ok) {
        throw new Error('Failed to remove group member');
    }
    return response.json();
};

// Demander a rejoindre un groupe
export const askToJoinGroup = async (groupId) => {
    const formData = new FormData();
    formData.append("groupId", groupId);

    const response = await fetch("http://localhost:80/api/group/ask", {
        method: "POST",
        credentials: "include",
        body: formData,
    });
    if (!response.ok) {
        throw new Error('Failed to request joining group');
    }
    return response.json();
};