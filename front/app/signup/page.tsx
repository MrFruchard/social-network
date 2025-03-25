"use client";

import { SignupForm } from "@/components/signup-form";
import useAuth from "@/hooks/checkAuth";

export default function SignupPage() {
  const { isLoading } = useAuth({
    redirectIfAuthenticated: "/home",
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return <SignupForm />;
}
