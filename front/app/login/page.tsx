// front/app/login/page.tsx
"use client";

import { useState } from "react";
import { useAuth } from "@/app/contexts/AuthContext";
import { useRouter } from "next/navigation";

export default function Login() {
  const [credentials, setCredentials] = useState("");
  const [password, setPassword] = useState("");
  const { login, error, loading } = useAuth();
  const router = useRouter();

  const handleLogin = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    await login(credentials, password);

    // Si pas d'erreur après login, rediriger vers la page d'accueil
    if (!error) {
      router.push("/");
    }
  };

  return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="p-6 rounded-lg shadow-lg w-96">
          <h2 className="text-xl font-bold mb-4 text-center">Connexion</h2>

          {error && <p className="text-red-500 text-center">{error}</p>}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-gray-700">Nom d'utilisateur</label>
              <input
                  type="text"
                  value={credentials}
                  onChange={(e) => setCredentials(e.target.value)}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-black"
                  required
              />
            </div>

            <div>
              <label className="block text-gray-700">Mot de passeeeeeeeee</label>
              <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-black"
                  required
              />
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full bg-red-500 text-white p-2 rounded-lg hover:bg-blue-600 transition disabled:bg-blue-300"
            >
              {loading ? "Connexion en cours..." : "Se connecter"}
            </button>
          </form>
        </div>
      </div>
  );
}