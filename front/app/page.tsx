'use client';

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { LoginForm } from "@/components/login-form";
import { SignupForm } from "@/components/signup-form";
import {Button} from "@/components/ui/button";

export default function LandingPage() {
    const [showModal, setShowModal] = useState(false);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-white text-black px-4">
            <div className="mb-10  text-center">
                <h1 className="text-7xl font-bold text-white inline-block bg-black px-4 py-2 box-decoration-clone">
                    <span>SOCIAL </span>
                    <span className="inline-block transform -scale-x-100">N</span>ETWORK
                </h1>
            </div>
            <LoginForm />

            <div className="w-full max-w-sm flex items-center my-2">
                <hr className="flex-grow border-gray-300" />
                <span className="mx-4 text-gray-400 text-sm">OU</span>
                <hr className="flex-grow border-gray-300" />
            </div>

            <h1 className="text-3xl font-bold mb-4 text-center">Ça se passe maintenant !</h1>
            <p className="text-lg text-gray-600 mb-6 text-center">Inscrivez-vous pour ne rien rater.</p>

            <div className="flex flex-col w-full max-w-sm gap-4">
                <Button
                    onClick={() => setShowModal(true)}
                    className="px-6 py-3 text-lg text-center transition cursor-pointer w-full h-full"
                >
                    Créer un compte
                </Button>
            </div>

            <SignupForm showModal={showModal} setShowModal={setShowModal} />
        </div>
    );
}
