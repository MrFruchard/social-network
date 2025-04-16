"use client";

import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-background">
      <div className="max-w-md w-full p-8 bg-card rounded-lg shadow-lg text-center">
        <h1 className="text-3xl font-bold mb-6">Welcome to Social Network</h1>
        <p className="mb-8 text-muted-foreground">Connect with friends and share your moments</p>
        <div className="flex flex-col gap-4">
          <Link 
            href="/login" 
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Log In
          </Link>
          <Link 
            href="/signup" 
            className="px-6 py-3 border border-input rounded-lg hover:bg-accent transition-colors"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}