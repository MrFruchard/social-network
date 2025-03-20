"use client";

import { useState } from "react";

export default function Login() {
  const [credentials, setCredentials] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null); // Réinitialise l'erreur

    try {
      const response = await fetch("http://localhost:80/api/login", {
        method: "POST",
        credentials: "include", // Envoie les cookies et accepte ceux de la réponse
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ credentials: credentials, password: password }),
      });

      if (!response.ok) {
        throw new Error("Échec de la connexion");
      }

      const data = await response.json();
      console.log("Connexion réussie", data);
      const ws = new WebSocket("ws://localhost:80/api/ws");

      ws.onopen = () => {
        console.log("✅ WebSocket connection opened");
      };

      ws.onerror = (error) => {
        console.error("❌ WebSocket error:", error);
      };

      ws.onclose = (event) => {
        console.warn("⚠️ WebSocket closed:", event);
      };
    } catch (err) {
      setError(err.message);
    }
  };

  return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="bg-white p-6 rounded-lg shadow-lg w-96">
          <h2 className="text-xl font-bold mb-4 text-center">Connexion</h2>

          {error && <p className="text-red-500 text-center">{error}</p>}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-gray-700">Nom d'utilisateur</label>
              <input
                  type="text"
                  value={credentials}
                  onChange={(e) => setCredentials(e.target.value)}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
              />
            </div>

            <div>
              <label className="block text-gray-700">Mot de passe</label>
              <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
              />
            </div>

            <button
                type="submit"
                className="w-full bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition"
            >
              Se connecter
            </button>
          </form>
        </div>
      </div>
  );
}