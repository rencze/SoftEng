"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // 🔹 Modal state
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

    if (res.ok) {
      // Clear old localStorage
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // Save new token and user
      if (data.token) localStorage.setItem("token", data.token);
      if (data.user) localStorage.setItem("user", JSON.stringify(data.user));

      // Redirect based on roleId
      const roleId = data.user?.roleId;
      if (roleId === 3) {
        router.push("/customer"); // Customer
      } else {
        router.push("/dashboard/owner"); // Owner and Technician temporarily
      }
    } else if (res.status === 403) {
      // Blocked user
      setModalMessage(data.message || "You have been blocked. Please contact support.");
      setShowModal(true);
    } else {
      // Wrong password or other errors
      setModalMessage(data.error || data.message || "Login failed");
      setShowModal(true);
    }
  } catch (err) {
    console.error(err);
    setModalMessage("Network error. Please try again.");
    setShowModal(true);
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


       {/* Login Card */}
      <div className="bg-white/90 backdrop-blur-sm p-10 rounded-3xl shadow-lg w-full max-w-md text-center">
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
          <p>
            Don't have an account?{" "}
            <Link href="/auth/register" className="text-blue-500 hover:underline">
              Register
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

      {/* 🔹 Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50">
          <div className="bg-white p-6 rounded-xl shadow-lg text-center max-w-sm w-full">
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























// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import Link from "next/link";

// export default function LoginPage() {
//   const router = useRouter();
//   const [username, setUsername] = useState("");
//   const [password, setPassword] = useState("");

//   // 🔹 Modal state
//   const [showModal, setShowModal] = useState(false);
//   const [modalMessage, setModalMessage] = useState("");

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const res = await fetch("http://localhost:3001/api/auth/login", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ username, password }),
//       });
//       const data = await res.json();

//       if (res.ok) {
//         // 🔹 Clear old localStorage
//         localStorage.removeItem("token");
//         localStorage.removeItem("user");

//         // 🔹 Save new token and user
//         if (data.token) localStorage.setItem("token", data.token);
//         if (data.user) localStorage.setItem("user", JSON.stringify(data.user));

//         // Redirect based on role or default
//         router.push("/dashboard/owner");
//       } else if (res.status === 403) {
//         // 🔹 Blocked user
//         setModalMessage(data.message || "You have been blocked. Please contact support.");
//         setShowModal(true);
//       } else {
//         // 🔹 Wrong password or other errors
//         setModalMessage(data.error || data.message || "Login failed");
//         setShowModal(true);
//       }
//     } catch (err) {
//       console.error(err);
//       setModalMessage("Network error. Please try again.");
//       setShowModal(true);
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-blue-50 p-4">
//       <div className="bg-white/90 backdrop-blur-sm p-10 rounded-3xl shadow-lg w-full max-w-md text-center">
//         <h1 className="text-3xl font-bold mb-8 text-gray-800">Login</h1>

//         <form onSubmit={handleSubmit} className="space-y-6">
//           <div className="flex flex-col text-left">
//             <label htmlFor="username" className="text-gray-600 mb-1">Username</label>
//             <input
//               type="text"
//               id="username"
//               value={username}
//               onChange={(e) => setUsername(e.target.value)}
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
//               className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
//             />
//           </div>

//           <button
//             type="submit"
//             className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-md transition-all"
//           >
//             Login
//           </button>
//         </form>

//         <div className="mt-6 text-gray-600 text-sm space-y-2">
//           <p>
//             Don't have an account?{" "}
//             <Link href="/auth/register" className="text-blue-500 hover:underline">
//               Register
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

//       {/* 🔹 Modal */}
//       {showModal && (
//         <div className="fixed inset-0 flex items-center justify-center bg-black/50">
//           <div className="bg-white p-6 rounded-xl shadow-lg text-center max-w-sm w-full">
//             <h2 className="text-lg font-bold text-red-600">Login Error</h2>
//             <p className="mt-2 text-gray-700">{modalMessage}</p>
//             <button
//               onClick={() => setShowModal(false)}
//               className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//             >
//               OK
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
