//src/app/auth/login
"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleRequestReset = async (e) => {
    e.preventDefault();
    if (!email) return alert("Please enter your email");

    try {
      const res = await fetch("http://localhost:3001/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        setStep(2);
      } else {
        alert(data.message || "Error requesting reset");
      }
    } catch (err) {
      console.error(err);
      alert("Network error");
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) return alert("Please fill in both password fields");
    if (newPassword !== confirmPassword) return alert("Passwords do not match");

    try {
      const res = await fetch("http://localhost:3001/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, newPassword }),
      });

      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        setStep(1);
        setEmail("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        alert(data.message || "Error resetting password");
      }
    } catch (err) {
      console.error(err);
      alert("Network error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50 p-4">
            {/* Temporary Navbar */}
      <header className="w-full bg-white/90 backdrop-blur-sm shadow-md border-b border-gray-200 fixed top-0 left-0 z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800">2LOY Car Aircon</h1>
          <nav>
            <Link
              href="/"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Home
            </Link>
          </nav>
        </div>
      </header>


      <div className="bg-white/90 backdrop-blur-sm p-10 rounded-3xl shadow-lg w-full max-w-md text-center">
        {step === 1 ? (
          <>
            <h1 className="text-3xl font-bold mb-8 text-gray-800">Forgot Password</h1>
            <form onSubmit={handleRequestReset} className="space-y-6">
              <div className="flex flex-col text-left">
                <label htmlFor="email" className="text-gray-600 mb-1">Email</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-md transition-all"
              >
                Request Reset
              </button>
            </form>
          </>
        ) : (
          <>
            <h1 className="text-3xl font-bold mb-8 text-gray-800">Set New Password</h1>
            <form onSubmit={handleResetPassword} className="space-y-6">
              <div className="flex flex-col text-left">
                <label htmlFor="newPassword" className="text-gray-600 mb-1">New Password</label>
                <input
                  type="password"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400"
                />
              </div>
              <div className="flex flex-col text-left">
                <label htmlFor="confirmPassword" className="text-gray-600 mb-1">Confirm Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl shadow-md transition-all"
              >
                Reset Password
              </button>
            </form>
          </>
        )}

        <div className="mt-6 text-gray-600 text-sm space-y-2">
          <p>
            Remembered your password?{" "}
            <Link href="/auth/login" className="text-blue-500 hover:underline">
              Login
            </Link>
          </p>
          <p>
            Don't have an account?{" "}
            <Link href="/auth/register" className="text-blue-500 hover:underline">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
