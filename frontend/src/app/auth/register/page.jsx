// src/app/auth/register/page.jsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    phone: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("http://localhost:3001/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setSuccess("Registration successful! Redirecting...");
        
        // Save user data and token
        if (data.token) localStorage.setItem("token", data.token);
        if (data.user) {
          localStorage.setItem("user", JSON.stringify(data.user));
          login(data.user); // Update auth context
        }
        
        // Redirect after a short delay
        setTimeout(() => {
          // Redirect based on roleId (assuming customers get roleId 3)
          const roleId = data.user?.roleId;
          if (roleId === 3) {
            router.push("/customer");
          } else {
            router.push("/dashboard/owner");
          }
        }, 1500);
      } else {
        setError(data.message || "Registration failed. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
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

      {/* Registration Card */}
      <div className="bg-white/90 backdrop-blur-sm p-8 rounded-3xl shadow-lg w-full max-w-md text-center mt-16">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Create Account</h1>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col text-left">
              <label htmlFor="firstName" className="text-gray-600 mb-1 text-sm">First Name</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div className="flex flex-col text-left">
              <label htmlFor="lastName" className="text-gray-600 mb-1 text-sm">Last Name</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          </div>

          <div className="flex flex-col text-left">
            <label htmlFor="username" className="text-gray-600 mb-1 text-sm">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div className="flex flex-col text-left">
            <label htmlFor="email" className="text-gray-600 mb-1 text-sm">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div className="flex flex-col text-left">
            <label htmlFor="phone" className="text-gray-600 mb-1 text-sm">Phone Number</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div className="flex flex-col text-left">
            <label htmlFor="password" className="text-gray-600 mb-1 text-sm">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div className="flex flex-col text-left">
            <label htmlFor="confirmPassword" className="text-gray-600 mb-1 text-sm">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-xl shadow-md transition-all"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <div className="mt-6 text-gray-600 text-sm space-y-2">
          <p>
            Already have an account?{" "}
            <Link href="/auth/login" className="text-blue-500 hover:underline">
              Login
            </Link>
          </p>
          <p>
            Forgot your password?{" "}
            <Link href="/auth/forgot-password" className="text-blue-500 hover:underline">
              Reset
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}



// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import Link from "next/link";

// export default function RegisterPage() {
//   const router = useRouter();
//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");

//   const handleRegister = async (e) => {
//     e.preventDefault();
//     if (!name || !email || !password) {
//       return alert("Please fill in all fields");
//     }

//     try {
//       const res = await fetch("http://localhost:3001/api/auth/register", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ username: name, email, password }),
//       });

//       const data = await res.json();
//       if (res.ok) {
//         alert("Registration successful!");
//         router.push("/auth/login");
//       } else {
//         alert(data.error || "Registration failed");
//       }
//     } catch (err) {
//       console.error(err);
//       alert("Network error");
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-blue-50 p-4">
//       <div className="bg-white/90 backdrop-blur-sm p-10 rounded-3xl shadow-lg w-full max-w-md text-center">
//         <h1 className="text-3xl font-bold mb-8 text-gray-800">Register</h1>

//         <form onSubmit={handleRegister} className="space-y-6">
//           <div className="flex flex-col text-left">
//             <label htmlFor="name" className="text-gray-600 mb-1">Full Name</label>
//             <input
//               type="text"
//               id="name"
//               value={name}
//               onChange={(e) => setName(e.target.value)}
//               required
//               className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
//             />
//           </div>

//           <div className="flex flex-col text-left">
//             <label htmlFor="email" className="text-gray-600 mb-1">Email</label>
//             <input
//               type="email"
//               id="email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               required
//               className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
//             />
//           </div>

//           <div className="flex flex-col text-left">
//             <label htmlFor="password" className="text-gray-600 mb-1">Password</label>
//             <input
//               type="password"
//               id="password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               required
//               minLength={6}
//               className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400"
//             />
//           </div>

//           <button
//             type="submit"
//             className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl shadow-md transition-all"
//           >
//             Register
//           </button>
//         </form>

//         <div className="mt-6 text-gray-600 text-sm space-y-2">
//           <p>
//             Already have an account?{" "}
//             <Link href="/auth/login" className="text-blue-500 hover:underline">
//               Login
//             </Link>
//           </p>
//           <p>
//             Forgot your password?{" "}
//             <Link href="/auth/forgot-password" className="text-blue-500 hover:underline">
//               Reset
//             </Link>
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }
