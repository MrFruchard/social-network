import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {LoginForm} from "@/components/login-form";

const Login = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        const response = await fetch("/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
        });

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem("userId", data.id);
            localStorage.setItem("userName", username);
            navigate("/home");
        } else {
            alert("Login failed");
        }
    };
    return (
        <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
            <div className="w-full max-w-sm">
                <LoginForm onSubmit={handleSubmit} />
            </div>
        </div>
    )
}
