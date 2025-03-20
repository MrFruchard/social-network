// front/app/lib/auth.ts

export async function loginUser(credentials: string, password: string) {
    const response = await fetch("http://localhost:80/api/login", {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ credentials, password }),
    });

    if (!response.ok) {
        throw new Error("Échec de la connexion");
    }

    return response.json();
}

export async function logoutUser() {
    const response = await fetch("http://localhost:80/api/logout", {
        method: "GET",
        credentials: "include",
    });

    if (!response.ok) {
        throw new Error("Échec de la déconnexion");
    }

    return response.json();
}