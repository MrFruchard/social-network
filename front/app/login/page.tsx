"use client"

import CheckAuth from "@/hooks/checkAuth";

export default function ProfilePage() {

    CheckAuth();

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Profile Page</h1>
            <p>You are authenticated and can view this protected content!</p>
        </div>
    );
}