"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [address, setAddress] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!firstName || !lastName || !username || !email || !password) {
      return alert("Please fill in all required fields");
    }

    try {
      const res = await fetch("http://localhost:3001/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          username,
          email,
          password,
          contactNumber,
          address
        }),
      });

      const data = await res.json();
      if (res.ok) {
        alert("Registration successful!");
        router.push("/auth/login");
      } else {
        alert(data.error || "Registration failed");
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
        <h1 className="text-3xl font-bold mb-8 text-gray-800">Register</h1>

        <form onSubmit={handleRegister} className="space-y-6">

          {/* First Name */}
          <div className="flex flex-col text-left">
            <label htmlFor="firstName" className="text-gray-600 mb-1">First Name</label>
            <input
              type="text"
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Last Name */}
          <div className="flex flex-col text-left">
            <label htmlFor="lastName" className="text-gray-600 mb-1">Last Name</label>
            <input
              type="text"
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Username */}
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

          {/* Email */}
          <div className="flex flex-col text-left">
            <label htmlFor="email" className="text-gray-600 mb-1">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Password */}
          <div className="flex flex-col text-left">
            <label htmlFor="password" className="text-gray-600 mb-1">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>

          {/* Contact Number */}
          <div className="flex flex-col text-left">
            <label htmlFor="contactNumber" className="text-gray-600 mb-1">Contact Number</label>
            <input
              type="text"
              id="contactNumber"
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Address */}
          <div className="flex flex-col text-left">
            <label htmlFor="address" className="text-gray-600 mb-1">Address</label>
            <input
              type="text"
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl shadow-md transition-all"
          >
            Register
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
