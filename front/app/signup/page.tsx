"use client";

import { useAuth } from "@/hooks/checkAuth";
import { SignupForm } from "@/components/signup-form";

export default function SignupPage() {
  const { isLoading } = useAuth({
    redirectIfAuthenticated: "/home",
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return <SignupForm />;
}
