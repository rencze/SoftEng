"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:3001/api/auth/login", {
      method: "POST", // 👈 add this
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });


      const data = await res.json();

      if (res.ok) {
        console.log("Login successful:", data);

        // Save token if backend provides it
        if (data.token) {
          localStorage.setItem("token", data.token);
        }

        router.push("/dashboard");
      } else {
        alert("Login failed: " + (data.error || data.message || "Unknown error"));
      }
    } catch (err) {
      console.error("Network error:", err);
      alert("An error occurred. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-sm text-center">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Authentication Login</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            Login
          </button>
        </form>

        {/* Links to Register and Forgot Password */}
        <p className="mt-4 text-gray-600 text-sm">
          Don't have an account?{" "}
          <Link href="/auth/register" className="text-blue-500 hover:underline">
            Register
          </Link>
        </p>
        <p className="mt-1 text-gray-600 text-sm">
          Forgot your password?{" "}
          <Link
            href="/auth/forgot-password"
            className="text-blue-500 hover:underline"
          >
            Reset Password
          </Link>
        </p>
      </div>
    </div>
  );
}

