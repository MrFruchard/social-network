"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function SignupForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [first_name, setFirstname] = useState("");
  const [last_name, setLastname] = useState("");
  const [username, setUsername] = useState("");
  const [date_of_birth, setDateOfBirth] = useState("");
  const [avatar, setAvatar] = useState<File | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    if (password.length < 8) {
      alert("Password must be at least 8 characters long");
      return;
    }

    if (
      password === first_name ||
      password === last_name ||
      password === email
    ) {
      alert("Password cannot be the same as your name or email");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:80/api/check/username?username=${username}`,
        {
          method: "GET",
        }
      );
      if (!response.ok) {
        throw new Error("Username already exists");
      } else {
        console.log("Username is available");
      }
    } catch (error) {
      console.error("Error checking username:", error);
      alert("Username already exist");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:80/api/check/email?email=${email}`,
        {
          method: "GET",
        }
      );
      if (!response.ok) {
        throw new Error("Email already exists");
      } else {
        console.log("Email is available");
      }
    } catch (error) {
      console.error("Error checking email:", error);
      alert("Email already exist");
      return;
    }

    var formdata = new FormData();
    formdata.append("email", email);
    formdata.append("password", password);
    formdata.append("first_name", first_name);
    formdata.append("last_name", last_name);
    formdata.append("date_of_birth", date_of_birth);
    if (avatar) {
      formdata.append("avatar", avatar);
    }
    formdata.append("username", username);
    formdata.append("about_me", "{{$lorem.lines}}");

    var requestOptions = {
      method: "POST",
      body: formdata,
      credential: "include",
    };

    try {
      const response = await fetch(
        "http://localhost:80/api/register",
        requestOptions
      );

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("userId", data.id);
        localStorage.setItem("userName", email);

        // Déclencher l'événement de connexion WebSocket
        window.dispatchEvent(new Event("login"));

        router.push("/home");
      } else {
        alert("Signup failed");
      }
    } catch (error) {
      console.log("error", error);
      alert("An error occurred during signup");
    }
  };
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Enter your email below to signup to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="JohnDoe"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="date_of_birth">Date of Birth</Label>
                <Input
                  id="date_of_birth"
                  type="date"
                  required
                  value={date_of_birth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="firstname">Firstname</Label>
                <Input
                  id="firstname"
                  type="text"
                  placeholder="John"
                  required
                  value={first_name}
                  onChange={(e) => setFirstname(e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="Lastname">Lastname</Label>
                <Input
                  id="lastname"
                  type="text"
                  placeholder="Doe"
                  required
                  value={last_name}
                  onChange={(e) => setLastname(e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <a
                    href="#"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="password comfirme">Comfirme Password :</Label>
                <Input
                  id="pw_comfirme"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="avatar">Profile Image (optional)</Label>
                <Input
                  id="avatar"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setAvatar(e.target.files[0]);
                    } else {
                      setAvatar(null);
                    }
                  }}
                />
              </div>
              <Button type="submit" className="w-full">
                Signup
              </Button>

              <Button variant="outline" className="w-full">
                Signup with Google
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              Already SignIn ?{" "}
              <a href="/login" className="underline underline-offset-4">
                Login
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
