'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";

interface SignupFormProps {
  showModal: boolean;
  setShowModal: (val: boolean) => void;
}

export function SignupForm({ showModal, setShowModal }: SignupFormProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);

  const [form, setForm] = useState({
    email: '',
    username: '',
    first_name: '',
    last_name: '',
    date_of_birth: '',
    password: '',
    confirmPassword: '',
    avatar: null as File | null,
  });

  const [isUsernameValid, setIsUsernameValid] = useState(false);
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [usernameTimeout, setUsernameTimeout] = useState<NodeJS.Timeout | null>(null);
  const [emailTimeout, setEmailTimeout] = useState<NodeJS.Timeout | null>(null);

  const isPasswordValid =
      form.password.length >= 8 &&
      form.password !== form.email &&
      form.password !== form.first_name &&
      form.password !== form.last_name &&
      form.password === form.confirmPassword;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value, files } = e.target;
    setForm((prev) => ({
      ...prev,
      [id]: files ? files[0] : value,
    }));

    if (id === "username") {
      setIsUsernameValid(false);
      if (usernameTimeout) clearTimeout(usernameTimeout);
      const timeout = setTimeout(async () => {
        try {
          const res = await fetch(`/api/check/username?username=${value}`);
          setIsUsernameValid(res.ok);
        } catch {
          setIsUsernameValid(false);
        }
      }, 500);
      setUsernameTimeout(timeout);
    }

    if (id === "email") {
      setIsEmailValid(false);
      if (emailTimeout) clearTimeout(emailTimeout);
      const timeout = setTimeout(async () => {
        try {
          const res = await fetch(`/api/check/email?email=${value}`);
          setIsEmailValid(res.ok);
        } catch {
          setIsEmailValid(false);
        }
      }, 500);
      setEmailTimeout(timeout);
    }
  };

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    if (!isPasswordValid) return;

    const formData = new FormData();
    formData.append("email", form.email);
    formData.append("password", form.password);
    formData.append("first_name", form.first_name);
    formData.append("last_name", form.last_name);
    formData.append("date_of_birth", form.date_of_birth);
    formData.append("username", form.username);
    formData.append("about_me", "Hello! I'm new here.");
    if (form.avatar) formData.append("avatar", form.avatar);

    try {
      const res = await fetch("http://localhost:80/api/register", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!res.ok) {
        alert("Échec de l'inscription.");
        return;
      }

      // ✅ Connexion automatique après inscription réussie
      const loginRes = await fetch("http://localhost:80/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          credentials: form.username, // ou form.username selon ton API
          password: form.password,
        }),
      });

      if (!loginRes.ok) {
        alert("Inscription réussie, mais échec de la connexion automatique.");
        return;
      }

      const data = await loginRes.json();
      localStorage.setItem("userId", data.id); // ✅ si `id` est renvoyé
      localStorage.setItem("userName", data.username || form.username);
      window.dispatchEvent(new Event("login"));

      router.push("/home");
    } catch (error) {
      alert("Une erreur s'est produite pendant l'inscription.");
      console.error(error);
    }
  };

  if (!showModal) return null;

  return (
      <div className="fixed inset-0 z-50 px-4 flex items-center justify-center backdrop-blur-sm bg-white/30">
        <div className="bg-white w-full max-w-lg p-6 rounded-md relative shadow-lg">
          <button
              onClick={() => setShowModal(false)}
              className="absolute top-2 right-4 text-gray-500 text-xl"
          >
            ×
          </button>
          <h2 className="text-xl font-bold mb-4 text-center">
            Inscription – Étape {step}/3
          </h2>
          <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit();
              }}
          >
            {step === 1 && (
                <>
                  <div>
                    <label
                        htmlFor="email"
                        className={`block mb-1 ${form.email && !isEmailValid ? "text-red-600" : ""}`}
                    >
                      Email
                    </label>
                    <input
                        id="email"
                        type="email"
                        value={form.email}
                        onChange={handleChange}
                        required
                        className={`w-full border p-2 rounded ${
                            form.email && !isEmailValid ? "border-red-500" : "border-gray-300"
                        }`}
                    />
                    {!isEmailValid && form.email && (
                        <p className="text-sm text-red-600 mt-1">Email déjà utilisé ou invalide.</p>
                    )}
                  </div>
                  <div>
                    <label
                        htmlFor="username"
                        className={`block mb-1 ${form.username && !isUsernameValid ? "text-red-600" : ""}`}
                    >
                      Nom d'utilisateur
                    </label>
                    <input
                        id="username"
                        type="text"
                        value={form.username}
                        onChange={handleChange}
                        required
                        className={`w-full border p-2 rounded transition-colors duration-200 ${
                            form.username
                                ? isUsernameValid
                                    ? "border-green-500 border-2 focus:border-green-500"
                                    : "border-red-500 focus:border-red-500"
                                : "border-gray-300 focus:border-black"
                        }`}
                    />
                    {!isUsernameValid && form.username && (
                        <p className="text-sm text-red-600 mt-1">Nom d'utilisateur déjà pris.</p>
                    )}
                  </div>
                </>
            )}

            {step === 2 && (
                <>
                  <div>
                    <label htmlFor="first_name" className="block mb-1">Prénom</label>
                    <input
                        id="first_name"
                        type="text"
                        value={form.first_name}
                        onChange={handleChange}
                        required
                        className="w-full border p-2 rounded border-gray-300"
                    />
                  </div>
                  <div>
                    <label htmlFor="last_name" className="block mb-1">Nom</label>
                    <input
                        id="last_name"
                        type="text"
                        value={form.last_name}
                        onChange={handleChange}
                        required
                        className="w-full border p-2 rounded border-gray-300"
                    />
                  </div>
                  <div>
                    <label htmlFor="date_of_birth" className="block mb-1">Date de naissance</label>
                    <input
                        id="date_of_birth"
                        type="date"
                        value={form.date_of_birth}
                        onChange={handleChange}
                        required
                        className="w-full border p-2 rounded border-gray-300"
                    />
                  </div>
                </>
            )}

            {step === 3 && (
                <>
                  <div>
                    <label
                        htmlFor="password"
                        className={`block mb-1 ${form.password && !isPasswordValid ? "text-red-600" : ""}`}
                    >
                      Mot de passe
                    </label>
                    <input
                        id="password"
                        type="password"
                        value={form.password}
                        onChange={handleChange}
                        required
                        className={`w-full border p-2 rounded ${
                            form.password && !isPasswordValid ? "border-red-500" : "border-gray-300"
                        }`}
                    />
                  </div>
                  <div>
                    <label
                        htmlFor="confirmPassword"
                        className={`block mb-1 ${form.confirmPassword && form.password !== form.confirmPassword ? "text-red-600" : ""}`}
                    >
                      Confirmer le mot de passe
                    </label>
                    <input
                        id="confirmPassword"
                        type="password"
                        value={form.confirmPassword}
                        onChange={handleChange}
                        required
                        className={`w-full border p-2 rounded ${
                            form.confirmPassword && form.password !== form.confirmPassword
                                ? "border-red-500"
                                : "border-gray-300"
                        }`}
                    />
                    {form.confirmPassword && form.password !== form.confirmPassword && (
                        <p className="text-sm text-red-600 mt-1">Les mots de passe ne correspondent pas.</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="avatar" className="block mb-1">Image de profil (facultatif)</label>
                    <input
                        id="avatar"
                        type="file"
                        accept="image/*"
                        onChange={handleChange}
                        className="w-full border p-2 rounded border-gray-300"
                    />
                  </div>
                </>
            )}

            <div className="flex justify-between mt-6">
              {step > 1 && (
                  <button type="button" onClick={handleBack} className="px-4 py-2 border rounded">
                    Retour
                  </button>
              )}
              {step < 3 ? (
                  <button
                      type="button"
                      onClick={handleNext}
                      disabled={step === 1 && (!isEmailValid || !isUsernameValid)}
                      className={`px-4 py-2 rounded ${
                          step === 1 && (!isEmailValid || !isUsernameValid)
                              ? "bg-gray-400 cursor-not-allowed"
                              : "bg-black text-white"
                      }`}
                  >
                    Suivant
                  </button>
              ) : (
                  <button
                      type="submit"
                      disabled={!isPasswordValid}
                      className={`px-4 py-2 rounded ${
                          !isPasswordValid ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 text-white"
                      }`}
                  >
                    Valider
                  </button>
              )}
            </div>
          </form>
        </div>
      </div>
  );
}