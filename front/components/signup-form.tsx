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
    about_me: '',
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value, files } = e.target as HTMLInputElement;
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

  const handleNext = () => step < 3 && setStep(step + 1);
  const handleBack = () => step > 1 && setStep(step - 1);

  const handleSubmit = async () => {
    if (!isPasswordValid) return;

    const formData = new FormData();
    formData.append("email", form.email);
    formData.append("password", form.password);
    formData.append("first_name", form.first_name);
    formData.append("last_name", form.last_name);
    formData.append("date_of_birth", form.date_of_birth);
    formData.append("username", form.username);
    formData.append("about_me", form.about_me || "Hello! I'm new here.");
    if (form.avatar) formData.append("avatar", form.avatar);

    try {
      const res = await fetch("http://localhost/api/register", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!res.ok) {
        alert("Échec de l'inscription.");
        return;
      }

      const loginRes = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          credentials: form.username,
          password: form.password,
        }),
      });

      if (!loginRes.ok) {
        alert("Inscription réussie, mais échec de la connexion automatique.");
        return;
      }

      const data = await loginRes.json();
      localStorage.setItem("userId", data.id);
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
      <div className="fixed inset-0 z-50 px-4 flex items-center justify-center backdrop-blur-xs bg-white/30">
        <div className="bg-white w-full max-w-lg min-h-[600px] max-h-[90vh] p-6 relative shadow-lg flex flex-col">
          <button
              onClick={() => setShowModal(false)}
              className="absolute top-2 right-4 text-black w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-200 transition cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="currentColor" className="w-5 h-5">
              <path d="M18.8,16l5.5-5.5c0.8-0.8,0.8-2,0-2.8l0,0C24,7.3,23.5,7,23,7c-0.5,0-1,0.2-1.4,0.6L16,13.2l-5.5-5.5
              c-0.8-0.8-2.1-0.8-2.8,0C7.3,8,7,8.5,7,9.1s0.2,1,0.6,1.4l5.5,5.5l-5.5,5.5C7.3,21.9,7,22.4,7,23c0,0.5,0.2,1,0.6,1.4
              C8,24.8,8.5,25,9,25c0.5,0,1-0.2,1.4-0.6l5.5-5.5l5.5,5.5c0.8,0.8,2.1,0.8,2.8,0c0.8-0.8,0.8-2.1,0-2.8L18.8,16z" />
            </svg>
          </button>

          <div className="mx-auto mb-4">
            <h2 className="text-xl font-bold text-center bg-black text-white px-4 py-2 inline-block">
              {step === 1 && "Création du compte"}
              {step === 2 && "Informations personnelles"}
              {step === 3 && "Sécurité et profil"}
            </h2>
          </div>

          <form
              className="flex-1 overflow-auto space-y-4 pr-1 flex flex-col justify-between"
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit();
              }}
          >
            <div className="flex-1 space-y-4">
              {step === 1 && (
                  <>
                    <div>
                      <label htmlFor="email" className={`block mb-1 ${form.email && !isEmailValid ? "text-red-600" : ""}`}>
                        Email
                      </label>
                      <input
                          id="email"
                          type="email"
                          value={form.email}
                          onChange={handleChange}
                          required
                          className={`w-full border p-2 rounded ${form.email && !isEmailValid ? "border-red-500" : "border-gray-300"}`}
                      />
                      {!isEmailValid && form.email && (
                          <p className="text-sm text-red-600 mt-1">Email déjà utilisé ou invalide.</p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="username" className={`block mb-1 ${form.username && !isUsernameValid ? "text-red-600" : ""}`}>
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
                      <input id="first_name" type="text" value={form.first_name} onChange={handleChange} required className="w-full border p-2 rounded border-gray-300" />
                    </div>
                    <div>
                      <label htmlFor="last_name" className="block mb-1">Nom</label>
                      <input id="last_name" type="text" value={form.last_name} onChange={handleChange} required className="w-full border p-2 rounded border-gray-300" />
                    </div>
                    <div>
                      <label htmlFor="date_of_birth" className="block mb-1">Date de naissance</label>
                      <input id="date_of_birth" type="date" value={form.date_of_birth} onChange={handleChange} required className="w-full border p-2 rounded border-gray-300" />
                    </div>
                  </>
              )}

              {step === 3 && (
                  <>
                    <div>
                      <label htmlFor="password" className={`block mb-1 ${form.password && !isPasswordValid ? "text-red-600" : ""}`}>
                        Mot de passe
                      </label>
                      <input
                          id="password"
                          type="password"
                          value={form.password}
                          onChange={handleChange}
                          required
                          className={`w-full border p-2 rounded ${form.password && !isPasswordValid ? "border-red-500" : "border-gray-300"}`}
                      />
                    </div>
                    <div>
                      <label htmlFor="confirmPassword" className={`block mb-1 ${form.confirmPassword && form.password !== form.confirmPassword ? "text-red-600" : ""}`}>
                        Confirmer le mot de passe
                      </label>
                      <input
                          id="confirmPassword"
                          type="password"
                          value={form.confirmPassword}
                          onChange={handleChange}
                          required
                          className={`w-full border p-2 rounded ${form.confirmPassword && form.password !== form.confirmPassword ? "border-red-500" : "border-gray-300"}`}
                      />
                      {form.confirmPassword && form.password !== form.confirmPassword && (
                          <p className="text-sm text-red-600 mt-1">Les mots de passe ne correspondent pas.</p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="avatar" className="block mb-1">Image de profil (facultatif)</label>
                      <input id="avatar" type="file" accept="image/*" onChange={handleChange} className="w-full border p-2 rounded border-gray-300" />
                    </div>
                    <div>
                      <label htmlFor="about_me" className="block mb-1">Bio (facultatif)</label>
                      <textarea
                          id="about_me"
                          value={form.about_me}
                          onChange={handleChange}
                          rows={3}
                          maxLength={300}
                          placeholder="Parle un peu de toi..."
                          className="w-full border p-2 rounded border-gray-300 resize-none"
                      />
                      <p className="text-sm text-gray-500 text-right">{form.about_me.length}/300</p>
                    </div>
                  </>
              )}
            </div>

            {/* Progress bar */}
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-4">
              <div
                  className="h-full bg-black transition-all duration-500"
                  style={{
                    width: `${(step   / 3) * 100}%`,
                  }}
              />
            </div>


            <div className="flex justify-end mt-4 gap-4">
              {step > 1 && (
                  <button type="button" onClick={handleBack} className="px-4 py-2 border rounded cursor-pointer">
                    Retour
                  </button>
              )}
              {step < 3 ? (
                  <button
                      type="button"
                      onClick={handleNext}
                      disabled={step === 1 && (!isEmailValid || !isUsernameValid)}
                      className={`px-4 py-2 rounded flex items-center gap-2 cursor-pointer ${
                          step === 1 && (!isEmailValid || !isUsernameValid)
                              ? "bg-gray-400 cursor-not-allowed text-white"
                              : "bg-black text-white"
                      }`}
                  >
                    Suivant
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="w-5 h-5">
                      <path d="M6 12H18M18 12L13 7M18 12L13 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
              ) : (
                  <button
                      type="submit"
                      disabled={!isPasswordValid}
                      className={`px-4 py-2 rounded cursor-pointer ${
                          !isPasswordValid ? "bg-gray-400 cursor-not-allowed" : "bg-black text-white"
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