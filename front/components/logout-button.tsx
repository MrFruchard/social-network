"use client"

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function LogoutButton() {
    const router = useRouter();

    const handleLogout = async () => {
        const response = await fetch("http://localhost:80/api/logout", {
            method: "GET",
            credentials: 'include',
        });

        if (response.ok) {
            localStorage.removeItem("userId");
            localStorage.removeItem("userName");

            // Déclencher l'événement de déconnexion WebSocket
            window.dispatchEvent(new Event('logout'));

            router.push("/");
        } else {
            alert("Logout failed");
        }
    };

    return (
        <Button onClick={handleLogout} variant="outline">
            Logout
        </Button>
    );
}