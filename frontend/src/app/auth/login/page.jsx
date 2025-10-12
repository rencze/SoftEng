"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:3001/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setModalMessage(data.message || data.error || "Login failed");
        setShowModal(true);
        return;
      }

      if (!data.token || !data.user) {
        setModalMessage("Invalid server response. No token returned.");
        setShowModal(true);
        return;
      }

      // ✅ Store token
      localStorage.setItem("token", data.token);

      // ✅ Standardize user object
      const userData = {
        ...data.user,
        name:
          data.user.name ||
          `${data.user.firstName || ""} ${data.user.lastName || ""}`.trim() ||
          data.user.username ||
          "Unknown",
        id: data.user.id,
        customerId: data.user.customerId || null,
        roleId: data.user.roleId || null,
      };

      // ✅ Save user to AuthContext
      login(userData);

      // ✅ Redirect based on role
      if (userData.roleId === 3) router.push("/landing-page");
      else router.push("/dashboard/owner");

    } catch (err) {
      console.error("Login error:", err);
      setModalMessage("Network error. Please try again.");
      setShowModal(true);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-blue-50">
      <Navbar />

      <div className="flex flex-1 items-center justify-center p-4">
        <div className="bg-white/90 backdrop-blur-sm p-10 rounded-3xl shadow-lg w-full max-w-md text-center mt-20">
          <h1 className="text-3xl font-bold mb-8 text-gray-800">Login</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col text-left">
              <label htmlFor="username" className="text-gray-600 mb-1">Username</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div className="flex flex-col text-left">
              <label htmlFor="password" className="text-gray-600 mb-1">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-md transition-all"
            >
              Login
            </button>
          </form>

          <div className="mt-6 text-gray-600 text-sm space-y-2">
            <p>Don&apos;t have an account? <Link href="/auth/register" className="text-blue-500 hover:underline">Register</Link></p>
            <p>Forgot your password? <Link href="/auth/forgot-password" className="text-blue-500 hover:underline">Reset</Link></p>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg text-center max-w-sm w-full mx-4">
            <h2 className="text-lg font-bold text-red-600">Login Error</h2>
            <p className="mt-2 text-gray-700">{modalMessage}</p>
            <button
              onClick={() => setShowModal(false)}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
